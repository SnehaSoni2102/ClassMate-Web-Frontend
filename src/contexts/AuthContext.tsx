
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { User, AuthState, LoginCredentials } from '@/types/auth';
import { STORAGE_KEYS } from '@/types/api';
import { safeLocalStorage, safeSessionStorage } from '@/lib/utils';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  sendOTP: (mobile: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
    refreshToken: null,
    error: null
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = safeLocalStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const refreshToken = safeLocalStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userData = safeLocalStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          const user = JSON.parse(userData);
          setAuthState(prev => ({
            ...prev,
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          }));

          // Verify token is still valid by fetching fresh user data
          try {
            const freshUser = await UserService.getProfile();
            setAuthState(prev => ({
              ...prev,
              user: freshUser
            }));
            
            // Update stored user data
            safeLocalStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(freshUser));
          } catch {
            await clearAuthState();
          }
        } else {
          // Clear any existing temp token if user is not authenticated
          safeSessionStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
          setAuthState(prev => ({
            ...prev,
            isLoading: false
          }));
        }
      } catch {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize authentication'
        }));
      }
    };

    initializeAuth();
  }, []);

  // Note: Auto token refresh is disabled since the API doesn't support refresh tokens
  // Users will need to login again when their token expires

  const clearAuthState = useCallback(async () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      refreshToken: null,
      error: null
    });

    // Clear localStorage
    safeLocalStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    safeLocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    safeLocalStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Clear sessionStorage (temp token)
    safeSessionStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
  }, []);

  const sendOTP = async (mobile: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!AuthService.validateMobile(mobile)) {
        throw new Error('Please enter a valid mobile number');
      }

      await AuthService.sendOTP(mobile);

      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send OTP'
      }));
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!AuthService.validateMobile(credentials.mobile)) {
        throw new Error('Please enter a valid mobile number');
      }

      if (!AuthService.validateOTP(credentials.otp)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      const authResponse = await AuthService.verifyOTP(credentials);

      // Store tokens and user data
      safeLocalStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authResponse.token);
      if (authResponse.refreshToken) {
        safeLocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken);
      }
      safeLocalStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));

      setAuthState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        token: authResponse.token,
        refreshToken: authResponse.refreshToken || null,
        error: null
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed'
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Call logout API
      await AuthService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state regardless of API success
      await clearAuthState();
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!authState.isAuthenticated) return;

    try {
      const user = await UserService.getProfile();
      
      setAuthState(prev => ({ ...prev, user }));
      safeLocalStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh user data'
      }));
    }
  };

  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    sendOTP,
    refreshUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
