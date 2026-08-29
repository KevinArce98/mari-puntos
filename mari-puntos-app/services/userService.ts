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
  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/users/profile');
    return response.data;
  }

  async createProfile(data: CreateUserRequest): Promise<User> {
    const response = await apiService.post<ApiResponse<User>>('/users/profile', data);
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>('/users/profile', data);
    return response.data;
  }

  async updatePushToken(pushToken: string): Promise<User> {
    return this.updateProfile({ pushToken });
  }

  async getStats(): Promise<UserStats> {
    const response = await apiService.get<ApiResponse<UserStats>>('/users/stats');
    return response.data;
  }

  async getAchievements(): Promise<Achievement[]> {
    const response =
      await apiService.get<ApiResponse<Achievement[]>>('/users/achievements');
    return response.data;
  }

  async createPartnerLink(): Promise<CreatePartnerLinkResponse> {
    const response =
      await apiService.post<ApiResponse<CreatePartnerLinkResponse>>('/partner/create');
    return response.data;
  }

  async getPartnerLinkCode(): Promise<GetPartnerLinkCodeResponse> {
    const response =
      await apiService.get<ApiResponse<GetPartnerLinkCodeResponse>>('/partner/link-code');
    return response.data;
  }

  async joinPartnerLink(data: JoinPartnerRequest): Promise<JoinPartnerResponse> {
    const response = await apiService.post<ApiResponse<JoinPartnerResponse>>(
      '/partner/join',
      data
    );
    return response.data;
  }

  async getPartnerInfo(): Promise<PartnerInfo | null> {
    const response = await apiService.get<ApiResponse<PartnerInfo | null>>('/partner');
    return response.data;
  }

  async unlinkPartner(): Promise<void> {
    await apiService.post<ApiResponse<null>>('/partner/unlink');
  }

  async deleteAccount(): Promise<void> {
    await apiService.delete<ApiResponse<null>>('/users/account');
  }
}

export const userService = new UserService();
