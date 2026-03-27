// ─── BigSuno — Shared Types ─────────────────────

export type Role = 'sunane_wala' | 'sunne_wala' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type SessionStatus = 'waiting' | 'ringing' | 'active' | 'completed' | 'missed' | 'refunded';

export type PaymentType = 'credit_reload' | 'direct_session';

export type Gender = 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';

export type Specialty =
  | 'relationship'
  | 'stress'
  | 'loneliness'
  | 'family'
  | 'work'
  | 'grief'
  | 'anxiety'
  | 'motivation'
  | 'general';

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  relationship: 'Relationship 💔',
  stress: 'Stress 😤',
  loneliness: 'Loneliness 🌧',
  family: 'Family 👨‍👩‍👦',
  work: 'Work 💼',
  grief: 'Grief 🕯',
  anxiety: 'Anxiety 😰',
  motivation: 'Motivation 🔥',
  general: 'General 💬',
};

export const MOOD_TAGS = [
  { id: 'general' as const, emoji: '😊', label: 'Theek' },
  { id: 'loneliness' as const, emoji: '😔', label: 'Udaas' },
  { id: 'stress' as const, emoji: '😤', label: 'Frustrated' },
  { id: 'anxiety' as const, emoji: '😰', label: 'Anxious' },
  { id: 'relationship' as const, emoji: '💔', label: 'Heartbroken' },
] as const;

export const SORT_OPTIONS = [
  { id: 'all', label: 'Sabke liye ⭐' },
  { id: 'top_rated', label: 'Top Rated 🏆' },
  { id: 'cheapest', label: 'Sabse Sasta 💸' },
  { id: 'newest', label: 'Naaye 🌱' },
  { id: 'online', label: 'Online 🟢' },
] as const;

// ─── Plan ───
export interface Plan {
  id: string;
  heading: string;
  minutes: number; // 1-60
  price: number; // ₹
  description: string;
  bannerUrl: string | null;
}

// ─── Provider Types ───
export type ProviderType = 'influencer' | 'mentor' | 'listener' | 'coach';

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  influencer: 'Influencer ✨',
  mentor: 'Mentor 🎓',
  coach: 'Coach 🏅',
  listener: 'Listener 👂',
};

// ─── User (Firestore users/{userId}) ───
export interface BigSunoUser {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl: string;
  roles: Role[];
  activeRole: Role;
  providerType?: ProviderType; // New: Categorization for unified feed
  createdAt: Date;

  // Sunane Wala fields
  creditBalance: number;
  totalCallMinutes: number;

  // Sunne Wala fields
  headline: string;
  bio: string;
  specialties: Specialty[];
  gender: Gender;
  age: number;
  plans: Plan[];
  ratingAvg: number;
  ratingCount: number;
  totalSessions: number;
  totalEarnings: number;
  availableBalance: number;
  isAvailable: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  isGenderLocked: boolean;
  verificationStatus: VerificationStatus;
  isOnHoliday: boolean;
  registeredAt: Date;
  lastActive: Date;
  phoneVerified: boolean;
  fcmToken: string;
  username: string;
  phoneNumber: string;
  owner?: boolean;
}

// ─── Session (Firestore sessions/{sessionId}) ───
export interface Session {
  sessionId: string;
  userId: string;
  listenerId: string;
  planId: string;
  planMinutes: number;
  planPrice: number;
  creditsUsed: number;
  payuAmount: number;
  payuTxnId: string | null;
  status: SessionStatus;
  createdAt: Date;
  connectedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number;
  actualDurationSeconds?: number;
  commissionRate: number;
  listenerEarned: number;
  rating: number | null;
  ratingComment: string | null;
  transactionId?: string | null;
  cutBy?: 'speaker' | 'listener' | 'auto' | null;
}

// ─── Transaction (for wallet history) ───
export interface Transaction {
  id: string;
  userId: string;
  speakerId?: string;       // New: Who paid
  listenerId?: string;      // New: Who earned
  type: 'credit_add' | 'credit_spend' | 'refund' | 'earning' | 'withdrawal';
  amount: number;           // Gross amount
  commissionRate?: number;  // New: % rate at time of txn (e.g. 5, 10, 15)
  platformFee?: number;     // New: Amount platform took
  listenerAmount?: number;  // New: Amount listener actually gets (Net)
  description: string;
  status: 'pending' | 'requested' | 'withdrawn' | 'rejected' | 'completed'; // New
  withdrawalRequestId?: string; // New: Link to the request
  createdAt: Date;
  relatedSessionId?: string;
}

// ─── Withdrawal Request ───
export interface WithdrawalRequest {
  id: string;
  listenerId: string;
  transactionIds: string[]; // New: List of earnings included
  amount: number;           // Total Gross
  platformFee: number;      // Total Fee
  netAmount: number;        // Total to pay listener
  upiId?: string;
  qrUrl?: string;           // New: Screenshot of QR
  rejectionReason?: string; // New: Why it was rejected
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
  processedAt: Date | null;
}

// ─── Listener Card (for browse grid) ───
export interface ListenerCard {
  uid: string;
  displayName: string;
  avatarUrl: string;
  headline: string;
  specialties: Specialty[];
  ratingAvg: number;
  ratingCount: number;
  totalSessions: number;
  isAvailable: boolean;
  isVerified: boolean;
  gender: Gender;
  age: number;
  cheapestPlan: { price: number; minutes: number } | null;
  username: string;
  isBlocked: boolean;
}

// ─── Avatar Options (for sunane wala onboarding) ───
export const AVATAR_OPTIONS = [
  { emoji: '😊', bg: '#FCF0EB' }, { emoji: '🌸', bg: '#F3EBFB' },
  { emoji: '🌙', bg: '#EBF1FB' }, { emoji: '🦋', bg: '#EBF7F1' },
  { emoji: '🌈', bg: '#FBF5E4' }, { emoji: '🎭', bg: '#FCF0EB' },
  { emoji: '🌿', bg: '#EBF7F1' }, { emoji: '💫', bg: '#FBF5E4' },
  { emoji: '🕊️', bg: '#EBF1FB' }, { emoji: '🎵', bg: '#F3EBFB' },
  { emoji: '🌊', bg: '#EBF1FB' }, { emoji: '🔥', bg: '#FCF0EB' },
  { emoji: '⭐', bg: '#FBF5E4' }, { emoji: '🍃', bg: '#EBF7F1' },
  { emoji: '💜', bg: '#F3EBFB' }, { emoji: '🌻', bg: '#FBF5E4' },
  { emoji: '🎈', bg: '#FCF0EB' }, { emoji: '🌍', bg: '#EBF1FB' },
  { emoji: '🦉', bg: '#F3EBFB' }, { emoji: '🌺', bg: '#FCF0EB' },
  { emoji: '🐚', bg: '#EBF7F1' }, { emoji: '🎪', bg: '#FBF5E4' },
  { emoji: '🧩', bg: '#EBF1FB' }, { emoji: '🌟', bg: '#FCF0EB' },
] as const;
