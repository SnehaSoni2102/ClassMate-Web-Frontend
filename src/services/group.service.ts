import apiClient from '@/lib/api-client';
import {
  Group,
  GroupMember,
  JoinRequest,
  CreateGroupData,
  UpdateGroupData,
  GroupFilters,
  GroupStats,
  GroupActivity,
  FindGroup,
  GroupApiResponse,
  GroupSearchMember,
} from '@/types/group';
import { GroupTestListItem } from '@/types/test';
import { ApiResponse, API_ENDPOINTS, PaginatedResponse } from '@/types/api';

export class GroupService {
  /**
   * Get list of groups with optional filters
   */
  static async getGroups(): Promise<GroupApiResponse[]> {
    try {
      const response = await apiClient.get<GroupApiResponse[]>(
        API_ENDPOINTS.GROUPS.MY_GROUPS,
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get groups');
    } catch (error: any) {
      console.error('Get groups error:', error);
      throw error;
    }
  }

  /**
   * Get all groups for discovery
   */
  static async getAllGroups(): Promise<FindGroup[]> {
    try {
      const response = await apiClient.get<FindGroup[]>(
        API_ENDPOINTS.GROUPS.ALL_GROUPS,
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get all groups');
    } catch (error: any) {
      console.error('Get all groups error:', error);
      throw error;
    }
  }

  /**
   * Get a specific group by ID
   */
  static async getGroup(id: string): Promise<GroupApiResponse> {
    try {
      const response = await apiClient.get<GroupApiResponse>(
        API_ENDPOINTS.GROUPS.DETAIL(id)
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get group');
    } catch (error: any) {
      console.error('Get group error:', error);
      throw error;
    }
  }

  /**
   * Create a new group
   */
  static async createGroup(groupData: CreateGroupData | FormData): Promise<Group> {
    try {
      const response = await apiClient.post<Group>(
        API_ENDPOINTS.GROUPS.CREATE,
        groupData
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create group');
    } catch (error: any) {
      console.error('Create group error:', error);
      throw error;
    }
  }

  /**
   * Update an existing group
   */
  static async updateGroup(id: string, groupData: UpdateGroupData): Promise<Group> {
    try {
      const response = await apiClient.put<Group>(
        API_ENDPOINTS.GROUPS.UPDATE(id),
        groupData
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update group');
    } catch (error: any) {
      console.error('Update group error:', error);
      throw error;
    }
  }

  /**
   * Delete a group
   */
  static async deleteGroup(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.GROUPS.DELETE(id)
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete group');
      }
    } catch (error: any) {
      console.error('Delete group error:', error);
      throw error;
    }
  }

  /**
   * Join a group
   */
  static async joinGroup(id: string, reason?: string): Promise<void> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GROUPS.JOIN(id),
        { reason }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to join group');
      }
    } catch (error: any) {
      console.error('Join group error:', error);
      throw error;
    }
  }

  /**
   * Request to join a group
   */
  static async joinGroupRequest(id: string, reason?: string): Promise<void> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GROUPS.JOIN_REQUEST(id),
        { reason }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to send join request');
      }
    } catch (error: any) {
      console.error('Join group request error:', error);
      throw error;
    }
  }

  /**
   * Leave a group
   */
  static async leaveGroup(id: string): Promise<void> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GROUPS.LEAVE(id)
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to leave group');
      }
    } catch (error: any) {
      console.error('Leave group error:', error);
      throw error;
    }
  }

  /**
   * Get group members
   */
  static async getGroupMembers(
    id: string,
    params?: { page?: number; limit?: number; role?: string; status?: string }
  ): Promise<PaginatedResponse<GroupMember>> {
    try {
      const response = await apiClient.get<PaginatedResponse<GroupMember>>(
        API_ENDPOINTS.GROUPS.MEMBERS(id),
        params
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get group members');
    } catch (error: any) {
      console.error('Get group members error:', error);
      throw error;
    }
  }

  /**
   * Search group members with detailed information
   */
  static async searchGroupMembers(id: string): Promise<GroupSearchMember[]> {
    try {
      const response = await apiClient.get<GroupSearchMember[]>(
        API_ENDPOINTS.GROUPS.SEARCH_MEMBERS(id)
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to search group members');
    } catch (error: any) {
      console.error('Search group members error:', error);
      throw error;
    }
  }

  /**
   * Add member to group
   */
  static async addMember(
    groupId: string, 
    userId: string, 
    role: string = 'member'
  ): Promise<GroupMember> {
    try {
      const response = await apiClient.post<GroupMember>(
        API_ENDPOINTS.GROUPS.MEMBERS(groupId),
        { userId, role }
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to add member');
    } catch (error: any) {
      console.error('Add member error:', error);
      throw error;
    }
  }

  /**
   * Remove member from group
   */
  static async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.GROUPS.MEMBERS(groupId)}/${userId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to remove member');
      }
    } catch (error: any) {
      console.error('Remove member error:', error);
      throw error;
    }
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    groupId: string, 
    userId: string, 
    role: string
  ): Promise<GroupMember> {
    try {
      const response = await apiClient.patch<GroupMember>(
        `${API_ENDPOINTS.GROUPS.MEMBERS(groupId)}/${userId}`,
        { role }
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update member role');
    } catch (error: any) {
      console.error('Update member role error:', error);
      throw error;
    }
  }

  /**
   * Get join requests for a group
   */
  static async getJoinRequests(
    id: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<PaginatedResponse<JoinRequest>> {
    try {
      const response = await apiClient.get<PaginatedResponse<JoinRequest>>(
        API_ENDPOINTS.GROUPS.REQUESTS(id),
        params
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get join requests');
    } catch (error: any) {
      console.error('Get join requests error:', error);
      throw error;
    }
  }

  /**
   * Approve join request
   */
  static async approveJoinRequest(groupId: string, requestId: string): Promise<void> {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.GROUPS.REQUESTS(groupId)}/${requestId}/approve`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to approve join request');
      }
    } catch (error: any) {
      console.error('Approve join request error:', error);
      throw error;
    }
  }

  /**
   * Reject join request
   */
  static async rejectJoinRequest(
    groupId: string, 
    requestId: string, 
    reason?: string
  ): Promise<void> {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.GROUPS.REQUESTS(groupId)}/${requestId}/reject`,
        { reason }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to reject join request');
      }
    } catch (error: any) {
      console.error('Reject join request error:', error);
      throw error;
    }
  }

  /**
   * Get group statistics
   */
  static async getGroupStats(id: string): Promise<GroupStats> {
    try {
      const response = await apiClient.get<GroupStats>(
        API_ENDPOINTS.GROUPS.STATS(id)
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get group stats');
    } catch (error: any) {
      console.error('Get group stats error:', error);
      throw error;
    }
  }

  /**
   * Get group activities
   */
  static async getGroupActivities(
    id: string,
    params?: { page?: number; limit?: number; type?: string }
  ): Promise<PaginatedResponse<GroupActivity>> {
    try {
      const response = await apiClient.get<PaginatedResponse<GroupActivity>>(
        `${API_ENDPOINTS.GROUPS.DETAIL(id)}/activities`,
        params
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get group activities');
    } catch (error: any) {
      console.error('Get group activities error:', error);
      throw error;
    }
  }

  /**
   * Get group tests (list from API: { success, data: GroupTestListItem[], message })
   */
  static async getGroupTests(id: string): Promise<GroupTestListItem[]> {
    try {
      const response = await apiClient.get<GroupTestListItem[]>(
        API_ENDPOINTS.GROUPS.FETCH_TESTS(id)
      );

      if (response.success) {
        const data = response.data;
        return Array.isArray(data) ? data : [];
      }

      throw new Error(response.message || 'Failed to get group tests');
    } catch (error: any) {
      console.error('Get group tests error:', error);
      throw error;
    }
  }

  /**
   * Invite users to group
   */
  static async inviteUsers(
    groupId: string, 
    invitations: { mobile: string; role?: string }[]
  ): Promise<void> {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.GROUPS.DETAIL(groupId)}/invite`,
        { invitations }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to send invitations');
      }
    } catch (error: any) {
      console.error('Invite users error:', error);
      throw error;
    }
  }

  /**
   * Search groups
   */
  static async searchGroups(query: string, filters?: Partial<GroupFilters>): Promise<Group[]> {
    try {
      const response = await apiClient.get<Group[]>(
        `${API_ENDPOINTS.GROUPS.LIST}/search`,
        { query, ...filters }
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to search groups');
    } catch (error: any) {
      console.error('Search groups error:', error);
      throw error;
    }
  }

  /**
   * Create test for a group
   */
  static async createGroupTest(groupId: string, testData: any): Promise<any> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.GROUP_TESTS.CREATE(groupId), testData);

      if (response.success) {
        return (response as any).test;
      }

      throw new Error(response.message || 'Failed to create group test');
    } catch (error: any) {
      console.error('Create group test error:', error);
      throw error;
    }
  }

  /**
   * Get single group test details
   */
  static async getGroupTest(groupId: string, testId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.GROUP_TESTS.DETAIL(groupId, testId));

      if (response.success) {
        return response; // Return the full response to access response.data.data
      }

      throw new Error(response.message || 'Failed to fetch group test details');
    } catch (error: any) {
      console.error('Get group test error:', error);
      throw error;
    }
  }

  /**
   * Update group test
   */
  static async updateGroupTest(groupId: string, testId: string, testData: any): Promise<any> {
    try {
      const response = await apiClient.patch<any>(API_ENDPOINTS.GROUP_TESTS.UPDATE(groupId, testId), testData);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update group test');
    } catch (error: any) {
      console.error('Update group test error:', error);
      throw error;
    }
  }

  /**
   * Delete group test
   */
  static async deleteGroupTest(groupId: string, testId: string): Promise<void> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.GROUP_TESTS.DELETE(groupId, testId));

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete group test');
      }
    } catch (error: any) {
      console.error('Delete group test error:', error);
      throw error;
    }
  }

  /**
   * Create website transaction
   */
  static async createWebsiteTransaction(transactionData: any): Promise<any> {
    try {
      const response = await apiClient.post('/transaction/create/website', transactionData);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create website transaction');
    } catch (error: any) {
      console.error('Create website transaction error:', error);
      throw error;
    }
  }

  /**
   * Create transaction order
   */
  static async createTransactionOrder(orderData: { transactionId: string }): Promise<any> {
    try {
      const response = await apiClient.post('/transaction/order', orderData);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create transaction order');
    } catch (error: any) {
      console.error('Create transaction order error:', error);
      throw error;
    }
  }

  /**
   * Assign manager role to a member
   */
  static async assignManager(groupId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.put(`/group/assign-manager/${groupId}/${userId}`);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to assign manager role');
    } catch (error: any) {
      console.error('Assign manager error:', error);
      throw error;
    }
  }

  /**
   * Demote manager to member
   */
  static async demoteManager(groupId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.put(`/group/demote-manager/${groupId}/${userId}`);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to demote manager');
    } catch (error: any) {
      console.error('Demote manager error:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/transaction/payment/website', paymentData);

      // Return the entire response object since the API structure is different
      return response;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }
}