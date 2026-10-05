import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, type NavRoute } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { IssueTrackingPage } from './pages/IssueTrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('home');
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const handleNavigate = (route: NavRoute, reportId?: string) => {
    setCurrentRoute(route);
    if (reportId) {
      setSelectedReportId(reportId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setAuthView('login');
    window.location.hash = '#login';
  };

  // Sync hash for direct linking to login or signup
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#signup') setAuthView('signup');
      else if (hash === '#login') setAuthView('login');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#203136] border-t-[#D97706] rounded-full animate-spin" />
        <div className="text-sm font-semibold text-[#203136] tracking-wide">
          FixTrack • Loading Resident Workspace...
        </div>
      </div>
    );
  }

  // Unauthenticated Flow
  if (!user) {
    if (authView === 'signup') {
      return (
        <SignUpPage
          onGoToLogin={() => {
            setAuthView('login');
            window.location.hash = '#login';
          }}
          onSignUpSuccess={() => {
            setCurrentRoute('home');
            window.location.hash = '';
          }}
        />
      );
    }
    return (
      <LoginPage
        onGoToSignUp={() => {
          setAuthView('signup');
          window.location.hash = '#signup';
        }}
        onLoginSuccess={() => {
          setCurrentRoute('home');
          window.location.hash = '';
        }}
      />
    );
  }

  // Authenticated Resident Dashboard Flow
  return (
    <div className="min-h-screen bg-[#FBFAF7] flex flex-col">
      {/* Responsive Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={handleNavigate}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <TopHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onRouteChange={handleNavigate}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentRoute === 'home' && (
            <HomePage onRouteChange={handleNavigate} />
          )}

          {currentRoute === 'report' && (
            <ReportIssuePage onRouteChange={handleNavigate} />
          )}

          {currentRoute === 'tracking' && (
            <IssueTrackingPage 
              reportId={selectedReportId} 
              onRouteChange={handleNavigate} 
            />
          )}

          {currentRoute === 'notifications' && (
            <NotificationsPage onRouteChange={handleNavigate} />
          )}

          {currentRoute === 'profile' && (
            <ProfilePage onLogout={handleLogout} />
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
