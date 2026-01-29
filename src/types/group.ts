import { UserRole, Permission } from './auth';

export type GroupType = 'TEACHER' | 'STUDENT';
export type GroupStatus = 'active' | 'inactive' | 'archived';
export type MemberStatus = 'active' | 'inactive' | 'banned' | 'pending';

// New interface for API response structure
export interface GroupMemberApi {
  user: string | {_id: string};
  role: string;
  _id: string;
}

export interface PricePerStudent {
  price: number;
  duration: number; // in months
  _id: string;
}

export interface GroupApiResponse {
  _id: string;
  title: string;
  description: string;
  logo?: string;
  admin: string;
  members: GroupMemberApi[];
  invitedUsers: string[];
  joinRequests: any[];
  createdBy: 'TEACHER' | 'STUDENT';
  pricePerStudent?: PricePerStudent[];
  whatsappLink?: string;
  youtubeLink?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Group {
  id: string;
  title: string;
  description: string;
  type: GroupType;
  category: string;
  memberCount: number;
  maxMembers?: number;
  isPublic: boolean;
  inviteOnly: boolean;
  status: GroupStatus;
  subscription: GroupSubscription;
  settings: GroupSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  recentActivity?: string;
  testsCount: number;
  userRole?: UserRole; // Current user's role in this group
}

export interface GroupSettings {
  allowPublicJoin: boolean;
  requireApproval: boolean;
  maxMembers?: number;
  testCreationRoles: UserRole[];
  resultVisibility: 'public' | 'members' | 'creators';
  allowMemberInvites: boolean;
  autoApproveJoinRequests: boolean;
}

export interface GroupSubscription {
  type: 'free' | 'premium' | 'teacher';
  status: 'active' | 'expired' | 'trial';
  expiresAt?: string;
  billingInfo?: BillingInfo;
  features: string[];
  memberLimit?: number;
}

export interface BillingInfo {
  plan: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: string;
  paymentMethod?: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    avatar?: string;
  };
  role: UserRole;
  joinedAt: string;
  status: MemberStatus;
  permissions: Permission[];
  invitedBy?: string;
  lastActive?: string;
  testsCompleted: number;
}

export interface JoinRequest {
  id: string;
  userId: string;
  groupId: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    avatar?: string;
  };
  requestDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  testsCompleted: number;
}

export interface CreateGroupData {
  name: string;
  description: string;
  type: GroupType;
  category: string;
  isPublic: boolean;
  inviteOnly: boolean;
  maxMembers?: number;
  settings: Partial<GroupSettings>;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  inviteOnly?: boolean;
  maxMembers?: number;
  settings?: Partial<GroupSettings>;
}

export interface GroupFilters {
  type?: GroupType;
  category?: string;
  isPublic?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'memberCount' | 'createdAt' | 'recentActivity';
  sortOrder?: 'asc' | 'desc';
}

export interface GroupStats {
  totalMembers: number;
  activeMembers: number;
  totalTests: number;
  activeTests: number;
  averageScore: number;
  completionRate: number;
  recentActivity: GroupActivity[];
}

export interface GroupActivity {
  id: string;
  type: 'member_joined' | 'member_left' | 'test_created' | 'test_completed' | 'group_updated';
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// New interface for Find Groups API response
export interface FindGroupMember {
  _id: string;
  profilePicture: string | null;
}

export interface FindGroup {
  title: string;
  description: string;
  logo?: string;
  totalMembers: number;
  type: string;
  isJoined: boolean;
  status: string;
  members: FindGroupMember[];
}

// New interface for Search Members API response
export interface GroupSearchMember {
  _id: string;
  phoneNumber: string;
  role: string;
  Name: string;
  email: string;
  profilePicture: string;
  subscription: any; // Mostly null, will be defined later
  groupRole: string;
}