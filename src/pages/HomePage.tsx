import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  FileText, 
  Clock, 
  Wrench, 
  Check, 
  ArrowRight, 
  Droplet, 
  SlidersHorizontal,
  ChevronDown,
  Inbox,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, subscribeToDatabase } from '../lib/supabase';
import type { MaintenanceReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import type { NavRoute } from '../components/layout/Sidebar';

interface HomePageProps {
  onRouteChange: (route: NavRoute, reportId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRouteChange }) => {
  const { user } = useAuth();
  // Instant synchronous cache hydration (0ms initial load time)
  const [reports, setReports] = useState<MaintenanceReport[]>(() => 
    user ? db.getReportsSync(user.id) : db.getReportsSync()
  );
  const [loading, setLoading] = useState<boolean>(() => reports.length === 0);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [reportToDelete, setReportToDelete] = useState<MaintenanceReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  // View All reports state (shows 4 reports by default, expands to all when toggled)
  const [showAllReports, setShowAllReports] = useState(false);

  const fetchReports = async () => {
    const activeUserId = user?.id || db.getCurrentUser()?.id || 'demo-user-vishnu-kumar-b204';
    try {
      const data = await db.getReports(activeUserId);
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete || !user) return;
    try {
      setDeleting(true);
      await db.deleteReport(reportToDelete.id, user.id);
      setReportToDelete(null);
      await fetchReports();
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Subscribe to database changes so newly created reports show up immediately
    const unsubscribe = subscribeToDatabase(() => {
      fetchReports();
    });
    return () => unsubscribe();
  }, [user]);

  // Real data calculations
  const totalRequests = reports.length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress' || r.status === 'Reported' || r.status === 'Acknowledged').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const confirmedCount = reports.filter(r => r.status === 'Confirmed').length;

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (filter === 'active') {
      return r.status === 'In Progress' || r.status === 'Reported' || r.status === 'Acknowledged';
    }
    if (filter === 'resolved') {
      return r.status === 'Resolved' || r.status === 'Confirmed';
    }
    return true;
  });

  // Limit to 4 reports by default; expand to all reports when View All is toggled
  const displayedReports = showAllReports ? filteredReports : filteredReports.slice(0, 4);

  // Active highlighted report (first In Progress or first report)
  const highlightedReport = reports.find(r => r.status === 'In Progress') || (reports.length > 0 ? reports[0] : null);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight text-left m-0 p-0">
            Good evening, Vishnu
          </h1>
          <p className="text-sm font-medium text-[#64748B] mt-1 text-left m-0 p-0 pl-[1.5px]">
            B-204 • Skyline Heights Apartments
          </p>
        </div>

        <button
          onClick={() => onRouteChange('report')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#203136] text-white text-sm font-medium hover:bg-[#18262A] shadow-xs hover:shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* TOTAL REQUESTS */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              TOTAL REQUESTS
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1.5">
              {totalRequests}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#F1F5F9] text-[#475569] flex items-center justify-center">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              IN PROGRESS
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1.5">
              {inProgressCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* RESOLVED */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              RESOLVED
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1.5">
              {resolvedCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#4F46E5] flex items-center justify-center">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* CONFIRMED */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              CONFIRMED
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1.5">
              {confirmedCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Active High-Priority Highlight Card */}
      {highlightedReport && (
        <div 
          onClick={() => onRouteChange('tracking', highlightedReport.id)}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAECF0] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Droplet className="w-6 h-6 fill-current/20 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                  {highlightedReport.status}
                </span>
                <span className="text-xs font-semibold text-[#8B9AA0]">
                  #{highlightedReport.request_id}
                </span>
              </div>

              <div className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#203136] transition-colors">
                {highlightedReport.title}
              </div>

              <div className="text-xs sm:text-sm text-[#64748B]">
                Assigned to {highlightedReport.assigned_to || 'Facilities Duty Engineer'} • {highlightedReport.location}
              </div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#203136] group-hover:border-[#203136] group-hover:bg-slate-50 transition-all shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* My Reports Table Section */}
      <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-6 border-b border-[#EAECF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">My Reports</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569]">
              {reports.length} Requests
            </span>
          </div>

          {/* Filter Pills & Sort */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="inline-flex p-1 bg-[#F8FAFC] rounded-xl border border-[#EAECF0]">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                All ({totalRequests})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'active'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Active ({inProgressCount})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'resolved'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Resolved ({resolvedCount + confirmedCount})
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAECF0] text-xs font-medium text-[#475569] bg-white">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Sorted by Recent</span>
            </div>
          </div>
        </div>

        {/* Reports Table / Empty State */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#203136] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 mt-3">Loading your reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">No maintenance reports yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                Whenever you encounter any issue in your unit, submit a request and track repairs in real-time.
              </p>
            </div>
            <button
              onClick={() => onRouteChange('report')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#203136] text-white text-sm font-medium rounded-xl hover:bg-[#18262A] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Report your first issue
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <colgroup>
                <col className="w-28" />
                <col />
                <col className="w-28" />
                <col className="w-28" />
                <col className="w-28" />
                <col className="w-28" />
                <col className="w-56" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#EAECF0] bg-[#F8FAFC]/50 text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-left whitespace-nowrap">REQUEST ID</th>
                  <th className="py-3.5 px-4 text-left">ISSUE</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">CATEGORY</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">LOCATION</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">STATUS</th>
                  <th className="py-3.5 px-2 text-center whitespace-nowrap">LAST UPDATED</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[210px]">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0] text-sm">
                {displayedReports.map((report) => (
                  <tr 
                    key={report.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onRouteChange('tracking', report.id)}
                  >
                    {/* REQUEST ID */}
                    <td className="py-4 px-4 font-semibold text-[#0F172A] whitespace-nowrap text-left">
                      #{report.request_id}
                    </td>

                    {/* ISSUE */}
                    <td className="py-4 px-4 text-left">
                      <div className="font-semibold text-[#0F172A]">
                        {report.title}
                      </div>
                      <div className="text-xs text-[#64748B] truncate mt-0.5 max-w-md xl:max-w-xl">
                        {report.description}
                      </div>
                    </td>

                    {/* CATEGORY (Centered) */}
                    <td className="py-4 px-3 whitespace-nowrap text-center">
                      <div className="inline-flex justify-center">
                        <CategoryBadge category={report.category} />
                      </div>
                    </td>

                    {/* LOCATION (Centered) */}
                    <td className="py-4 px-3 whitespace-nowrap text-xs text-[#475569] text-center">
                      <span className="font-medium text-[#1E293B]">{report.location}</span>
                    </td>

                    {/* STATUS (Centered) */}
                    <td className="py-4 px-3 whitespace-nowrap text-center">
                      <div className="inline-flex justify-center">
                        <StatusBadge status={report.status} />
                      </div>
                    </td>

                    {/* LAST UPDATED (Centered & compact next to Action) */}
                    <td className="py-4 px-2 whitespace-nowrap text-center">
                      <div className="text-xs font-medium text-[#0F172A]">
                        {new Date(report.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {report.status === 'Confirmed' ? 'Closed & Archived' : 'Updated'}
                      </div>
                    </td>

                    {/* ACTION (View Details and Remove button with increased spacing) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap min-w-[210px]">
                      <div className="flex items-center justify-center gap-5 sm:gap-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRouteChange('tracking', report.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#203136] hover:text-white hover:border-[#203136] transition-all cursor-pointer shadow-2xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove Issue Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportToDelete(report);
                          }}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title="Remove this maintenance request"
                          aria-label="Remove issue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer: View All Option for Multiple Reports */}
        {filteredReports.length > 0 && (
          <div className="border-t border-[#EAECF0] bg-[#F8FAFC]/50 py-3.5 px-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAllReports(!showAllReports)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-[#0F172A] bg-white border border-[#EAECF0] hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs group"
            >
              <span>
                {showAllReports 
                  ? 'Show less (4 reports)' 
                  : `View all reports (${filteredReports.length})`}
              </span>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-[#64748B] group-hover:text-[#0F172A] transition-transform duration-200 ${
                  showAllReports ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {reportToDelete && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => !deleting && setReportToDelete(null)}
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-modal-pop space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Remove Maintenance Report?
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Request #{reportToDelete.request_id} • {reportToDelete.category}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200">
              Are you sure you want to permanently delete <strong className="text-slate-900">"{reportToDelete.title}"</strong>? This will remove this request and its status tracking from your resident record.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                disabled={deleting}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteReport}
                disabled={deleting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                {deleting ? 'Removing...' : 'Yes, Remove Issue'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
