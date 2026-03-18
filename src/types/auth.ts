export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin' | 'technician' | 'manager';
  branch_id?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface AuthError {
  message: string;
  field?: string;
}
