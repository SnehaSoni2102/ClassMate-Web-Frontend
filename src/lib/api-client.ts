import { ApiResponse, AppError, ErrorType, ApiRequestConfig, STORAGE_KEYS } from '@/types/api';
import { safeSessionStorage } from '@/lib/utils';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;

  constructor(baseURL: string, timeout = 10000, maxRetries = 3) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private setAuthTokens(token: string, refreshToken?: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  private clearAuthTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  private async refreshAuthToken(): Promise<string | null> {
    // Since there's no refresh token mechanism, return null
    // This will cause the user to be redirected to login
    return null;
  }

  private createError(type: ErrorType, message: string, statusCode?: number, details?: any): AppError {
    return {
      type,
      message,
      statusCode,
      details,
      code: `${type}_${statusCode || 'UNKNOWN'}`
    };
  }

  private handleError(error: any): AppError {
    // Network errors
    if (!error.response) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Network error. Please check your internet connection.',
        0,
        error
      );
    }

    const { status, data } = error.response;

    // Handle different HTTP status codes
    switch (status) {
      case 401:
        this.clearAuthTokens();
        return this.createError(
          ErrorType.AUTH_ERROR,
          data?.message || 'Authentication failed. Please login again.',
          status,
          data
        );

      case 403:
        return this.createError(
          ErrorType.PERMISSION_ERROR,
          data?.message || 'You do not have permission to perform this action.',
          status,
          data
        );

      case 404:
        return this.createError(
          ErrorType.NOT_FOUND_ERROR,
          data?.message || 'The requested resource was not found.',
          status,
          data
        );

      case 422:
        return this.createError(
          ErrorType.VALIDATION_ERROR,
          data?.message || 'Validation failed.',
          status,
          data
        );

      case 429:
        return this.createError(
          ErrorType.RATE_LIMIT_ERROR,
          data?.message || 'Too many requests. Please try again later.',
          status,
          data
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return this.createError(
          ErrorType.SERVER_ERROR,
          data?.message || 'Server error. Please try again later.',
          status,
          data
        );

      default:
        return this.createError(
          ErrorType.SERVER_ERROR,
          data?.message || 'An unexpected error occurred.',
          status,
          data
        );
    }
  }

  private async makeRequest<T>(config: ApiRequestConfig, retryCount = 0): Promise<ApiResponse<T>> {
    const { method, url, data, params, headers = {}, timeout = this.timeout } = config;

    // Add auth token if available, fallback to temp token for OTP verification
    const token = this.getAuthToken();
    const tempToken = this.getTempToken();
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (tempToken && url.includes('/verify-otp')) {
      headers.Authorization = `Bearer ${tempToken}`;
    }

    // Handle FormData vs JSON data
    let body: string | FormData | undefined;
    if (data) {
      if (data instanceof FormData) {
        // Don't set Content-Type for FormData, let the browser set it with boundary
        delete headers['Content-Type'];
        body = data;
      } else {
        // Set Content-Type for JSON data
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        body = JSON.stringify(data);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Build URL with params
      const fullUrl = new URL(url, this.baseURL);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            fullUrl.searchParams.append(key, String(params[key]));
          }
        });
      }

      const response = await fetch(fullUrl.toString(), {
        method,
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let responseData: any;
      try {
        const text = await response.text();
        responseData = text.length > 0 ? JSON.parse(text) : null;
      } catch (parseError: any) {
        throw parseError;
      }

      if (!response.ok) {
        // Handle 401 - since there's no refresh token, just clear auth and throw error
        if (response.status === 401) {
          this.clearAuthTokens();
        }

        throw { response: { status: response.status, data: responseData } };
      }

      // Empty body with success (e.g. 204 No Content) - return valid ApiResponse
      if (responseData === null && response.ok) {
        return { success: true, data: null as any, message: 'Success' };
      }

      // Normalize response format - if the API doesn't return success field, assume success
      if (typeof responseData === 'object' && responseData !== null) {
        if (!('success' in responseData)) {
          return {
            success: true,
            data: responseData,
            message: 'Success'
          };
        }
      }

      return responseData;
    } catch (error: any) {
      // Retry logic for network errors
      if (retryCount < this.maxRetries && error.name === 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.makeRequest(config, retryCount + 1);
      }

      throw this.handleError(error);
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'GET', url, params });
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'PATCH', url, data });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'DELETE', url });
  }

  // Public utility methods
  public setTokens(token: string, refreshToken?: string): void {
    this.setAuthTokens(token, refreshToken);
  }

  public setTempToken(tempToken: string): void {
    safeSessionStorage.setItem(STORAGE_KEYS.TEMP_TOKEN, tempToken);
  }

  public getTempToken(): string | null {
    return safeSessionStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
  }

  public clearTempToken(): void {
    safeSessionStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
  }

  clearAuth(): void {
    this.clearAuthTokens();
    this.clearTempToken();
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Create singleton instance
const apiClient = new ApiClient(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
  10000,
  3
);

export default apiClient;