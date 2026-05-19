export interface User {
  id: string;
  email: string;
  name: string | null;
  username?: string;
  isEmailVerified: boolean;
  dailyFolderId: string | null;
  dailyListId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
