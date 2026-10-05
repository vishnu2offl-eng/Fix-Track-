import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  HelpCircle, 
  Bell, 
  Menu, 
  Phone, 
  X,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { NavRoute } from './Sidebar';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onRouteChange: (route: NavRoute) => void;
  onLogout?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onRouteChange,
  onLogout
}) => {
  const { user, unreadCount, logout } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-[#FBFAF7] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile Menu Button & Apartment Location Indicator */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#475569]">
            <Building2 className="w-4 h-4 text-[#8B9AA0]" />
            <span className="font-medium text-[#1E293B]">
              {user?.building || 'Skyline Heights Apt'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[#64748B]">
              Unit {user?.unit_number || 'B-204'}
            </span>
          </div>
        </div>

        {/* Right Actions: Support, Notifications, Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Support CTA */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">Support</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => onRouteChange('notifications')}
            className="relative p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => onRouteChange('profile')}
            className="cursor-pointer focus:outline-hidden ring-2 ring-transparent hover:ring-[#E6A84C]/50 rounded-full transition-all"
            aria-label="Go to profile"
          >
            <img 
              src={user?.avatar_url || '/assets/vishnu_avatar.jpg'} 
              alt={user?.full_name || 'Resident profile'} 
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
              }}
            />
          </button>

          {/* Quick Log Out to test Login/Signup */}
          <button
            onClick={() => {
              if (onLogout) onLogout();
              else logout();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Log out (Return to Login)"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Quick Support Dialog */}
      {showSupportModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#E6A84C]" />
                <h3 className="font-semibold text-[#0F172A]">Resident Support & Facilities</h3>
              </div>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-[#475569]">
                Facilities engineers and building security are available 24/7 for urgent maintenance assistance.
              </p>

              <div className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#FDE68A] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#92400E] uppercase tracking-wide">24/7 Security & Safety</div>
                  <div className="text-base font-bold text-[#1E293B] mt-0.5">Ext. 0402 or +44 20 7946 0912</div>
                </div>
                <a 
                  href="tel:+442079460912" 
                  className="px-3 py-1.5 bg-[#DC2626] text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Duty Engineer Desk</div>
                <div className="text-sm font-medium text-[#1E293B] mt-1">Ground Floor, Tower B Concierge</div>
                <div className="text-xs text-[#64748B] mt-0.5">Average dispatch time: 14 mins</div>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="mt-5 w-full py-2.5 bg-[#203136] text-white text-sm font-medium rounded-xl hover:bg-[#18262A] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
