import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, CheckCheck, X, ArrowRight } from 'lucide-react';
import type { MaintenanceReport } from '../../types';

interface SuccessModalProps {
  report: MaintenanceReport;
  onDone: () => void;
  onViewRequest: (reportId: string) => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  report,
  onDone,
  onViewRequest,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.request_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-modal-pop">
        {/* Close Button */}
        <button
          onClick={onDone}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
        </div>

        {/* Title & Message */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Issue Reported Successfully
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xs mx-auto">
            Your maintenance request has been submitted to the facility management desk.
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-[#EAECF0] space-y-3.5 mb-6">
          {/* Reference ID with Copy Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div>
              <div className="text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider">
                Request Reference
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#1D4ED8] mt-0.5 tracking-tight">
                #{report.request_id}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Scope */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#64748B] font-medium">Scope</span>
            <span className="font-semibold text-[#0F172A]">
              {report.category} • {report.title}
            </span>
          </div>

          {/* Unit Location */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#64748B] font-medium">Unit Location</span>
            <span className="font-semibold text-[#0F172A]">
              {report.location}
            </span>
          </div>

          {/* Response Target */}
          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <span className="text-[#64748B] font-medium">Response Target</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              {report.response_target || 'Expected triage within 45 mins'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDone}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#475569] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Done
          </button>
          <button
            onClick={() => onViewRequest(report.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#203136] text-white text-sm font-semibold hover:bg-[#18262A] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
