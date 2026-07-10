"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/constants/api";

interface LoginFormInputs {
  username: string;
  password: string;
  apiUrl: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>("http://localhost:8080");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("aaxion_token");
    const savedApiUrl = localStorage.getItem("aaxion_api_url");

    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = async (data: LoginFormInputs) => {
    setAuthLoading(true);
    setAuthError(null);
    setApiUrl(data.apiUrl);
    alert("login you in")
    try {
      const res = await fetch(`${data.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Invalid credentials");
      }

      const resData = await res.json();
      const authToken = resData.token;

      setToken(authToken);
      localStorage.setItem("aaxion_token", authToken);
      localStorage.setItem("aaxion_api_url", data.apiUrl);
    } catch (err: any) {
      setAuthError(err.message || "Connection refused. Make sure backend is running.");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch(`${apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
      } catch (e) {
        console.error("Backend logout error", e);
      }
    }

    setToken(null);
    localStorage.removeItem("aaxion_token");
  };

  return {
    token,
    apiUrl,
    setApiUrl,
    authLoading,
    authError,
    handleLogin,
    handleLogout,
  };
}
