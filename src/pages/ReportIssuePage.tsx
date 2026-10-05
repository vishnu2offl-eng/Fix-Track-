import React, { useState, useRef } from 'react';
import { 
  Zap, 
  Droplet, 
  Lock, 
  ArrowUpDown, 
  Building, 
  MoreHorizontal, 
  Check, 
  Camera, 
  MapPin, 
  ArrowRight, 
  Phone, 
  Lightbulb, 
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import type { CategoryType, MaintenanceReport } from '../types';
import { SuccessModal } from '../components/reports/SuccessModal';
import type { NavRoute } from '../components/layout/Sidebar';

interface ReportIssuePageProps {
  onRouteChange: (route: NavRoute, reportId?: string) => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ onRouteChange }) => {
  const { user } = useAuth();
  
  const DEFAULT_SAMPLE_TEXT = 'Water is pooling under the kitchen sink whenever the tap runs.';

  const [category, setCategory] = useState<CategoryType>('Plumbing');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(`Unit ${user?.unit_number || 'B-204'} • Kitchen`);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState<MaintenanceReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: { id: CategoryType; label: string; subtext: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'Electrical', label: 'Electrical', subtext: 'Power, lighting, fuses', icon: Zap },
    { id: 'Plumbing', label: 'Plumbing', subtext: 'Drains, taps, leaks', icon: Droplet },
    { id: 'Door / Lock', label: 'Door / lock', subtext: 'Key fob, latch, hinge', icon: Lock },
    { id: 'Lift', label: 'Lift', subtext: 'Car B, buttons, call', icon: ArrowUpDown },
    { id: 'Common Area', label: 'Common area', subtext: 'Lobby, gym, garden', icon: Building },
    { id: 'Other', label: 'Other', subtext: 'Miscellaneous issues', icon: MoreHorizontal },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit.');
      return;
    }

    setPhotoName(file.name);
    const result = await db.uploadPhoto(file);
    if (result.url) {
      setPhotoUrl(result.url);
      setErrorMsg(null);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoUrl(null);
    setPhotoName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!category) {
      setErrorMsg('Please select a category.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description of the problem.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter the specific location.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Derive title from category and description
      const title = description.length > 40 
        ? `${category} Issue - ${description.slice(0, 35)}...`
        : `${category} Issue - ${description}`;

      const activeUserId = user?.id || db.getCurrentUser()?.id || 'demo-user-vishnu-kumar-b204';

      const report = await db.createReport({
        user_id: activeUserId,
        category,
        title,
        description,
        location,
        photo_url: photoUrl,
      });

      // Display the popup screen with issue reference and action buttons
      setCreatedReport(report);
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Report an issue
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Facilities is typically notified within minutes
          </p>
        </div>

        {/* Average Response Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-medium text-[#15803D] self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
          <div>
            <span className="font-bold text-[#14532D]">AVERAGE RESPONSE:</span> 14 minutes • Duty Engineer on-site
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Form Left, Info Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (8 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 sm:space-y-7">
          {/* 1. Category Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#0F172A]">Category</label>
              <span className="text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider">
                SELECT ONE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`
                      relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px]
                      ${isSelected 
                        ? 'bg-[#203136] text-white border-[#203136] shadow-sm' 
                        : 'bg-[#F8FAFC] text-[#1E293B] border-[#E2E8F0] hover:bg-slate-100/70 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#E6A84C]' : 'text-[#64748B]'}`} />
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                        {cat.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'text-slate-300' : 'text-[#64748B]'}`}>
                        {cat.subtext}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Problem Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-bold text-[#0F172A]">
                What's the problem?
              </label>
              <span className="text-xs text-[#8B9AA0] font-medium">Be descriptive</span>
            </div>

            <textarea
              id="description"
              rows={4}
              value={description}
              onFocus={() => {
                if (description === DEFAULT_SAMPLE_TEXT) {
                  setDescription('');
                }
              }}
              onChange={(e) => {
                if (description === DEFAULT_SAMPLE_TEXT) {
                  setDescription(e.target.value.replace(DEFAULT_SAMPLE_TEXT, ''));
                } else {
                  setDescription(e.target.value);
                }
              }}
              placeholder="Please describe the maintenance issue in detail (e.g. water pooling under sink, flickering lights)..."
              className="w-full p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* 3. Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="location" className="text-sm font-bold text-[#0F172A]">
                Location
              </label>
              <span className="text-xs text-[#8B9AA0] font-medium">Assigned residence</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Unit B-204 • Kitchen"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm font-medium text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
                required
              />
            </div>
          </div>

          {/* 4. Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0F172A]">Photo</label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-6 sm:p-8 bg-[#F8FAFC] hover:bg-slate-100/70 transition-colors text-center cursor-pointer relative group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png, image/jpeg, image/heic, image/webp"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-500 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Camera className="w-6 h-6 stroke-[1.5]" />
              </div>

              <div className="mt-3 text-sm font-semibold text-[#0F172A]">
                Drag a photo here, or click to upload
              </div>
              <div className="text-xs text-[#64748B] mt-0.5">
                PNG, JPG, HEIC up to 10MB
              </div>

              {/* Uploaded File Chip */}
              {photoName && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{photoName}</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#203136] text-white text-base font-semibold hover:bg-[#18262A] transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting request...</span>
              </>
            ) : (
              <>
                <span>Submit report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Right Column: "Before you submit" card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#EAECF0] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#0F172A] font-bold text-base">
            <Lightbulb className="w-5 h-5 text-[#E6A84C]" />
            <span>Before you submit</span>
          </div>

          <ul className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6A84C] mt-2 shrink-0" />
              <span>A photo helps facilities diagnose the issue before they arrive on-site.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6A84C] mt-2 shrink-0" />
              <span>Choose the most specific location so the right team is assigned.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6A84C] mt-2 shrink-0" />
              <span>Urgent safety issues (gas, fire, structural) should be called in directly to the emergency line.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6A84C] mt-2 shrink-0" />
              <span>You'll get a notification the moment facilities acknowledges the report.</span>
            </li>
          </ul>

          {/* 24/7 Security & Safety Box */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#FDE68A] flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#92400E]" />
                <span className="text-xs font-bold text-[#92400E]">24/7 Security & Safety</span>
              </div>
              <div className="text-xs font-semibold text-[#1E293B]">
                Ext. 0402 or +44 20 7946 0912
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-[#DC2626] text-white text-[10px] font-bold tracking-wide uppercase">
              URGENT
            </span>
          </div>
        </div>
      </div>

      {/* Success Popup Screen on Successful Submission */}
      {createdReport && (
        <SuccessModal
          report={createdReport}
          onDone={() => {
            setCreatedReport(null);
            onRouteChange('home');
          }}
          onViewRequest={(id) => {
            setCreatedReport(null);
            onRouteChange('tracking', id);
          }}
        />
      )}
    </div>
  );
};
