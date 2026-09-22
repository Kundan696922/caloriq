import { createContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication when the application starts.
  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await getCurrentUser();

        if (response.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        // No valid session.
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function register(userData) {
    const response = await registerUser(userData);

    if (response.success) {
      setUser(response.data.user);
    }

    return response;
  }

  async function login(credentials) {
    const response = await loginUser(credentials);

    if (response.success) {
      setUser(response.data.user);
    }

    return response;
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }

  // Lets any screen that edits the user (e.g. ProfilePage) sync the change
  // into the shared auth state immediately, instead of everything that
  // reads `user` from context staying stale until the next login/reload.
  // Accepts either a full replacement user object or a partial patch —
  // whichever the caller already has on hand.
  function updateUser(patch) {
    setUser((prev) => (prev ? { ...prev, ...patch } : patch));
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
