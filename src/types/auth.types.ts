export interface User {
  id: string;
  email: string;
  name: string | null;
  username?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
