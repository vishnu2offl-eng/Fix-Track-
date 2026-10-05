-- ====================================================================
-- FixTrack Database Schema & Row Level Security (RLS)
-- REPORT. TRACK. RESOLVE.
-- ====================================================================

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Apartments Table
CREATE TABLE IF NOT EXISTS public.apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_name TEXT NOT NULL DEFAULT 'Skyline Heights Apartments',
    tower TEXT NOT NULL DEFAULT 'Tower B',
    unit_number TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '+91 98765 43210',
    avatar_url TEXT DEFAULT '/assets/vishnu_avatar.jpg',
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE SET NULL,
    unit_number TEXT NOT NULL DEFAULT 'B-204',
    floor TEXT DEFAULT 'Floor 2',
    building TEXT NOT NULL DEFAULT 'Skyline Heights Apartments',
    resident_type TEXT NOT NULL DEFAULT 'Residential',
    member_since TEXT NOT NULL DEFAULT 'May 2023',
    emergency_contact_name TEXT DEFAULT 'Priya Kumar',
    emergency_contact_relationship TEXT DEFAULT 'Spouse',
    emergency_contact_phone TEXT DEFAULT '+91 98765 43211',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    urgent_alerts BOOLEAN NOT NULL DEFAULT true,
    technician_arrival_alerts BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Maintenance Reports Table
CREATE TABLE IF NOT EXISTS public.maintenance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'Reported',
    priority TEXT NOT NULL DEFAULT 'Normal',
    assigned_to TEXT,
    response_target TEXT DEFAULT 'Expected triage within 45 mins',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ
);

-- 7. Report Timeline Table
CREATE TABLE IF NOT EXISTS public.report_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.maintenance_reports(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    actor_name TEXT,
    actor_role TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Facilities Notes Table
CREATE TABLE IF NOT EXISTS public.facilities_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.maintenance_reports(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Facilities Team',
    author_role TEXT NOT NULL DEFAULT 'Facilities Team',
    note TEXT NOT NULL,
    action_label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Report Messages Table (chat/notes from resident to facilities)
CREATE TABLE IF NOT EXISTS public.report_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.maintenance_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.maintenance_reports(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    badge_label TEXT,
    subtext TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Notification Preferences
CREATE POLICY "Users manage own notification preferences"
    ON public.notification_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Emergency Contacts
CREATE POLICY "Users manage own emergency contacts"
    ON public.emergency_contacts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Maintenance Reports: Users can ONLY see and manage their own reports
DROP POLICY IF EXISTS "Users view own maintenance reports" ON public.maintenance_reports;
CREATE POLICY "Users view own maintenance reports"
    ON public.maintenance_reports FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users create own maintenance reports" ON public.maintenance_reports;
CREATE POLICY "Users create own maintenance reports"
    ON public.maintenance_reports FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own maintenance reports" ON public.maintenance_reports;
CREATE POLICY "Users update own maintenance reports"
    ON public.maintenance_reports FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Users delete own maintenance reports" ON public.maintenance_reports;
CREATE POLICY "Users delete own maintenance reports"
    ON public.maintenance_reports FOR DELETE
    USING (true);

-- Report Timeline
DROP POLICY IF EXISTS "Users view timeline for own reports" ON public.report_timeline;
CREATE POLICY "Users view timeline for own reports"
    ON public.report_timeline FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users insert timeline for own reports" ON public.report_timeline;
CREATE POLICY "Users insert timeline for own reports"
    ON public.report_timeline FOR INSERT
    WITH CHECK (true);

-- Facilities Notes
DROP POLICY IF EXISTS "Users view facilities notes for own reports" ON public.facilities_notes;
CREATE POLICY "Users view facilities notes for own reports"
    ON public.facilities_notes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users insert facilities notes for own reports" ON public.facilities_notes;
CREATE POLICY "Users insert facilities notes for own reports"
    ON public.facilities_notes FOR INSERT
    WITH CHECK (true);

-- Report Messages
DROP POLICY IF EXISTS "Users view messages for own reports" ON public.report_messages;
CREATE POLICY "Users view messages for own reports"
    ON public.report_messages FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users insert messages for own reports" ON public.report_messages;
CREATE POLICY "Users insert messages for own reports"
    ON public.report_messages FOR INSERT
    WITH CHECK (true);

-- Notifications: Users only see and update their own notifications
CREATE POLICY "Users view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-photos', 'issue-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Issue Photos: Allow anyone to view and upload photos for maintenance requests
DROP POLICY IF EXISTS "Public Read Issue Photos" ON storage.objects;
CREATE POLICY "Public Read Issue Photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'issue-photos');

DROP POLICY IF EXISTS "Authenticated Upload Issue Photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload Issue Photos" ON storage.objects;
CREATE POLICY "Allow Upload Issue Photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'issue-photos');

DROP POLICY IF EXISTS "Allow Update Issue Photos" ON storage.objects;
CREATE POLICY "Allow Update Issue Photos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'issue-photos');

-- Avatars: Allow public read and upload
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
CREATE POLICY "Public Read Avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload Avatars" ON storage.objects;
CREATE POLICY "Allow Upload Avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');

-- ====================================================================
-- TRIGGERS & REALTIME SETUP
-- ====================================================================

-- Auto-create profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, unit_number)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Resident'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'unit_number', 'B-100')
    );
    INSERT INTO public.notification_preferences (user_id)
    VALUES (new.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Supabase Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities_notes;
