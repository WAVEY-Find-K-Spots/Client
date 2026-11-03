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
  isNewUser: boolean;
}

export interface LocalLoginRequest {
  email: string;
  password: string;
}

export interface LocalSignupRequest extends LocalLoginRequest {
  name: string;
}

export interface LocalPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LocalPasswordResetRequest {
  email: string;
}

export interface LocalPasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export type CountryCode =
  | "KR"
  | "CN"
  | "VN"
  | "TH"
  | "UZ"
  | "NP"
  | "KH"
  | "ID"
  | "PH"
  | "MM"
  | "MN"
  | "US"
  | "KZ"
  | "LK"
  | "RU"
  | "BD";

export type UserLanguage = "KO" | "EN";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  provider: string;
  role: "USER" | "ADMIN";
  profileImageUrl: string | null;
  nickname: string | null;
  countryCode: CountryCode | null;
  language: UserLanguage;
  locationEnabled: boolean;
  marketingEnabled: boolean;
}

export interface UserProfileUpdateRequest {
  nickname?: string;
  countryCode?: CountryCode;
  language?: UserLanguage;
  locationEnabled?: boolean;
  marketingEnabled?: boolean;
}

export type SocialProvider = "google" | "kakao";
export type LoginUrls = Partial<Record<SocialProvider, string>>;
