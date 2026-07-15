import { useEffect, useState } from "react";
import { loginRequest, meRequest, registerRequest, googleLoginRequest, logoutRequest, updateProfileRequest } from "../api/auth.api";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "../store/authStore";

export function useAuth() {
  const [session, setSession] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession();

    if (!storedSession?.token) {
      return;
    }

    meRequest()
      .then((data) => {
        const nextSession = { ...storedSession, user: data.user };
        setSession(nextSession);
        setStoredSession(nextSession);
      })
      .catch(() => {
        setSession(null);
        clearStoredSession();
      });
  }, []);

  const login = async (payload) => {
    setLoading(true);
    try {
      const data = await loginRequest(payload);
      const nextSession = { user: data.user, token: data.token };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await registerRequest(payload);
      const nextSession = { user: data.user, token: data.token };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (payload) => {
    setLoading(true);
    try {
      const data = await googleLoginRequest(payload);
      const nextSession = { user: data.user, token: data.token };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error("Failed to call logout API:", err);
    }
    setSession(null);
    clearStoredSession();
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const data = await updateProfileRequest(payload);
      const nextSession = { ...session, user: data.user };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: session?.user || null,
    token: session?.token || "",
    isAuthenticated: Boolean(session?.token),
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
  };
}
