export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export interface NavigationItem {
  title: string;
  url: string;
  icon?: React.ComponentType;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface ProjectItem {
  name: string;
  url: string;
  icon: React.ComponentType;
}
