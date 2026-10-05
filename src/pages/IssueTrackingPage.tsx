import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Share2, 
  Paperclip, 
  Eye, 
  Camera,
  Check, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  X, 
  Wrench, 
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import type { 
  MaintenanceReport, 
  ReportTimelineEvent, 
  FacilitiesNote, 
  ReportMessage,
  ReportStatus 
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import type { NavRoute } from '../components/layout/Sidebar';

interface IssueTrackingPageProps {
  reportId?: string;
  onRouteChange: (route: NavRoute) => void;
}

export const IssueTrackingPage: React.FC<IssueTrackingPageProps> = ({ 
  reportId, 
  onRouteChange 
}) => {
  const { user } = useAuth();
  
  // Instant initial reports & target from cache (0ms load time)
  const initialReports = user ? db.getReportsSync(user.id) : db.getReportsSync();
  const initialTargetId = reportId || (initialReports.length > 0 ? (initialReports.find(r => r.status === 'In Progress' || r.status === 'Reported')?.id || initialReports[0].id) : undefined);
  const initialReport = initialTargetId ? (initialReports.find(r => r.id === initialTargetId || r.request_id === initialTargetId) || initialReports[0] || null) : (initialReports[0] || null);

  const [report, setReport] = useState<MaintenanceReport | null>(initialReport);
  const [timeline, setTimeline] = useState<ReportTimelineEvent[]>(() => initialReport ? db.getTimelineSync(initialReport.id, initialReport.request_id) : []);
  const [notes, setNotes] = useState<FacilitiesNote[]>(() => initialReport ? db.getFacilitiesNotesSync(initialReport.id, initialReport.request_id) : []);
  const [messages, setMessages] = useState<ReportMessage[]>(() => initialReport ? db.getMessagesSync(initialReport.id, initialReport.request_id) : []);
  const [loading, setLoading] = useState<boolean>(!initialReport);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<MaintenanceReport[]>(initialReports);
  const [activeReportId, setActiveReportId] = useState<string | undefined>(initialTargetId);

  // Form states
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string | null>(null);
  const [attachedPhotoName, setAttachedPhotoName] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [fullImageViewer, setFullImageViewer] = useState<string | null>(null);
  const [unresolvedFeedback, setUnresolvedFeedback] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');

  // Deduplicate timeline milestones so each status appears strictly once (never multiple acknowledges or resolved)
  const deduplicatedTimeline = React.useMemo(() => {
    const seen = new Set<string>();
    const result: ReportTimelineEvent[] = [];
    const sorted = [...timeline].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const event of sorted) {
      const key = event.status.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(event);
      }
    }
    return result;
  }, [timeline]);

  const loadReportData = async (preferredId?: string) => {
    if (!user) return;
    try {
      // Only display spinner if we don't have a report cached yet
      if (!report) setLoading(true);
      setErrorMsg(null);

      // Load all reports for this user
      const reports = await db.getReports(user.id);
      setUserReports(reports);

      // Determine target report directly from reports list without extra round-trip
      const targetId = preferredId || activeReportId || reportId;
      let rep: MaintenanceReport | null = null;
      if (targetId && reports.length > 0) {
        rep = reports.find(r => r.id === targetId || r.request_id === targetId) || null;
      }
      if (!rep && reports.length > 0) {
        rep = reports.find(r => r.status === 'In Progress' || r.status === 'Reported') || reports[0];
      }

      if (!rep) {
        setReport(null);
        setErrorMsg(null);
        setLoading(false);
        return;
      }

      setReport(rep);
      setActiveReportId(rep.id);

      // Fetch timeline, facilities notes, and messages in parallel in the background
      const [tl, nt, msg] = await Promise.all([
        db.getTimeline(rep.id, rep.request_id),
        db.getFacilitiesNotes(rep.id, rep.request_id),
        db.getMessages(rep.id, rep.request_id)
      ]);
      setTimeline(tl);
      setNotes(nt);
      setMessages(msg);
    } catch (err) {
      console.error('Issue tracking load error:', err);
      try {
        const reports = db.getReportsSync(user.id);
        if (reports.length > 0) {
          const rep = reports[0];
          setReport(rep);
          setActiveReportId(rep.id);
          setTimeline(db.getTimelineSync(rep.id, rep.request_id));
          setNotes(db.getFacilitiesNotesSync(rep.id, rep.request_id));
          setMessages(db.getMessagesSync(rep.id, rep.request_id));
          setErrorMsg(null);
          return;
        }
      } catch {
        // ignore
      }
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveReportId(reportId);
    loadReportData(reportId);
  }, [reportId, user]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be less than 10MB.');
      return;
    }

    try {
      setUploadingAttachment(true);
      setAttachedPhotoName(file.name);
      const res = await db.uploadPhoto(file);
      if (res.url) {
        setAttachedPhotoUrl(res.url);
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !user || (!newMessage.trim() && !attachedPhotoUrl)) return;

    try {
      setSendingMessage(true);
      const sent = await db.sendMessage({
        report_id: report.id,
        user_id: user.id,
        sender_name: user.full_name,
        message: newMessage.trim() || 'Attached new photo for facilities inspection',
        attachment_url: attachedPhotoUrl || null,
      });
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      setAttachedPhotoUrl(null);
      setAttachedPhotoName(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (newStatus: ReportStatus, noteText?: string) => {
    if (!report) return;
    try {
      setLoading(true);
      const updated = await db.updateReportStatus(report.id, newStatus, noteText);
      setReport(updated);
      await loadReportData();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async () => {
    await handleStatusChange('Confirmed', 'Resident confirmed issue resolution.');
  };

  const handleReportStillUnresolved = async () => {
    if (!feedbackNote.trim()) {
      setUnresolvedFeedback(true);
      return;
    }
    await handleStatusChange('In Progress', `Resident flagged still unresolved: "${feedbackNote.trim()}"`);
    setUnresolvedFeedback(false);
    setFeedbackNote('');
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#203136] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-3 font-medium">Loading issue tracking details...</p>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {errorMsg ? 'Access Denied or Not Found' : 'No Reports to Track'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {errorMsg || 'You do not have any active maintenance reports to track right now.'}
          </p>
        </div>
        <button
          onClick={() => onRouteChange('home')}
          className="px-4 py-2 bg-[#203136] text-white text-sm font-semibold rounded-xl hover:bg-[#18262A] transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {report.title}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-[#64748B] mt-1">
            {report.category} • Flat {user?.unit_number || '402'} • <span className="font-semibold text-[#1E293B]">#{report.request_id}</span>
          </p>
        </div>

        {/* Right Status Badge & Share */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StatusBadge status={report.status} />
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: report.title, text: `FixTrack report #${report.request_id}` });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Report link copied to clipboard!');
              }
            }}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Share report"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ticket Quick Switcher Tabs */}
      {userReports.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Switch Ticket:</span>
          <div className="flex items-center gap-2 flex-nowrap">
            {userReports.map(r => {
              const isSelected = report?.id === r.id || report?.request_id === r.request_id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveReportId(r.id);
                    loadReportData(r.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#203136] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold">#{r.request_id}</span>
                  <span className="truncate max-w-[140px]">{r.title}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    r.status === 'In Progress' ? 'bg-amber-400' :
                    r.status === 'Resolved' ? 'bg-blue-400' :
                    r.status === 'Confirmed' ? 'bg-emerald-400' : 'bg-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Facilities Demo Control Panel (for testing status workflow) */}
      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#475569]">
          <Wrench className="w-4 h-4 text-[#D97706]" />
          <span className="font-semibold text-[#1E293B]">Facility Operations Control:</span>
          <span>Simulate dispatch & technician updates for this ticket</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleStatusChange('Acknowledged', 'Facilities Desk assigned priority triage.')}
            className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer ${
              report.status === 'Acknowledged' ? 'bg-[#203136] text-white border-[#203136]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Acknowledge
          </button>
          <button
            onClick={() => handleStatusChange('In Progress', 'Specialist plumber dispatched with equipment.')}
            className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer ${
              report.status === 'In Progress' ? 'bg-[#203136] text-white border-[#203136]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange('Resolved', 'Plumbing valve replaced and pressure tested.')}
            className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer ${
              report.status === 'Resolved' ? 'bg-[#203136] text-white border-[#203136]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Mark Resolved
          </button>
          <button
            onClick={() => handleStatusChange('Confirmed', 'Resident verified resolution.')}
            className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer ${
              report.status === 'Confirmed' ? 'bg-[#203136] text-white border-[#203136]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Confirmed
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Photo & Timeline) | Right Column (Facilities Notes & Messages) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Photo Attached by Resident */}
          {(() => {
            const attachedPhoto = report.photo_url || '/assets/pipe_leak_attached.jpg';
            return (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAECF0] shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8B9AA0] uppercase tracking-wider">
                  <div className="flex items-center gap-2 text-[#475569]">
                    <Paperclip className="w-4 h-4 text-[#64748B]" />
                    <span>PHOTO ATTACHED BY RESIDENT</span>
                  </div>
                  <span>
                    {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Photo Frame */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group">
                  <img 
                    src={attachedPhoto} 
                    alt="Issue attachment" 
                    className="w-full h-56 sm:h-72 object-cover transition-transform duration-300 group-hover:scale-102"
                  />

                  {/* Bottom Overlay Pill Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-white/90" />
                      <span>IMG_0842.HEIC</span>
                    </div>

                    <button
                      onClick={() => setFullImageViewer(attachedPhoto)}
                      className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#0F172A] text-xs font-semibold backdrop-blur-md shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View full size</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Resident Resolution Confirmation Banner (when status is Resolved) */}
          {report.status === 'Resolved' && (
            <div className="p-6 rounded-3xl bg-[#EFF6FF] border border-[#BFDBFE] shadow-sm space-y-4 animate-modal-pop">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E3A8A]">
                    Issue Marked as Resolved
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1E40AF] mt-0.5">
                    Facilities has completed the repair work. Has this issue been fixed to your satisfaction?
                  </p>
                </div>
              </div>

              {unresolvedFeedback ? (
                <div className="space-y-3 pt-2">
                  <textarea
                    rows={2}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Describe what is still not working so facilities can re-inspect..."
                    className="w-full p-3 rounded-xl bg-white border border-blue-200 text-xs text-slate-900 focus:outline-hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReportStillUnresolved}
                      className="px-4 py-2 bg-[#DC2626] text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Submit Re-inspection Request
                    </button>
                    <button
                      onClick={() => setUnresolvedFeedback(false)}
                      className="px-3 py-2 bg-white text-slate-600 text-xs font-medium rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleConfirmResolution}
                    className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Confirm resolution</span>
                  </button>

                  <button
                    onClick={() => setUnresolvedFeedback(true)}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-[#475569] hover:text-[#DC2626] hover:border-red-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Report still unresolved
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Card 2: Ticket Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAECF0] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Ticket Timeline</h3>
                <p className="text-xs text-[#64748B]">Live updates from facilities dispatch</p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                SLA: ON TRACK
              </span>
            </div>

            {/* Vertical Timeline List */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {deduplicatedTimeline.map((event) => {
                const isResolvedOrConfirmed = event.status === 'Resolved' || event.status === 'Confirmed';
                const isInProgress = event.status === 'In Progress';

                return (
                  <div key={event.id} className="relative group">
                    {/* Bullet Indicator */}
                    <div className={`
                      absolute -left-[23px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white
                      ${isResolvedOrConfirmed 
                        ? 'bg-[#10B981] text-white' 
                        : isInProgress 
                        ? 'bg-[#D97706] text-white animate-pulse' 
                        : 'bg-[#059669] text-white'
                      }
                    `}>
                      {isResolvedOrConfirmed || event.status === 'Reported' || event.status === 'Acknowledged' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Timeline Event Card Content */}
                    <div className={`
                      rounded-2xl p-4 transition-all
                      ${isInProgress 
                        ? 'bg-[#FFFBEB] border border-[#FDE68A] shadow-2xs' 
                        : 'bg-[#F8FAFC] border border-[#EAECF0]'
                      }
                    `}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0F172A]">
                            {event.title}
                          </span>
                          <span className="text-xs text-[#8B9AA0]">
                            • {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isInProgress && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#B45309]">
                            Active Milestone
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#475569] mt-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Actor Information if present */}
                      {event.actor_name && (
                        <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-slate-200/60">
                          <div className="w-7 h-7 rounded-full bg-[#203136] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {event.actor_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="text-xs font-semibold text-[#0F172A]">
                            {event.actor_name}
                            <span className="text-[#64748B] font-normal ml-1">
                              - {event.actor_role || 'Technician'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Facilities Notes & Messaging (5 cols) */}
        <div className="lg:col-span-5">
          {/* Card: Facilities Notes */}
          <div className="bg-[#F1F4F1] rounded-3xl p-6 sm:p-7 border border-[#EAECF0] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0F172A]">
                <MessageSquare className="w-5 h-5 text-[#475569]" />
                <h3 className="text-base font-bold">Facilities notes</h3>
              </div>

              <span className="text-xs font-semibold text-[#8B9AA0] uppercase tracking-wider">
                {notes.length} NOTES
              </span>
            </div>

            {/* Notes List */}
            <div className="space-y-3.5">
              {notes.map((note, idx) => (
                <div key={note.id} className="p-4 rounded-2xl bg-white border border-[#EAECF0]/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${
                        idx === 0 ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#E2E8F0] text-[#475569]'
                      }`}>
                        {note.author_name[0] || 'R'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">
                          {note.author_name}
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          {note.author_role}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#8B9AA0]">
                      {idx === 0 ? 'Today, 2:10 pm' : '22 Sep, 3:45 pm'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                    "{note.note}"
                  </p>

                  {note.action_label && (
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide uppercase ${
                      idx === 0 
                        ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]' 
                        : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                    }`}>
                      {note.action_label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Resident Previous Messages */}
            {messages.length > 0 && (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {messages.map(m => (
                  <div key={m.id} className="p-3 rounded-2xl bg-white border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                      <span>{m.sender_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{m.message}</p>
                    {m.attachment_url && (
                      <div className="pt-1">
                        <img 
                          src={m.attachment_url} 
                          alt="Message attachment" 
                          onClick={() => setFullImageViewer(m.attachment_url || null)}
                          className="h-16 w-16 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-85 transition-opacity shadow-2xs"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Click photo to zoom</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-slate-200/60">
              <label className="text-xs font-bold text-[#475569] block">
                Add message for Facilities
              </label>

              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />

              <textarea
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="e.g. Please ring buzzer twice if I am not answering..."
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E2E8F0] text-xs sm:text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all placeholder:text-slate-400"
              />

              {/* Uploading Status */}
              {uploadingAttachment && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span>Uploading photo...</span>
                </div>
              )}

              {/* Attached Photo Preview */}
              {attachedPhotoUrl && (
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={attachedPhotoUrl} 
                      alt="Attachment preview" 
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {attachedPhotoName || 'Photo attached'}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Ready to attach</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedPhotoUrl(null);
                      setAttachedPhotoName(null);
                      if (photoInputRef.current) photoInputRef.current.value = '';
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{attachedPhotoUrl ? 'Change photo' : 'Add another photo'}</span>
                </button>

                <button
                  type="submit"
                  disabled={sendingMessage || (!newMessage.trim() && !attachedPhotoUrl)}
                  className="px-5 py-2.5 rounded-xl bg-[#203136] text-white text-xs font-bold hover:bg-[#18262A] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {sendingMessage ? 'Sending...' : 'Send Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Full Size Image Lightbox Modal via Portal for 100% Screen Blur */}
      {fullImageViewer && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setFullImageViewer(null)}
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-zoom-out"
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button
              onClick={() => setFullImageViewer(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={fullImageViewer} 
              alt="Full size attachment" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
