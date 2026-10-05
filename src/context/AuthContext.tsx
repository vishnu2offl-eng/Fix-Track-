import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, AppNotification } from '../types';
import { db, subscribeToDatabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  unreadCount: number;
  login: (email: string, password?: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (data: { fullName: string; email: string; flatNo: string; password?: string }) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialUser = db.getCurrentUser();
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => db.getUnreadCountSync(initialUser?.id));

  const loadData = async () => {
    try {
      const currentUser = db.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const notifs = await db.getNotifications(currentUser.id);
        const unread = notifs.filter((n: AppNotification) => !n.is_read).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Subscribe to realtime database changes
    const unsubscribe = subscribeToDatabase(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await db.login(email, password);
    if (res.user) {
      setUser(res.user);
      setUnreadCount(db.getUnreadCountSync(res.user.id));
      loadData(); // Non-blocking background sync
      return { success: true, error: null };
    }
    return { success: false, error: res.error };
  };

  const signUp = async (data: { fullName: string; email: string; flatNo: string; password?: string }) => {
    const res = await db.signUp(data);
    if (res.user) {
      setUser(res.user);
      setUnreadCount(0);
      loadData(); // Non-blocking background sync
      return { success: true, error: null };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
    setUnreadCount(0);
  };

  const refreshUserData = async () => {
    await loadData();
  };

  return (
    <AuthContext.Provider value={{ user, loading, unreadCount, login, signUp, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
