"use client";

import { useState, useEffect } from "react";

import { AuthUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(false);
  useEffect(() => {
    const tokenAuth = localStorage.getItem("token");
    const userAuth = localStorage.getItem("user");
    setToken(tokenAuth);
    setUser(userAuth ? JSON.parse(userAuth) : null);
    setOk(true);
  }, []);

  const isAuthenticated = token && user;
  const login = (accessToken: string, authUser: AuthUser) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(authUser));
    setToken(accessToken);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return { user, token, ok, isAuthenticated, login, logout };
}
