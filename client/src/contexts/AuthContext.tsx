import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { userService } from "@/api/userService";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirm: string) => Promise<string>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await userService.login(email, password);
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t);
    setUser(u as User);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, passwordConfirm: string) => {
    const res = await userService.signup(name, email, password, passwordConfirm);
    return res.message || "Verification code sent to email";
  }, []);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User | null) => {
    if (u && typeof u === "object") {
      localStorage.setItem("user", JSON.stringify(u));
      setUser(u);
    } else if (u === null) {
      // Only set to null if explicitly passed null (logout)
      localStorage.removeItem("user");
      setUser(null);
    } else {
      // For invalid data, keep existing user - don't logout!
      console.error("Invalid user object provided to updateUser, keeping existing user");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
