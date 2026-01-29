// Authentication and User Types
export type UserRole = 'student' | 'admin' | 'manager' | 'teacher' | 'group-manager';

export type Permission = 
  | 'view_dashboard'
  | 'join_groups'
  | 'create_tests'
  | 'manage_group_members'
  | 'view_all_test_results'
  | 'manage_group_settings'
  | 'manage_billing'
  | 'invite_members'
  | 'remove_members'
  | 'promote_members'
  | 'view_analytics';

export interface User {
  _id: string;
  phoneNumber: string;
  role: UserRole;
  isOnBoardingCompleted: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'suspended';
  freeCoins: number;
  categories: string[];
  exams: string[];
  myGroups: string[];
  invitedGroups: string[];
  requestedToJoinGroups: string[];
  submittedTests: string[];
  // Optional fields that might be present
  name?: string;
  email?: string;
  subscription?: SubscriptionInfo;
  profile?: UserProfile;
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  education: EducationInfo[];
  preferences: UserPreferences;
  stats: UserStats;
}

export interface EducationInfo {
  level: 'school' | 'college' | 'university';
  institution: string;
  course?: string;
  year?: number;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    testReminders: boolean;
    groupUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'groups' | 'private';
    showStats: boolean;
  };
}

export interface UserStats {
  testsAttended: number;
  groupsJoined: number;
  overallProgress: number;
  averageScore: number;
  streak: number;
  totalPoints: number;
  rank?: number;
}

export interface SubscriptionInfo {
  type: 'free' | 'premium' | 'trial';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt?: string;
  features: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  error: string | null;
}

export interface LoginCredentials {
  mobile: string;
  otp: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Extended AuthResponse for internal use (with optional refresh token)
export interface ExtendedAuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data: string; // The temp token string
}

// API response structure for sendOTP
export interface SendOTPResponse {
  data: string; // The temp token
  message: string;
}

// Internal OTP response for the service
export interface InternalOTPResponse {
  success: boolean;
  message: string;
  data: {
    data: string;
    message: string;
  }
}

export interface UserSearchResult {
  _id: string;
  phoneNumber: string;
  Name: string;
}