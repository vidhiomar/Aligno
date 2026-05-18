export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: "employee" | "manager" | "admin";
  manager_id: number | null;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: "bearer";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  full_name?: string;
}
