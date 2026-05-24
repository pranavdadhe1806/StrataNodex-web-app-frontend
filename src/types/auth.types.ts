export interface User {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  name: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'EMAIL' | 'SMS' | 'TOTP' | null;
  dayStartTime: string;
  dayEndTime: string;
  dailyFolderId: string | null;
  dailyListId: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
