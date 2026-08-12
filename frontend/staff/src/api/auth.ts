import { apiRequest } from "./client";

export interface LoginRequest {
  staff_id: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  staff_id: string;
  name: string;
  role: string;
}

export async function loginStaff(
  data: LoginRequest
): Promise<LoginResponse> {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}