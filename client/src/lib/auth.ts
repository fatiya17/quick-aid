import { User, LoginData } from "@shared/schema";
import { apiRequest } from "./queryClient";

let currentUser: User | null = null;

export function getCurrentUser(): User | null {
   try {
    const userString = localStorage.getItem("user");
    if (userString) {
      return JSON.parse(userString) as User;
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
  return currentUser;
}

export function setCurrentUser(user: User | null): void {
  currentUser = user;
}

export async function login(credentials: LoginData): Promise<User> {
  const response = await apiRequest("POST", "/api/login", credentials);
  const data = await response.json();

  localStorage.setItem("user", JSON.stringify(data.user)); 
  
  setCurrentUser(data.user);
  return data.user;
}

export function logout(): void {
  localStorage.removeItem("user");
  // Jika Anda menyimpan token: localStorage.removeItem("token");
  // Redirect ke halaman login setelah logout
  window.location.href = "/login"; 
  setCurrentUser(null);
}

export function isAdmin(): boolean {
  return currentUser?.role === "admin";
}

export function isAuthenticated(): boolean {
  return currentUser !== null;
}
