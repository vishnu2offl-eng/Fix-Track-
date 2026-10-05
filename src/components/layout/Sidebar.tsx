import React from 'react';
import { 
  LayoutGrid, 
  PlusCircle, 
  TrendingUp, 
  Bell, 
  User,
  X
} from 'lucide-react';
import { FixTrackLogo } from '../common/FixTrackLogo';
import { useAuth } from '../../context/AuthContext';

export type NavRoute = 'home' | 'report' | 'tracking' | 'notifications' | 'profile';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { user, unreadCount } = useAuth();

  const navItems: { id: NavRoute; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'report', label: 'Report an Issue', icon: PlusCircle },
    { id: 'tracking', label: 'Issue Tracking', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 lg:z-30 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top: Logo & Close for Mobile */}
        <div>
          <div className="p-6 flex items-center justify-between">
            <button 
              onClick={() => { onRouteChange('home'); onCloseMobile?.(); }}
              className="text-left cursor-pointer focus:outline-hidden"
            >
              <FixTrackLogo />
            </button>
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onRouteChange(item.id);
                    onCloseMobile?.();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer
                    ${isActive 
                      ? 'bg-[#203136] text-white shadow-xs' 
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                      px-2 py-0.5 text-xs font-semibold rounded-full
                      ${isActive 
                        ? 'bg-[#E6A84C] text-[#203136]' 
                        : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Summary Card */}
        <div className="p-4 border-t border-[#F1F5F9]">
          <button
            onClick={() => {
              onRouteChange('profile');
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECF0] hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="relative shrink-0">
              <img 
                src={user?.avatar_url || '/assets/vishnu_avatar.jpg'} 
                alt={user?.full_name || 'Resident'} 
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#0F172A] truncate">
                {user?.full_name || 'Vishnu Kumar'}
              </div>
              <div className="text-xs text-[#64748B] truncate">
                Unit {user?.unit_number || 'B-204'}
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
