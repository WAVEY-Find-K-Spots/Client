export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
  error?: ApiErrorDetail;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  provider: string;
  role: "USER" | "ADMIN";
}

export type SocialProvider = "google" | "kakao";
export type LoginUrls = Partial<Record<SocialProvider, string>>;
