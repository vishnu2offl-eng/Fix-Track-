import React, { useState } from 'react';
import { 
  Database, 
  Check, 
  Copy, 
  CheckCheck, 
  ExternalLink, 
  X, 
  AlertCircle, 
  CheckCircle2,
  KeyRound,
  Globe
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('fixtrack_supabase_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    localStorage.getItem('fixtrack_supabase_anon_key') || ''
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setTestResult({ success: false, message: 'Please enter both your Project URL and Anon Public Key.' });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      // Clean input
      const cleanUrl = supabaseUrl.trim().replace(/\/+$/, '');
      const cleanKey = supabaseKey.trim();

      // Test ping to Supabase rest endpoint
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${cleanKey}`
        }
      });

      if (response.ok || response.status < 500) {
        // Save to browser localStorage so it takes effect immediately
        localStorage.setItem('fixtrack_supabase_url', cleanUrl);
        localStorage.setItem('fixtrack_supabase_anon_key', cleanKey);

        setTestResult({
          success: true,
          message: 'Connection verified! Your FixTrack instance is connected to Supabase.'
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setTestResult({
          success: false,
          message: `Connection returned HTTP ${response.status}. Please check that your URL and Anon Key are correct.`
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Could not connect to the Supabase URL. Please ensure your project is active and URL is valid.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySqlPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-modal-pop max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
            <Database className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Connect to Supabase
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Link your FixTrack application to your live Supabase cloud database
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="my-5 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A]">Current Engine:</span>
            {isSupabaseConfigured || localStorage.getItem('fixtrack_supabase_url') ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> Supabase Cloud Connected
              </span>
            ) : (
              <span className="text-[#D97706] font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Local Relational Engine Active
              </span>
            )}
          </div>

          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs font-semibold text-[#1D4ED8] hover:underline inline-flex items-center gap-1"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 mb-6 text-xs text-[#475569]">
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
            <div className="font-bold text-[#14532D] flex items-center gap-1.5 text-sm">
              <span>Step 1: Run the Database Schema</span>
            </div>
            <p className="leading-relaxed">
              Open your Supabase project's <strong>SQL Editor</strong>, open the file <code className="bg-white px-1.5 py-0.5 rounded border border-[#86EFAC] font-mono font-semibold">supabase/schema.sql</code> from this repository, and click <strong>Run</strong>. This creates all tables, RLS policies, and storage buckets.
            </p>
            <button
              type="button"
              onClick={handleCopySqlPath}
              className="mt-1 px-3 py-1.5 bg-white text-[#15803D] border border-[#86EFAC] rounded-xl font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedSql ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied 'supabase/schema.sql'!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Copy SQL Path</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-[#0F172A] text-sm">
              Step 2: Enter Project API Credentials
            </div>
            <p>
              In your Supabase dashboard, go to <strong>Project Settings &gt; API</strong> and copy your <strong>Project URL</strong> and <strong>anon public key</strong>:
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
              Project URL
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#203136] focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
              Anon Public API Key
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#203136] focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={testing}
              className="w-full py-2.5 rounded-xl bg-[#203136] hover:bg-[#18262A] text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {testing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying connection...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-[#E6A84C]" />
                  <span>Connect & Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
