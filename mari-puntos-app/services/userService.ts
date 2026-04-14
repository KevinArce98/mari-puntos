import {
  Achievement,
  ApiResponse,
  CreatePartnerLinkResponse,
  CreateUserRequest,
  GetPartnerLinkCodeResponse,
  JoinPartnerRequest,
  JoinPartnerResponse,
  PartnerInfo,
  UpdateProfileRequest,
  User,
  UserStats,
} from '@/types';
import { apiService } from './api';

class UserService {
  /**
   * Get current user profile
   * GET /users/profile
   */
  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/users/profile');
    return response.data;
  }

  /**
   * Create user profile
   * POST /users/profile
   */
  async createProfile(data: CreateUserRequest): Promise<User> {
    const response = await apiService.post<ApiResponse<User>>('/users/profile', data);
    return response.data;
  }

  /**
   * Update user profile
   * PUT /users/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>('/users/profile', data);
    return response.data;
  }

  /**
   * Update push token
   * PUT /users/profile
   */
  async updatePushToken(pushToken: string): Promise<User> {
    return this.updateProfile({ pushToken });
  }

  /**
   * Get user statistics
   * GET /users/stats
   */
  async getStats(): Promise<UserStats> {
    const response = await apiService.get<ApiResponse<UserStats>>('/users/stats');
    return response.data;
  }

  async getAchievements(): Promise<Achievement[]> {
    const response =
      await apiService.get<ApiResponse<Achievement[]>>('/users/achievements');
    return response.data;
  }

  /**
   * Create a partner link
   * POST /partner/create
   */
  async createPartnerLink(): Promise<CreatePartnerLinkResponse> {
    const response =
      await apiService.post<ApiResponse<CreatePartnerLinkResponse>>('/partner/create');
    return response.data;
  }

  /**
   * Get partner link code
   * GET /partner/link-code
   */
  async getPartnerLinkCode(): Promise<GetPartnerLinkCodeResponse> {
    const response =
      await apiService.get<ApiResponse<GetPartnerLinkCodeResponse>>('/partner/link-code');
    return response.data;
  }

  /**
   * Join a partner link
   * POST /partner/join
   */
  async joinPartnerLink(data: JoinPartnerRequest): Promise<JoinPartnerResponse> {
    const response = await apiService.post<ApiResponse<JoinPartnerResponse>>(
      '/partner/join',
      data
    );
    return response.data;
  }

  /**
   * Get partner information
   * GET /partner
   */
  async getPartnerInfo(): Promise<PartnerInfo | null> {
    const response = await apiService.get<ApiResponse<PartnerInfo | null>>('/partner');
    return response.data;
  }

  /**
   * Unlink from partner
   * POST /partner/unlink
   */
  async unlinkPartner(): Promise<void> {
    await apiService.post<ApiResponse<null>>('/partner/unlink');
  }
}

export const userService = new UserService();
