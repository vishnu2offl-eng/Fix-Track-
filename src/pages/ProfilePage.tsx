import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Building2, 
  Smartphone, 
  Mail, 
  Check, 
  Sliders, 
  MessageSquare, 
  Send, 
  Contact, 
  Edit3, 
  LogOut, 
  ArrowRight,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import type { NotificationPreferences } from '../types';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user, refreshUserData } = useAuth();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_id: user?.id || '',
    urgent_alerts: true,
    technician_arrival_alerts: true,
  });

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editEmergencyOpen, setEditEmergencyOpen] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit Emergency Form State
  const [emergencyName, setEmergencyName] = useState(user?.emergency_contact_name || 'Priya Kumar');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergency_contact_relationship || 'Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergency_contact_phone || '+91 98765 43211');
  const [savingEmergency, setSavingEmergency] = useState(false);

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      db.getPreferences(user.id).then(setPreferences);
      setFullName(user.full_name);
      setPhone(user.phone);
      setEmergencyName(user.emergency_contact_name);
      setEmergencyRelation(user.emergency_contact_relationship);
      setEmergencyPhone(user.emergency_contact_phone);
    }
  }, [user]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleTogglePref = async (key: 'urgent_alerts' | 'technician_arrival_alerts') => {
    if (!user) return;
    const updated = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(updated);
    await db.updatePreferences(user.id, updated);
    showToast('Preferences updated');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const res = await db.uploadPhoto(file);
    if (res.url) {
      await db.updateProfile(user.id, { avatar_url: res.url });
      await refreshUserData();
      showToast('Profile photo updated');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingProfile(true);
      await db.updateProfile(user.id, {
        full_name: fullName,
        phone: phone,
      });
      await refreshUserData();
      setEditProfileOpen(false);
      showToast('Profile details saved');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingEmergency(true);
      await db.updateProfile(user.id, {
        emergency_contact_name: emergencyName,
        emergency_contact_relationship: emergencyRelation,
        emergency_contact_phone: emergencyPhone,
      });
      await refreshUserData();
      setEditEmergencyOpen(false);
      showToast('Emergency contact updated');
    } finally {
      setSavingEmergency(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 sm:space-y-8 relative">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#203136] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium animate-modal-pop">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Profile
        </h1>
        <p className="text-sm font-medium text-[#64748B] mt-1">
          Manage your apartment account and contact preferences
        </p>
      </div>

      {/* Grid: Left Resident Profile (5 cols) | Right Preferences & Security (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#EAECF0] shadow-xs space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <img
                src={user?.avatar_url || '/assets/vishnu_avatar.jpg'}
                alt={user?.full_name || 'Resident'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                }}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Change avatar photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                {user?.full_name || 'Vishnu Kumar'}
              </h2>
              <button
                onClick={() => setEditProfileOpen(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Edit name or phone"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] mt-0.5">
              Member since {user?.member_since || 'May 2023'}
            </p>
          </div>

          {/* 3 Column Stats Card */}
          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] text-center">
            <div>
              <div className="text-lg sm:text-xl font-bold text-[#D97706]">
                {user?.requests_count ?? 14}
              </div>
              <div className="text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider mt-0.5">
                Requests
              </div>
            </div>

            <div className="border-x border-slate-200">
              <div className="text-lg sm:text-xl font-bold text-[#0F172A]">
                {user?.resolved_count ?? 12}
              </div>
              <div className="text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider mt-0.5">
                Resolved
              </div>
            </div>

            <div>
              <div className="text-lg sm:text-xl font-bold text-[#0F172A]">
                {user?.tenure || '1.5y'}
              </div>
              <div className="text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider mt-0.5">
                Tenure
              </div>
            </div>
          </div>

          {/* PREMISE ALLOCATION */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider px-1">
              PREMISE ALLOCATION
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    Unit {user?.unit_number || 'B-204'}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {user?.floor || 'Floor 2'} • Tower B
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                {user?.resident_type || 'Residential'}
              </span>
            </div>
          </div>

          {/* DIRECT CONTACTS */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-[#8B9AA0] uppercase tracking-wider px-1">
              DIRECT CONTACTS
            </div>

            <div className="space-y-2">
              {/* Phone */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-[#64748B]" />
                  <div>
                    <div className="text-[10px] text-[#8B9AA0] uppercase tracking-wider font-semibold">
                      Mobile Phone
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#0F172A]">
                      {user?.phone || '+91 98765 43210'}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F5F9] text-[#059669] border border-[#CBD5E1]">
                  <Check className="w-3 h-3 stroke-[2.5]" /> Verified
                </span>
              </div>

              {/* Email */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#64748B]" />
                  <div>
                    <div className="text-[10px] text-[#8B9AA0] uppercase tracking-wider font-semibold">
                      Email Address
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#0F172A] truncate max-w-[170px] sm:max-w-xs">
                      {user?.email || 'vishnu.kumar@example.com'}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F5F9] text-[#059669] border border-[#CBD5E1]">
                  <Check className="w-3 h-3 stroke-[2.5]" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences, Emergency, Logout (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Notification Preferences */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAECF0] shadow-xs space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] text-[#D97706] border border-[#EAECF0] flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Notification Preferences</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Choose how building operations and dispatch teams reach you.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Toggle 1: Urgent Maintenance */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-[#64748B] mt-1 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">
                      SMS & WhatsApp Alerts for urgent maintenance
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      Receive priority dispatch text when immediate plumbing or electrical issues occur.
                    </p>
                  </div>
                </div>

                {/* Switch */}
                <button
                  type="button"
                  onClick={() => handleTogglePref('urgent_alerts')}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer
                    ${preferences.urgent_alerts ? 'bg-[#203136]' : 'bg-slate-300'}
                  `}
                >
                  <span className={`
                    block w-5 h-5 rounded-full bg-white shadow-xs transition-transform
                    ${preferences.urgent_alerts ? 'translate-x-6' : 'translate-x-0'}
                  `} />
                </button>
              </div>

              {/* Toggle 2: Technician Arrival */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Send className="w-4 h-4 text-[#64748B] mt-1 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">
                      Technician arrival alerts (15 min prior)
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      Get notified when assigned maintenance personnel are en route to Unit {user?.unit_number || 'B-204'}.
                    </p>
                  </div>
                </div>

                {/* Switch */}
                <button
                  type="button"
                  onClick={() => handleTogglePref('technician_arrival_alerts')}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer
                    ${preferences.technician_arrival_alerts ? 'bg-[#203136]' : 'bg-slate-300'}
                  `}
                >
                  <span className={`
                    block w-5 h-5 rounded-full bg-white shadow-xs transition-transform
                    ${preferences.technician_arrival_alerts ? 'translate-x-6' : 'translate-x-0'}
                  `} />
                </button>
              </div>
            </div>
          </div>

          {/* Card: EMERGENCY CONTACT */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAECF0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#D97706]">
                <Contact className="w-4 h-4" />
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  EMERGENCY CONTACT
                </span>
              </div>

              <button
                onClick={() => setEditEmergencyOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Edit emergency contact"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-[#0F172A]">
                  {user?.emergency_contact_name || 'Priya Kumar'}
                </div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {user?.emergency_contact_relationship || 'Spouse'} • {user?.emergency_contact_phone || '+91 98765 43211'}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Log out */}
          <div 
            onClick={onLogout}
            className="p-5 rounded-3xl bg-[#FFF5F5] border border-[#FEE2E2] hover:bg-[#FEE2E2]/60 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#FECACA] text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs">
                <LogOut className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#991B1B]">
                  Log out
                </div>
                <div className="text-xs text-[#B91C1C]/80 mt-0.5">
                  Sign out from Unit {user?.unit_number || 'B-204'} resident terminal
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#DC2626] group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#0F172A]">Edit Resident Profile</h3>
              <button 
                onClick={() => setEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#203136]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#203136]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 bg-[#203136] text-white rounded-xl text-xs font-semibold hover:bg-[#18262A] cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Emergency Contact Modal */}
      {editEmergencyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#0F172A]">Edit Emergency Contact</h3>
              <button 
                onClick={() => setEditEmergencyOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmergency} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#203136]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#203136]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#203136]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditEmergencyOpen(false)}
                  className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEmergency}
                  className="w-full py-2.5 bg-[#203136] text-white rounded-xl text-xs font-semibold hover:bg-[#18262A] cursor-pointer"
                >
                  {savingEmergency ? 'Saving...' : 'Save Emergency Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
