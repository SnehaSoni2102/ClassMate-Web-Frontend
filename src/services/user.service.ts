import apiClient from '@/lib/api-client';
import { User, UserStats, UserProfile, UserSearchResult } from '@/types/auth';
import { Group, GroupApiResponse } from '@/types/group';
import { Test } from '@/types/test';
import { ApiResponse, API_ENDPOINTS, PaginatedResponse } from '@/types/api';

export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.USER.PROFILE);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get user profile');
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: Partial<UserProfile>): Promise<User> {
    try {
      const response = await apiClient.put<User>(
        API_ENDPOINTS.USER.UPDATE_PROFILE,
        profileData
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get<UserStats>(API_ENDPOINTS.USER.STATS);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get user stats');
    } catch (error: any) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Get user's groups
   */
  static async getUserGroups(): Promise<GroupApiResponse[]> {
    try {
      const response = await apiClient.get<GroupApiResponse[]>(
        API_ENDPOINTS.USER.GROUPS
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get user groups');
    } catch (error: any) {
      console.error('Get user groups error:', error);
      throw error;
    }
  }

  /**
   * Get user's tests
   */
  static async getUserTests(params?: {
    page?: number;
    limit?: number;
    status?: 'completed' | 'in_progress' | 'scheduled';
    groupId?: string;
  }): Promise<PaginatedResponse<Test>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Test>>(
        API_ENDPOINTS.USER.TESTS,
        params
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get user tests');
    } catch (error: any) {
      console.error('Get user tests error:', error);
      throw error;
    }
  }

  /**
   * Get user's recent activities
   */
  static async getRecentActivities(limit = 10): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/user/activities', { limit });

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get recent activities');
    } catch (error: any) {
      console.error('Get recent activities error:', error);
      throw error;
    }
  }

  /**
   * Get user's upcoming tests
   */
  static async getUpcomingTests(limit = 5): Promise<Test[]> {
    try {
      const response = await apiClient.get<Test[]>('/user/upcoming-tests', { limit });

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get upcoming tests');
    } catch (error: any) {
      console.error('Get upcoming tests error:', error);
      throw error;
    }
  }

  /**
   * Search users by name
   */
  static async searchUsers(name: string): Promise<UserSearchResult[]> {
    try {
      const response = await apiClient.get<UserSearchResult[]>(`/users/name`, {
        name: name
      });

      if (response.success) {
        return response.data || [];
      }

      throw new Error(response.message || 'Failed to search users');
    } catch (error: any) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<User> {
    try {
      const response = await apiClient.patch<User>(
        API_ENDPOINTS.USER.UPDATE_PROFILE,
        { preferences }
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update preferences');
    } catch (error: any) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }
}