import { User, LoginData } from "@shared/schema";
import { apiRequest } from "./queryClient";

let currentUser: User | null = null;

export function getCurrentUser(): User | null {
  return currentUser;
}

export function setCurrentUser(user: User | null): void {
  currentUser = user;
}

export async function login(credentials: LoginData): Promise<User> {
  const response = await apiRequest("POST", "/api/login", credentials);
  const data = await response.json();
  
  setCurrentUser(data.user);
  return data.user;
}

export function logout(): void {
  setCurrentUser(null);
}

export function isAdmin(): boolean {
  return currentUser?.role === "admin";
}

export function isAuthenticated(): boolean {
  return currentUser !== null;
}
