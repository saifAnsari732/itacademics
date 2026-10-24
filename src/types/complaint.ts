export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Rejected';

export const COMPLAINT_CATEGORIES = [
  'Software & Bug Reports',
  'Account & Access Permissions',
  'Course & Lab Environment',
  'Hardware & Workstation Issues',
  'Network, VPN & Server Downtime',
  'Billing, Invoicing & Subscriptions',
  'Project & Code Review Support',
  'Certificates & Placement Assistance',
  'Security & Data Privacy',
  'General Technical Inquiry'
] as const;

export type ComplaintCategory = typeof COMPLAINT_CATEGORIES[number];

export interface Complaint {
  id: string; // Firestore document ID
  complaintId: string; // Formatted unique ID, e.g. CMP-20261023-A7K92
  fullName: string;
  mobile: string;
  email?: string;
  category: ComplaintCategory | string;
  subject: string;
  description: string;
  address?: string;
  attachmentPath?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: ComplaintStatus;
  adminNote?: string;
  createdAt: any; // Firestore Timestamp or ISO string
  updatedAt: any; // Firestore Timestamp or ISO string
  notificationStatus?: {
    adminNotified?: boolean;
    complainantNotified?: boolean;
    lastProcessedAt?: any;
  };
}

export interface ComplaintSummaryStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}
