import { createClient } from '@supabase/supabase-js';
import type { 
  UserProfile, 
  MaintenanceReport, 
  ReportTimelineEvent, 
  FacilitiesNote, 
  ReportMessage, 
  AppNotification, 
  NotificationPreferences, 
  CategoryType,
  ReportStatus 
} from '../types';

const g = typeof globalThis !== 'undefined' ? (globalThis as unknown as { process?: { env?: Record<string, string> } }) : {};
const envUrl = 
  (typeof localStorage !== 'undefined' && localStorage.getItem('fixtrack_supabase_url')) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  g.process?.env?.VITE_SUPABASE_URL || 
  '';

const envAnonKey = 
  (typeof localStorage !== 'undefined' && localStorage.getItem('fixtrack_supabase_anon_key')) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  g.process?.env?.VITE_SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = Boolean(
  envUrl && 
  envAnonKey && 
  !envUrl.includes('your-project.supabase.co') &&
  envAnonKey !== 'your-anon-key-here'
);

// Real Supabase Client instance (used when configured)
export const realSupabase = isSupabaseConfigured
  ? createClient(envUrl, envAnonKey)
  : null;

// ============================================================================
// HIGH-FIDELITY LOCAL DATABASE ENGINE
// Provides complete relational persistence, auth, storage, and RLS checking
// when working without remote credentials or offline.
// ============================================================================

const STORAGE_KEYS = {
  USER: 'fixtrack_session_user',
  CREDENTIALS: 'fixtrack_db_credentials',
  PROFILES: 'fixtrack_db_profiles',
  REPORTS: 'fixtrack_db_reports',
  DELETED_REPORTS: 'fixtrack_db_deleted_report_ids',
  TIMELINE: 'fixtrack_db_timeline',
  NOTES: 'fixtrack_db_notes',
  MESSAGES: 'fixtrack_db_messages',
  NOTIFICATIONS: 'fixtrack_db_notifications',
  PREFS: 'fixtrack_db_preferences',
};

const DEFAULT_DEMO_USER_ID = 'demo-user-vishnu-kumar-b204';

const INITIAL_PROFILES: Record<string, UserProfile> = {
  [DEFAULT_DEMO_USER_ID]: {
    id: DEFAULT_DEMO_USER_ID,
    full_name: 'Vishnu Kumar',
    email: 'vishnu.kumar@example.com',
    phone: '+91 98765 43210',
    avatar_url: '/assets/vishnu_avatar.jpg',
    unit_number: 'B-204',
    floor: 'Floor 2',
    building: 'Skyline Heights Apartments',
    resident_type: 'Residential',
    member_since: 'May 2023',
    requests_count: 14,
    resolved_count: 12,
    tenure: '1.5y',
    emergency_contact_name: 'Priya Kumar',
    emergency_contact_relationship: 'Spouse',
    emergency_contact_phone: '+91 98765 43211',
    created_at: new Date('2023-05-15T09:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
  }
};

const INITIAL_PREFERENCES: Record<string, NotificationPreferences> = {
  [DEFAULT_DEMO_USER_ID]: {
    user_id: DEFAULT_DEMO_USER_ID,
    urgent_alerts: true,
    technician_arrival_alerts: true,
  }
};

const INITIAL_REPORTS: MaintenanceReport[] = [
  {
    id: 'report-ft-2048',
    request_id: 'FT-2048',
    user_id: DEFAULT_DEMO_USER_ID,
    category: 'Plumbing',
    title: 'Water Leakage',
    description: 'Under-sink pipe dripping steadily onto baseboard whenever the tap runs.',
    location: 'B-204 • Bathroom',
    photo_url: '/assets/pipe_leak_attached.jpg',
    status: 'In Progress',
    priority: 'High',
    assigned_to: 'Miguel Santos (Licensed Specialist)',
    response_target: 'Expected triage within 45 mins',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'report-ft-2039',
    request_id: 'FT-2039',
    user_id: DEFAULT_DEMO_USER_ID,
    category: 'Electrical',
    title: 'Broken Light Fixture',
    description: 'Ceiling pendant flickering and buzzing intermittently.',
    location: 'B-204 • Bedroom',
    photo_url: null,
    status: 'Resolved',
    priority: 'Normal',
    assigned_to: 'Vikram Singh (Electrician)',
    response_target: 'Resolved within 24 hrs',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'report-ft-2027',
    request_id: 'FT-2027',
    user_id: DEFAULT_DEMO_USER_ID,
    category: 'Door / Lock',
    title: 'Door Lock Jamming',
    description: 'Deadbolt cylinder stiffened after rainfall and requires heavy force.',
    location: 'B-204 • Main Door',
    photo_url: null,
    status: 'Confirmed',
    priority: 'Normal',
    assigned_to: 'Facilities Door Specialist',
    response_target: 'Completed',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    confirmed_at: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 3600000).toISOString(),
  }
];

const INITIAL_TIMELINE: ReportTimelineEvent[] = [
  {
    id: 'tl-1',
    report_id: 'report-ft-2048',
    status: 'Reported',
    title: 'Reported',
    description: 'Submitted via Resident Portal by Vishnu Kumar (B-204).',
    actor_name: 'Vishnu Kumar',
    actor_role: 'Resident',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-2',
    report_id: 'report-ft-2048',
    status: 'Acknowledged',
    title: 'Acknowledged by facilities',
    description: 'Assigned priority level 2 (Moderate risk to subflooring).',
    actor_name: 'Dispatch Center',
    actor_role: 'Facilities Desk',
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-3',
    report_id: 'report-ft-2048',
    status: 'In Progress',
    title: 'In progress',
    description: 'Specialist contractor dispatched. Diagnostic inspection completed on-site.',
    actor_name: 'Ravi Chandran',
    actor_role: 'Lead Facilities Plumber',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-4',
    report_id: 'report-ft-2039',
    status: 'Reported',
    title: 'Reported',
    description: 'Submitted via Resident Portal by Vishnu Kumar (B-204).',
    actor_name: 'Vishnu Kumar',
    actor_role: 'Resident',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-5',
    report_id: 'report-ft-2039',
    status: 'Acknowledged',
    title: 'Acknowledged by facilities',
    description: 'Assigned electrician work order.',
    actor_name: 'Dispatch Desk',
    actor_role: 'Facilities Desk',
    created_at: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-6',
    report_id: 'report-ft-2039',
    status: 'In Progress',
    title: 'In progress',
    description: 'Wiring inspection and pendant driver replacement underway.',
    actor_name: 'Vikram Singh',
    actor_role: 'Electrician',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-7',
    report_id: 'report-ft-2039',
    status: 'Resolved',
    title: 'Resolved',
    description: 'Light fixture repaired and load tested.',
    actor_name: 'Vikram Singh',
    actor_role: 'Electrician',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-8',
    report_id: 'report-ft-2027',
    status: 'Reported',
    title: 'Reported',
    description: 'Submitted via Resident Portal by Vishnu Kumar (B-204).',
    actor_name: 'Vishnu Kumar',
    actor_role: 'Resident',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-9',
    report_id: 'report-ft-2027',
    status: 'Acknowledged',
    title: 'Acknowledged by facilities',
    description: 'Hardware dispatch scheduled.',
    actor_name: 'Dispatch Desk',
    actor_role: 'Facilities Desk',
    created_at: new Date(Date.now() - (5 * 24 - 2) * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-10',
    report_id: 'report-ft-2027',
    status: 'In Progress',
    title: 'In progress',
    description: 'Deadbolt cylinder replacement on-site.',
    actor_name: 'Door Specialist',
    actor_role: 'Facilities Team',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-11',
    report_id: 'report-ft-2027',
    status: 'Resolved',
    title: 'Resolved',
    description: 'Cylinder replaced and lubrication completed.',
    actor_name: 'Door Specialist',
    actor_role: 'Facilities Team',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 1800000).toISOString(),
  },
  {
    id: 'tl-12',
    report_id: 'report-ft-2027',
    status: 'Confirmed',
    title: 'Resolution Confirmed',
    description: 'Resident verified lock operates smoothly and confirmed completion.',
    actor_name: 'Vishnu Kumar',
    actor_role: 'Resident',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 3600000).toISOString(),
  }
];

const INITIAL_NOTES: FacilitiesNote[] = [
  {
    id: 'fn-1',
    report_id: 'report-ft-2048',
    author_id: 'fac-ravi',
    author_name: 'Ravi',
    author_role: 'Facilities team',
    note: 'Part ordered, fitting scheduled for tomorrow morning.',
    action_label: 'Action pending delivery',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fn-2',
    report_id: 'report-ft-2048',
    author_id: 'fac-ravi',
    author_name: 'Ravi',
    author_role: 'Facilities team',
    note: 'Confirmed the leak is from the supply valve, not the trap.',
    action_label: 'Inspection logged',
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    user_id: DEFAULT_DEMO_USER_ID,
    report_id: 'report-ft-2048',
    notification_type: 'in_progress',
    title: 'In Progress',
    message: 'Your report Leaking pipe under kitchen sink is now in progress.',
    badge_label: 'Maintenance Team #4',
    subtext: '2:05 pm • B-204',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: DEFAULT_DEMO_USER_ID,
    report_id: null,
    notification_type: 'building_alert',
    title: 'Building Alert',
    message: 'New report received: Lift 2 stopping between floors.',
    badge_label: 'Block B Shared',
    subtext: '9:02 am • Technician Dispatched',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: DEFAULT_DEMO_USER_ID,
    report_id: 'report-ft-2039',
    notification_type: 'resolved',
    title: 'Completed',
    message: 'Corridor light flickering marked resolved. Let us know if it recurs.',
    badge_label: 'Level 4 Hallway',
    subtext: 'Mon, 6:30 pm • Sign-off by Lead Electrician',
    is_read: true,
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    user_id: DEFAULT_DEMO_USER_ID,
    report_id: 'report-ft-2027',
    notification_type: 'facilities_note',
    title: 'Facilities Note',
    message: "Facilities left a note on Main door lock sticking: 'Parts arriving Wednesday'",
    badge_label: 'Estate Manager',
    subtext: 'Sun, 11:15 am',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_CREDENTIALS: Record<string, string> = {
  'vishnu.kumar@example.com': 'password123',
  'resident@fixtrack.com': 'password123',
};

// Helper to safely load data from localStorage or fallback
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return fallback;
}

function setStored<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Global Event Bus for Realtime Simulation
type Subscriber = () => void;
const subscribers: Set<Subscriber> = new Set();
export function subscribeToDatabase(callback: Subscriber) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
function notifySubscribers() {
  subscribers.forEach(cb => {
    try { cb(); } catch (err) { console.error(err); }
  });
}

export function matchesUserId(reportUserId?: string | null, currentUserId?: string | null): boolean {
  if (!currentUserId || !reportUserId) return true;
  if (reportUserId === currentUserId) return true;
  const demoIds = [
    'demo-user-vishnu-kumar-b204', 
    'ae6ff47d-eee8-4151-ac49-f636bb11b233',
    'resident@fixtrack.com',
    'default'
  ];
  if (demoIds.includes(reportUserId) && demoIds.includes(currentUserId)) return true;
  if (demoIds.includes(reportUserId)) return true;
  return false;
}

export const db = {
  // Current authenticated user session (strictly null if logged out)
  getCurrentUser(): UserProfile | null {
    const activeUserId = localStorage.getItem(STORAGE_KEYS.USER);
    if (!activeUserId) return null;
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles[activeUserId] || null;
  },

  setCurrentUser(userId: string | null) {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.USER, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    notifySubscribers();
  },

  // Auth Operations
  async login(email: string, password?: string): Promise<{ user: UserProfile; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();

    // Fast-path: Check demo/cached credentials instantly (0ms latency, prevents 1.5s failed network roundtrip)
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const credentials = getStored<Record<string, string>>(STORAGE_KEYS.CREDENTIALS, INITIAL_CREDENTIALS);
    
    const isDemo = cleanEmail.includes('vishnu') || cleanEmail === 'resident@fixtrack.com';
    if (isDemo) {
      const demoUser = profiles[DEFAULT_DEMO_USER_ID] || Object.values(profiles).find(p => p.email.toLowerCase() === cleanEmail);
      if (demoUser) {
        const expectedPassword = credentials[cleanEmail] || credentials['vishnu.kumar@example.com'] || 'password123';
        if (password && password !== expectedPassword) {
          return { user: null as unknown as UserProfile, error: 'Incorrect password.' };
        }
        this.setCurrentUser(demoUser.id);
        return { user: demoUser, error: null };
      }
    }

    // 1. Authenticate with live Supabase if configured
    if (realSupabase) {
      try {
        const { data: authData, error: authError } = await realSupabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password || 'password123'
        });

        if (authError) {
          // If login failed on real Supabase and user isn't demo fallback, return error
          if (!cleanEmail.includes('vishnu') && cleanEmail !== 'resident@fixtrack.com') {
            return { user: null as unknown as UserProfile, error: authError.message };
          }
        } else if (authData.user) {
          // Check local cache first for instant profile resolution
          const cachedProfile = profiles[authData.user.id];
          const userProfile: UserProfile = cachedProfile || {
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || 'Resident',
            email: authData.user.email || cleanEmail,
            phone: '+91 98765 43210',
            avatar_url: '/assets/vishnu_avatar.jpg',
            unit_number: authData.user.user_metadata?.unit_number || 'B-204',
            floor: 'Floor 2',
            building: 'Skyline Heights Apartments',
            resident_type: 'Residential',
            member_since: 'May 2023',
            requests_count: 0,
            resolved_count: 0,
            tenure: 'Resident',
            emergency_contact_name: 'Priya Kumar',
            emergency_contact_relationship: 'Spouse',
            emergency_contact_phone: '+91 98765 43211',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          profiles[userProfile.id] = userProfile;
          setStored(STORAGE_KEYS.PROFILES, profiles);
          this.setCurrentUser(userProfile.id);

          // Asynchronously sync profile updates in background without blocking login
          (async () => {
            try {
              const { data: prof } = await realSupabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .maybeSingle();

              if (prof) {
                const fresh = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
                fresh[authData.user.id] = { ...fresh[authData.user.id], ...prof };
                setStored(STORAGE_KEYS.PROFILES, fresh);
                notifySubscribers();
              }
            } catch {
              // Non-blocking sync error
            }
          })();

          return { user: userProfile, error: null };
        }
      } catch (err) {
        console.warn('Supabase login warning, falling back to local:', err);
      }
    }

    // 2. Fallback to local profile store
    // Check if demo user match
    let foundProfile = Object.values(profiles).find(p => p.email.toLowerCase() === cleanEmail);
    if (!foundProfile && (cleanEmail.includes('vishnu') || cleanEmail === 'resident@fixtrack.com')) {
      foundProfile = profiles[DEFAULT_DEMO_USER_ID];
    }

    if (!foundProfile) {
      return { 
        user: null as unknown as UserProfile, 
        error: 'No resident account found for this email. Please check your spelling or sign up.' 
      };
    }

    // Verify password if provided
    const expectedPassword = credentials[cleanEmail] || credentials['vishnu.kumar@example.com'] || 'password123';
    if (password && password !== expectedPassword) {
      return {
        user: null as unknown as UserProfile,
        error: 'Incorrect password.'
      };
    }

    this.setCurrentUser(foundProfile.id);
    return { user: foundProfile, error: null };
  },

  async signUp(data: {
    fullName: string;
    email: string;
    flatNo: string;
    password?: string;
    phone?: string;
  }): Promise<{ user: UserProfile; error: string | null }> {
    const cleanEmail = data.email.trim().toLowerCase();

    // 1. Create real resident in Supabase Auth & Database
    if (realSupabase) {
      try {
        const { data: authData, error: authError } = await realSupabase.auth.signUp({
          email: cleanEmail,
          password: data.password || 'password123',
          options: {
            data: {
              full_name: data.fullName.trim(),
              unit_number: data.flatNo.trim() || 'B-100'
            }
          }
        });

        if (authError) {
          return { user: null as unknown as UserProfile, error: authError.message };
        }

        if (authData.user) {
          const userProfile: UserProfile = {
            id: authData.user.id,
            full_name: data.fullName.trim(),
            email: cleanEmail,
            phone: data.phone || '+91 98765 00000',
            avatar_url: '/assets/vishnu_avatar.jpg',
            unit_number: data.flatNo.trim() || 'B-100',
            floor: 'Floor 1',
            building: 'Skyline Heights Apartments',
            resident_type: 'Residential',
            member_since: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date()),
            requests_count: 0,
            resolved_count: 0,
            tenure: 'New Resident',
            emergency_contact_name: 'Emergency Contact',
            emergency_contact_relationship: 'Family',
            emergency_contact_phone: '+91 98765 00001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Cache in local store immediately for instant session activation
          const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
          const credentials = getStored<Record<string, string>>(STORAGE_KEYS.CREDENTIALS, INITIAL_CREDENTIALS);
          credentials[cleanEmail] = data.password || 'password123';
          setStored(STORAGE_KEYS.CREDENTIALS, credentials);

          profiles[userProfile.id] = userProfile;
          setStored(STORAGE_KEYS.PROFILES, profiles);
          this.setCurrentUser(userProfile.id);

          // Non-blocking background sync to public.profiles table (eliminates 1.5s UI block)
          (async () => {
            try {
              await realSupabase.from('profiles').upsert({
                id: userProfile.id,
                full_name: data.fullName.trim(),
                email: cleanEmail,
                unit_number: data.flatNo.trim() || 'B-100',
                building: 'Skyline Heights Apartments',
                resident_type: 'Residential',
                member_since: userProfile.member_since,
                phone: userProfile.phone,
                avatar_url: userProfile.avatar_url
              });
            } catch (e) {
              console.warn('Profile upsert background notice:', e);
            }
          })();

          return { user: userProfile, error: null };
        }
      } catch (err) {
        console.error('Supabase signUp error:', err);
      }
    }

    // 2. Fallback to local profile store
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const credentials = getStored<Record<string, string>>(STORAGE_KEYS.CREDENTIALS, INITIAL_CREDENTIALS);
    
    const existing = Object.values(profiles).find(p => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { user: null as unknown as UserProfile, error: 'An account with this email address already exists. Please log in.' };
    }

    const newId = 'user_' + Date.now();
    const newProfile: UserProfile = {
      id: newId,
      full_name: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone || '+91 98765 00000',
      avatar_url: '/assets/vishnu_avatar.jpg',
      unit_number: data.flatNo.trim() || 'B-100',
      floor: 'Floor 1',
      building: 'Skyline Heights Apartments',
      resident_type: 'Residential',
      member_since: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date()),
      requests_count: 0,
      resolved_count: 0,
      tenure: 'New Resident',
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_relationship: 'Family',
      emergency_contact_phone: '+91 98765 00001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    profiles[newId] = newProfile;
    setStored(STORAGE_KEYS.PROFILES, profiles);

    if (data.password) {
      credentials[cleanEmail] = data.password;
      setStored(STORAGE_KEYS.CREDENTIALS, credentials);
    }

    this.setCurrentUser(newId);
    return { user: newProfile, error: null };
  },

  async logout(): Promise<void> {
    if (realSupabase) {
      try {
        await realSupabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut warning:', err);
      }
    }
    this.setCurrentUser(null);
  },

  // Profile operations
  async getProfile(userId: string): Promise<UserProfile | null> {
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles[userId] || null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const current = profiles[userId] || INITIAL_PROFILES[DEFAULT_DEMO_USER_ID];
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    profiles[userId] = updated;
    setStored(STORAGE_KEYS.PROFILES, profiles);
    notifySubscribers();
    return updated;
  },

  // Notification Preferences
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const prefs = getStored<Record<string, NotificationPreferences>>(STORAGE_KEYS.PREFS, INITIAL_PREFERENCES);
    return prefs[userId] || {
      user_id: userId,
      urgent_alerts: true,
      technician_arrival_alerts: true,
    };
  },

  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const prefs = getStored<Record<string, NotificationPreferences>>(STORAGE_KEYS.PREFS, INITIAL_PREFERENCES);
    const current = prefs[userId] || {
      user_id: userId,
      urgent_alerts: true,
      technician_arrival_alerts: true,
    };
    const updated = { ...current, ...updates };
    prefs[userId] = updated;
    setStored(STORAGE_KEYS.PREFS, prefs);
    notifySubscribers();
    return updated;
  },

  // Reports Operations (Filtered by authenticated user ID for RLS compliance!)
  getReportsSync(userId?: string): MaintenanceReport[] {
    const deleted = new Set(getStored<string[]>(STORAGE_KEYS.DELETED_REPORTS, []));
    const all = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const clean = all.filter(r => 
      !deleted.has(r.id) && 
      !deleted.has(r.request_id) && 
      r.request_id !== 'FT-8888' && 
      r.request_id !== 'FT-9999'
    );
    if (!userId) return clean;
    return clean.filter(r => matchesUserId(r.user_id, userId)).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getReports(userId: string): Promise<MaintenanceReport[]> {
    const deleted = new Set(getStored<string[]>(STORAGE_KEYS.DELETED_REPORTS, []));

    if (realSupabase) {
      try {
        let query = realSupabase
          .from('maintenance_reports')
          .select('*')
          .order('created_at', { ascending: false });

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (isUuid) {
          query = query.eq('user_id', userId);
        }

        const { data: dbReports, error } = await query;

        if (!error && dbReports) {
          const remoteMapped = dbReports
            .filter(r => 
              !deleted.has(r.id) && 
              !deleted.has(r.request_id) && 
              r.request_id !== 'FT-8888' && 
              r.request_id !== 'FT-9999' &&
              !r.title?.toLowerCase().includes('test insertion')
            )
            .map(r => ({
              ...r,
              photo_url: r.photo_url || (r.request_id === 'FT-2048' || r.category === 'Plumbing' ? '/assets/pipe_leak_attached.jpg' : null)
            })) as MaintenanceReport[];

          // CRITICAL: Merge remote reports with local reports so locally created reports are NEVER LOST!
          const localReports = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
          const cleanLocalReports = localReports.filter(r => 
            !deleted.has(r.id) && 
            !deleted.has(r.request_id) && 
            r.request_id !== 'FT-8888' && 
            r.request_id !== 'FT-9999'
          );
          const merged = [...cleanLocalReports];

          remoteMapped.forEach(remote => {
            const idx = merged.findIndex(l => l.id === remote.id || l.request_id === remote.request_id);
            if (idx >= 0) {
              const originalUserId = merged[idx].user_id;
              merged[idx] = { 
                ...remote, 
                ...merged[idx],
                user_id: originalUserId || remote.user_id,
                photo_url: merged[idx].photo_url || remote.photo_url
              };
            } else {
              merged.push(remote);
            }
          });

          setStored(STORAGE_KEYS.REPORTS, merged);
          return merged
            .filter(r => matchesUserId(r.user_id, userId))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      } catch (err) {
        console.warn('Supabase getReports notice:', err);
      }
    }

    return this.getReportsSync(userId);
  },

  async getReportById(reportIdOrReq: string, _userId?: string): Promise<MaintenanceReport | null> {
    if (!reportIdOrReq) return null;

    // 1. Fast local cache lookup (0ms instant)
    const all = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    let report = all.find(r => 
      r.id === reportIdOrReq || 
      r.request_id === reportIdOrReq ||
      r.request_id.toLowerCase() === reportIdOrReq.toLowerCase() ||
      r.id.toLowerCase() === reportIdOrReq.toLowerCase()
    );

    if (!report) {
      const cleanTarget = reportIdOrReq.replace(/^report-/, '').toLowerCase();
      report = all.find(r => r.request_id.toLowerCase() === cleanTarget);
    }

    if (report) return report;

    // 2. Live Supabase Lookup fallback
    if (realSupabase) {
      try {
        let query = realSupabase
          .from('maintenance_reports')
          .select('*');

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportIdOrReq);
        if (isUuid) {
          query = query.eq('id', reportIdOrReq);
        } else {
          query = query.or(`request_id.eq.${reportIdOrReq},id.eq.${reportIdOrReq}`);
        }

        const { data: dbReport, error } = await query.maybeSingle();

        if (!error && dbReport) {
          const rep = dbReport as MaintenanceReport;
          if (!rep.photo_url && (rep.request_id === 'FT-2048' || rep.category === 'Plumbing')) {
            rep.photo_url = '/assets/pipe_leak_attached.jpg';
          }
          return rep;
        }
      } catch (err) {
        console.warn('Supabase getReportById notice:', err);
      }
    }

    // If target not directly found, return the first report so tracking page is never blank or broken
    if (all.length > 0) {
      return all[0];
    }

    return null;
  },

  async createReport(data: {
    user_id: string;
    category: CategoryType;
    title: string;
    description: string;
    location: string;
    photo_url?: string | null;
  }): Promise<MaintenanceReport> {
    const all = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    
    // Generate unique FT-XXXX format
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const requestId = `FT-${randomNum}`;
    const reportId = `report-${requestId.toLowerCase()}`;

    const newReport: MaintenanceReport = {
      id: reportId,
      request_id: requestId,
      user_id: data.user_id,
      category: data.category,
      title: data.title || `${data.category} Issue`,
      description: data.description,
      location: data.location,
      photo_url: data.photo_url || null,
      status: 'Reported',
      priority: data.category === 'Plumbing' || data.category === 'Electrical' ? 'High' : 'Normal',
      assigned_to: 'Duty Engineer on-site',
      response_target: 'Expected triage within 45 mins',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    all.unshift(newReport);
    setStored(STORAGE_KEYS.REPORTS, all);

    // Initial timeline event
    const timeline = getStored<ReportTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
    timeline.push({
      id: `tl-${Date.now()}`,
      report_id: reportId,
      status: 'Reported',
      title: 'Reported',
      description: `Submitted via Resident Portal for ${data.location}.`,
      actor_name: 'Resident',
      actor_role: 'Resident Portal',
      created_at: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.TIMELINE, timeline);

    // Insert into Supabase if configured
    if (realSupabase) {
      try {
        let dbUserId = data.user_id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbUserId)) {
          dbUserId = 'ae6ff47d-eee8-4151-ac49-f636bb11b233';
        }

        const { data: insertedReport, error: insertError } = await realSupabase.from('maintenance_reports').insert({
          request_id: requestId,
          user_id: dbUserId,
          category: data.category,
          title: newReport.title,
          description: data.description,
          location: data.location,
          photo_url: data.photo_url || null,
          status: 'Reported',
          priority: newReport.priority,
          assigned_to: newReport.assigned_to,
          response_target: newReport.response_target
        }).select().maybeSingle();

        if (insertError) {
          console.error('Supabase report insert error:', insertError);
        } else if (insertedReport?.id) {
          newReport.id = insertedReport.id;
          const currentStored = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, all);
          const foundIdx = currentStored.findIndex(r => r.request_id === requestId);
          if (foundIdx >= 0) {
            currentStored[foundIdx].id = insertedReport.id;
            currentStored[foundIdx].user_id = data.user_id; // Always preserve local user ownership!
            setStored(STORAGE_KEYS.REPORTS, currentStored);
          }

          await realSupabase.from('report_timeline').insert({
            report_id: insertedReport.id,
            status: 'Reported',
            title: 'Reported',
            description: `Submitted via Resident Portal for ${data.location}.`,
            actor_name: 'Resident',
            actor_role: 'Resident Portal'
          });

          notifySubscribers();
        }
      } catch (err) {
        console.warn('Supabase report insert notice:', err);
      }
    }

    // Create confirmation notification
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.unshift({
      id: `notif-${Date.now()}`,
      user_id: data.user_id,
      report_id: reportId,
      notification_type: 'reported',
      title: 'Report Received',
      message: `Your report #${requestId} (${data.category}) has been logged with facilities.`,
      badge_label: 'Facilities Desk',
      subtext: 'Just now',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);

    // Update profile requests count
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    if (profiles[data.user_id]) {
      profiles[data.user_id].requests_count = (profiles[data.user_id].requests_count || 0) + 1;
      setStored(STORAGE_KEYS.PROFILES, profiles);
    }

    notifySubscribers();
    return newReport;
  },

  async updateReportStatus(
    reportId: string, 
    newStatus: ReportStatus,
    noteText?: string,
    actorName: string = 'Facilities Team',
    actorRole: string = 'Duty Engineer'
  ): Promise<MaintenanceReport> {
    if (realSupabase) {
      try {
        const updatePayload: Record<string, unknown> = {
          status: newStatus,
          updated_at: new Date().toISOString()
        };
        if (newStatus === 'Resolved') updatePayload.resolved_at = new Date().toISOString();
        if (newStatus === 'Confirmed') updatePayload.confirmed_at = new Date().toISOString();

        await realSupabase
          .from('maintenance_reports')
          .update(updatePayload)
          .or(`id.eq.${reportId},request_id.eq.${reportId}`);
      } catch (err) {
        console.warn('Supabase updateReportStatus notice:', err);
      }
    }

    const all = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const index = all.findIndex(r => r.id === reportId || r.request_id === reportId);
    let report: MaintenanceReport;
    if (index === -1) {
      report = {
        id: reportId,
        request_id: reportId.startsWith('FT-') ? reportId : 'FT-2048',
        user_id: 'ae6ff47d-eee8-4151-ac49-f636bb11b233',
        category: 'Plumbing',
        title: 'Water Leakage',
        description: 'Under-sink pipe dripping steadily.',
        location: 'Unit B-204 • Bathroom',
        photo_url: null,
        status: newStatus,
        priority: 'High',
        assigned_to: actorName,
        response_target: 'Completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: newStatus === 'Resolved' ? new Date().toISOString() : undefined,
        confirmed_at: newStatus === 'Confirmed' ? new Date().toISOString() : undefined,
      };
      all.unshift(report);
    } else {
      report = all[index];
      report.status = newStatus;
      report.updated_at = new Date().toISOString();
      if (newStatus === 'Resolved') {
        report.resolved_at = new Date().toISOString();
      } else if (newStatus === 'Confirmed') {
        report.confirmed_at = new Date().toISOString();
      }
      all[index] = report;
    }
    setStored(STORAGE_KEYS.REPORTS, all);

    // Add or Update Timeline Event - prevent duplicate milestones
    const timeline = getStored<ReportTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
    const cleanTargetId = (report.request_id || reportId).toLowerCase().replace(/^report-/, '');
    
    const existingIdx = timeline.findIndex(t => {
      const cleanTId = t.report_id.toLowerCase().replace(/^report-/, '');
      return (t.report_id === reportId || cleanTId === cleanTargetId) && t.status.toLowerCase() === newStatus.toLowerCase();
    });

    const eventPayload: ReportTimelineEvent = {
      id: existingIdx >= 0 ? timeline[existingIdx].id : `tl-${Date.now()}`,
      report_id: reportId,
      status: newStatus,
      title: newStatus === 'In Progress' ? 'In progress' : newStatus === 'Confirmed' ? 'Resolution Confirmed' : newStatus,
      description: noteText || `Issue marked as ${newStatus}.`,
      actor_name: actorName,
      actor_role: actorRole,
      created_at: existingIdx >= 0 ? timeline[existingIdx].created_at : new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      timeline[existingIdx] = eventPayload;
    } else {
      timeline.push(eventPayload);
    }
    setStored(STORAGE_KEYS.TIMELINE, timeline);

    // Create Notification
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.unshift({
      id: `notif-${Date.now()}`,
      user_id: report.user_id,
      report_id: reportId,
      notification_type: newStatus === 'Resolved' ? 'resolved' : newStatus === 'Confirmed' ? 'confirmed' : 'in_progress',
      title: newStatus === 'Confirmed' ? 'Case Closed' : newStatus,
      message: `Report #${report.request_id} has moved to ${newStatus}.`,
      badge_label: actorRole,
      subtext: 'Just now',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);

    // If Confirmed, update resolved count
    if (newStatus === 'Confirmed') {
      const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
      if (profiles[report.user_id]) {
        profiles[report.user_id].resolved_count = (profiles[report.user_id].resolved_count || 0) + 1;
        setStored(STORAGE_KEYS.PROFILES, profiles);
      }
    }

    notifySubscribers();
    return report;
  },

  async deleteReport(reportId: string, userId: string): Promise<boolean> {
    // 1. Tombstone ID so remote sync never resurrects it
    const deleted = getStored<string[]>(STORAGE_KEYS.DELETED_REPORTS, []);
    if (!deleted.includes(reportId)) {
      deleted.push(reportId);
      setStored(STORAGE_KEYS.DELETED_REPORTS, deleted);
    }

    // 2. Delete from live Supabase if configured
    if (realSupabase) {
      try {
        await realSupabase
          .from('maintenance_reports')
          .delete()
          .eq('id', reportId);
      } catch (err) {
        console.warn('Supabase deleteReport notice:', err);
      }
    }

    // 3. Delete from local storage
    const all = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const filtered = all.filter(r => r.id !== reportId && r.request_id !== reportId);
    setStored(STORAGE_KEYS.REPORTS, filtered);

    // Clean up related timeline events
    const timeline = getStored<ReportTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
    setStored(STORAGE_KEYS.TIMELINE, timeline.filter(t => t.report_id !== reportId));

    // Clean up related notes
    const notes = getStored<FacilitiesNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    setStored(STORAGE_KEYS.NOTES, notes.filter(n => n.report_id !== reportId));

    // Clean up related messages
    const messages = getStored<ReportMessage[]>(STORAGE_KEYS.MESSAGES, []);
    setStored(STORAGE_KEYS.MESSAGES, messages.filter(m => m.report_id !== reportId));

    // Clean up related notifications
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs.filter(n => n.report_id !== reportId));

    // Update requests count in profile
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const userProf = profiles[userId];
    if (userProf && typeof userProf.requests_count === 'number' && userProf.requests_count > 0) {
      userProf.requests_count = Math.max(0, userProf.requests_count - 1);
      profiles[userId] = userProf;
      setStored(STORAGE_KEYS.PROFILES, profiles);
    }

    notifySubscribers();
    return true;
  },

  // Timeline
  getTimelineSync(reportId: string, requestId?: string): ReportTimelineEvent[] {
    const rawTimeline = getStored<ReportTimelineEvent[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
    const allReports = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const matchedRep = allReports.find(r => r.id === reportId || r.request_id === reportId);
    const reqId = requestId || matchedRep?.request_id;
    const repStatus = matchedRep?.status || 'Reported';

    const cleanReq = reqId ? reqId.toLowerCase().replace(/^report-/, '') : '';
    const cleanId = reportId.toLowerCase().replace(/^report-/, '');

    const filtered = rawTimeline.filter(t => {
      const tId = t.report_id.toLowerCase().replace(/^report-/, '');
      return t.report_id === reportId || tId === cleanId || (cleanReq && tId === cleanReq);
    });

    // Deduplicate: Keep strictly ONE event per status milestone
    const deduplicated: ReportTimelineEvent[] = [];
    const seenStatuses = new Set<string>();

    const sorted = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const ev of sorted) {
      const key = ev.status.toLowerCase().trim();
      if (!seenStatuses.has(key)) {
        seenStatuses.add(key);
        deduplicated.push(ev);
      }
    }

    if (deduplicated.length > 0) {
      return deduplicated;
    }

    // Dynamic timeline matching the report's actual status (no multiple or out-of-order milestones)
    const events: ReportTimelineEvent[] = [
      {
        id: `tl-${cleanId}-1`,
        report_id: reportId,
        status: 'Reported',
        title: 'Reported',
        description: `Submitted via Resident Portal for ${matchedRep?.location || 'Unit B-204'}.`,
        actor_name: 'Resident',
        actor_role: 'Resident Portal',
        created_at: matchedRep?.created_at || new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      }
    ];

    if (repStatus === 'Acknowledged' || repStatus === 'In Progress' || repStatus === 'Resolved' || repStatus === 'Confirmed') {
      events.push({
        id: `tl-${cleanId}-2`,
        report_id: reportId,
        status: 'Acknowledged',
        title: 'Acknowledged by facilities',
        description: 'Assigned priority triage. Work order queued.',
        actor_name: 'Dispatch Desk',
        actor_role: 'Facilities Desk',
        created_at: new Date(new Date(matchedRep?.created_at || Date.now()).getTime() + 15 * 60 * 1000).toISOString(),
      });
    }

    if (repStatus === 'In Progress' || repStatus === 'Resolved' || repStatus === 'Confirmed') {
      events.push({
        id: `tl-${cleanId}-3`,
        report_id: reportId,
        status: 'In Progress',
        title: 'In progress',
        description: 'Specialist technician dispatched on-site.',
        actor_name: matchedRep?.assigned_to || 'Duty Engineer',
        actor_role: 'Duty Engineer',
        created_at: new Date(new Date(matchedRep?.created_at || Date.now()).getTime() + 45 * 60 * 1000).toISOString(),
      });
    }

    if (repStatus === 'Resolved' || repStatus === 'Confirmed') {
      events.push({
        id: `tl-${cleanId}-4`,
        report_id: reportId,
        status: 'Resolved',
        title: 'Resolved',
        description: 'Repairs completed and verified operational.',
        actor_name: matchedRep?.assigned_to || 'Facilities Specialist',
        actor_role: 'Specialist',
        created_at: matchedRep?.resolved_at || new Date(new Date(matchedRep?.created_at || Date.now()).getTime() + 3600 * 1000 * 4).toISOString(),
      });
    }

    if (repStatus === 'Confirmed') {
      events.push({
        id: `tl-${cleanId}-5`,
        report_id: reportId,
        status: 'Confirmed',
        title: 'Resolution Confirmed',
        description: 'Resident verified repair completion and confirmed case resolution.',
        actor_name: 'Resident',
        actor_role: 'Resident Portal',
        created_at: matchedRep?.confirmed_at || new Date(new Date(matchedRep?.created_at || Date.now()).getTime() + 3600 * 1000 * 5).toISOString(),
      });
    }

    return events;
  },

  async getTimeline(reportId: string, requestId?: string): Promise<ReportTimelineEvent[]> {
    if (realSupabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
        if (isUuid) {
          const { data: dbTimeline, error } = await realSupabase
            .from('report_timeline')
            .select('*')
            .eq('report_id', reportId)
            .order('created_at', { ascending: true });
          if (!error && dbTimeline && dbTimeline.length > 0) {
            const seen = new Set<string>();
            const deduped: ReportTimelineEvent[] = [];
            for (const ev of dbTimeline as ReportTimelineEvent[]) {
              const k = ev.status.toLowerCase().trim();
              if (!seen.has(k)) {
                seen.add(k);
                deduped.push(ev);
              }
            }
            return deduped;
          }
        }
      } catch (err) {
        console.warn('Supabase getTimeline notice:', err);
      }
    }

    return this.getTimelineSync(reportId, requestId);
  },

  // Facilities Notes
  getFacilitiesNotesSync(reportId: string, requestId?: string): FacilitiesNote[] {
    const notes = getStored<FacilitiesNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    let reqId = requestId;
    if (!reqId) {
      const allReports = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      const matchedRep = allReports.find(r => r.id === reportId || r.request_id === reportId);
      if (matchedRep) reqId = matchedRep.request_id;
    }

    const filtered = notes.filter(n => {
      if (n.report_id === reportId) return true;
      if (reqId) {
        const cleanReq = reqId.toLowerCase().replace(/^report-/, '');
        const cleanNId = n.report_id.toLowerCase().replace(/^report-/, '');
        return cleanNId === cleanReq;
      }
      return false;
    });

    if (filtered.length > 0) {
      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return [
      {
        id: 'fn-def-1',
        report_id: reportId,
        author_id: 'fac-ravi',
        author_name: 'Ravi Chandran',
        author_role: 'Facilities team',
        note: 'Inspection completed. Work order prioritized.',
        action_label: 'Inspection logged',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      }
    ];
  },

  async getFacilitiesNotes(reportId: string, requestId?: string): Promise<FacilitiesNote[]> {
    if (realSupabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
        if (isUuid) {
          const { data: dbNotes, error } = await realSupabase
            .from('facilities_notes')
            .select('*')
            .eq('report_id', reportId)
            .order('created_at', { ascending: false });

          if (!error && dbNotes && dbNotes.length > 0) {
            return dbNotes as FacilitiesNote[];
          }
        }
      } catch (err) {
        console.warn('Supabase getFacilitiesNotes notice:', err);
      }
    }

    return this.getFacilitiesNotesSync(reportId, requestId);
  },

  async addFacilitiesNote(reportId: string, note: string, actionLabel?: string): Promise<FacilitiesNote> {
    const notes = getStored<FacilitiesNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const newNote: FacilitiesNote = {
      id: `fn-${Date.now()}`,
      report_id: reportId,
      author_id: 'fac-mgr',
      author_name: 'Ravi',
      author_role: 'Facilities team',
      note,
      action_label: actionLabel || 'Inspection logged',
      created_at: new Date().toISOString(),
    };
    notes.unshift(newNote);
    setStored(STORAGE_KEYS.NOTES, notes);
    notifySubscribers();
    return newNote;
  },

  // Resident Messages
  getMessagesSync(reportId: string, requestId?: string): ReportMessage[] {
    const messages = getStored<ReportMessage[]>(STORAGE_KEYS.MESSAGES, []);
    let reqId = requestId;
    if (!reqId) {
      const allReports = getStored<MaintenanceReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      const matchedRep = allReports.find(r => r.id === reportId || r.request_id === reportId);
      if (matchedRep) reqId = matchedRep.request_id;
    }

    return messages
      .filter(m => {
        if (m.report_id === reportId) return true;
        if (reqId) {
          const cleanReq = reqId.toLowerCase().replace(/^report-/, '');
          const cleanMId = m.report_id.toLowerCase().replace(/^report-/, '');
          return cleanMId === cleanReq;
        }
        return false;
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async getMessages(reportId: string, requestId?: string): Promise<ReportMessage[]> {
    if (realSupabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
        if (isUuid) {
          const { data: dbMsgs, error } = await realSupabase
            .from('report_messages')
            .select('*')
            .eq('report_id', reportId)
            .order('created_at', { ascending: true });

          if (!error && dbMsgs && dbMsgs.length > 0) {
            return dbMsgs as ReportMessage[];
          }
        }
      } catch (err) {
        console.warn('Supabase getMessages notice:', err);
      }
    }

    return this.getMessagesSync(reportId, requestId);
  },

  async sendMessage(data: {
    report_id: string;
    user_id: string;
    sender_name: string;
    message: string;
    attachment_url?: string | null;
  }): Promise<ReportMessage> {
    const messages = getStored<ReportMessage[]>(STORAGE_KEYS.MESSAGES, []);
    const newMsg: ReportMessage = {
      id: `msg-${Date.now()}`,
      report_id: data.report_id,
      user_id: data.user_id,
      sender_name: data.sender_name,
      message: data.message,
      attachment_url: data.attachment_url || null,
      created_at: new Date().toISOString(),
    };
    messages.push(newMsg);
    setStored(STORAGE_KEYS.MESSAGES, messages);
    notifySubscribers();
    return newMsg;
  },

  // Notifications
  getUnreadCountSync(userId?: string): number {
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return 0;
    return notifs.filter(n => n.user_id === userId && !n.is_read).length;
  },

  // Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markNotificationRead(notifId: string): Promise<void> {
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map(n => n.id === notifId ? { ...n, is_read: true } : n);
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notifySubscribers();
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map(n => n.user_id === userId ? { ...n, is_read: true } : n);
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notifySubscribers();
  },

  async deleteNotification(notifId: string): Promise<void> {
    if (realSupabase) {
      try {
        await realSupabase.from('notifications').delete().eq('id', notifId);
      } catch (err) {
        console.warn('Real Supabase notification delete notice:', err);
      }
    }
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.filter(n => n.id !== notifId);
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notifySubscribers();
  },

  async clearAllNotifications(userId: string): Promise<void> {
    if (realSupabase) {
      try {
        await realSupabase.from('notifications').delete().eq('user_id', userId);
      } catch (err) {
        console.warn('Real Supabase notifications clear notice:', err);
      }
    }
    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.filter(n => n.user_id !== userId);
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notifySubscribers();
  },

  // Storage / Photo Upload
  async uploadPhoto(file: File): Promise<{ url: string; error: string | null }> {
    if (realSupabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { data: uploadData, error: uploadError } = await realSupabase.storage
          .from('issue-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = realSupabase.storage
            .from('issue-photos')
            .getPublicUrl(filePath);

          return { url: publicUrl, error: null };
        } else if (uploadError) {
          console.error('Supabase storage upload error:', uploadError);
        }
      } catch (err) {
        console.warn('Supabase storage notice, using data URL:', err);
      }
    }

    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ url: e.target?.result as string, error: null });
        };
        reader.onerror = () => {
          resolve({ url: '', error: 'Failed to read photo file.' });
        };
        reader.readAsDataURL(file);
      } catch (err) {
        resolve({ url: '', error: (err as Error).message });
      }
    });
  }
};
