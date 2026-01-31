import apiClient from '@/lib/api-client';
import {
  AuthResponse,
  ExtendedAuthResponse,
  TokenResponse,
  OTPResponse,
  SendOTPResponse,
  InternalOTPResponse,
  LoginCredentials,
  User
} from '@/types/auth';
import { API_ENDPOINTS } from '@/types/api';

export class AuthService {
  /**
   * Send OTP to the provided mobile number (using login endpoint)
   */
  static async sendOTP(mobile: string): Promise<OTPResponse> {
    try {
      const response = await apiClient.post<{ data: string; message: string }>(
        API_ENDPOINTS.AUTH.LOGIN,
        { phoneNumber: mobile }
      );

      if (response.success) {
        if (response.data && typeof response.data.data === 'string') {
          apiClient.setTempToken(response.data.data);
        }
        return {
          success: true,
          message: response.message || 'OTP sent successfully',
          data: response.data.data, // This is the string temp token
        };
      }

      throw new Error(response.message || 'Failed to send OTP');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  static async verifyOTP(credentials: LoginCredentials): Promise<ExtendedAuthResponse> {
    try {
      // Get the temp token that should be used for this request
      const tempToken = apiClient.getTempToken();

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        { otp: credentials.otp, phoneNumber: credentials.mobile }
      );

      if (response.success) {
        // Clear temp token after successful verification
        apiClient.clearTempToken();

        // The response.data contains the actual response structure
        const authData = response.data as { token: string; user: any };

        if (authData && authData.token && authData.user) {
          apiClient.setTokens(authData.token); // No refresh token in this API
          
          return {
            user: authData.user,
            token: authData.token,
            refreshToken: undefined,
            expiresIn: undefined
          };
        }

        throw new Error('Invalid response format from verify OTP API');
      }

      throw new Error(response.message || 'Invalid OTP');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * Note: This API doesn't support refresh tokens, so we'll need to re-authenticate
   */


  /**
   * Logout user and clear tokens
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local auth state
      apiClient.clearAuth();
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.USER.PROFILE);

      if (response.success) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get user profile');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Validate mobile number format
   */
  static validateMobile(mobile: string): boolean {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile.replace(/\D/g, ''));
  }

  /**
   * Validate OTP format
   */
  static validateOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }

  /**
   * Format mobile number for display
   */
  static formatMobile(mobile: string): string {
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return mobile;
  }
}