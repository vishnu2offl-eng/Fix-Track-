export type CategoryType = 
  | 'Electrical' 
  | 'Plumbing' 
  | 'Door / Lock' 
  | 'Lift' 
  | 'Common Area' 
  | 'Other';

export type ReportStatus = 
  | 'Reported' 
  | 'Acknowledged' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Confirmed';

export type PriorityLevel = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  apartment_id?: string;
  unit_number: string;
  floor: string;
  building: string;
  resident_type: string;
  member_since: string;
  requests_count?: number;
  resolved_count?: number;
  tenure?: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceReport {
  id: string;
  request_id: string;
  user_id: string;
  apartment_id?: string;
  category: CategoryType;
  title: string;
  description: string;
  location: string;
  photo_url?: string | null;
  status: ReportStatus;
  priority: PriorityLevel;
  assigned_to?: string | null;
  response_target?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  confirmed_at?: string | null;
}

export interface ReportTimelineEvent {
  id: string;
  report_id: string;
  status: ReportStatus;
  title: string;
  description: string;
  actor_name?: string | null;
  actor_role?: string | null;
  created_at: string;
}

export interface FacilitiesNote {
  id: string;
  report_id: string;
  author_id?: string | null;
  author_name: string;
  author_role: string;
  note: string;
  action_label?: string | null;
  created_at: string;
}

export interface ReportMessage {
  id: string;
  report_id: string;
  user_id: string;
  sender_name: string;
  message: string;
  attachment_url?: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  report_id?: string | null;
  notification_type: 'in_progress' | 'building_alert' | 'resolved' | 'facilities_note' | 'confirmed' | 'reported';
  title: string;
  message: string;
  badge_label: string;
  subtext: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  urgent_alerts: boolean;
  technician_arrival_alerts: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}
