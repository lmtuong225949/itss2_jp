import { API_BASE_URL, API_ENDPOINTS } from '../constants';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  static login = (credentials: { email: string; password: string }) => {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  };

  static register = (userData: { name: string; email: string; password: string }) => {
    return this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  };

  static logout = () => {
    return this.post(API_ENDPOINTS.AUTH.LOGOUT);
  };

  static refreshToken = () => {
    return this.post(API_ENDPOINTS.AUTH.REFRESH);
  };

  // Parking endpoints
  static getParkingLots = (location?: { lat: number; lng: number }) => {
    const queryParams = location ? `?lat=${location.lat}&lng=${location.lng}` : '';
    return this.get(`${API_ENDPOINTS.PARKING.GET_LOTS}${queryParams}`);
  };

  static getParkingDetails = (id: string) => {
    return this.get(`${API_ENDPOINTS.PARKING.GET_DETAILS}/${id}`);
  };

  static bookParking = (bookingData: { parkingId: string; startTime: string; endTime: string }) => {
    return this.post(API_ENDPOINTS.PARKING.BOOK, bookingData);
  };

  static cancelBooking = (bookingId: string) => {
    return this.delete(`${API_ENDPOINTS.PARKING.CANCEL}/${bookingId}`);
  };

  // User endpoints
  static getUserProfile = () => {
    return this.get(API_ENDPOINTS.USER.PROFILE);
  };

  static updateUserProfile = (profileData: any) => {
    return this.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
  };
}

export default ApiService;
