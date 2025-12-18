export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data?: User[];
  message?: string;
}
