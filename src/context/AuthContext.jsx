import { createContext, useContext, useState, useCallback } from "react";
import { playSuccessChime } from "../utils/audio";
const AuthContext = createContext(null);
function readSession() {
  try {
    const raw = localStorage.getItem("jp_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession());
  const [isImpersonating, setIsImpersonating] = useState(
    !!localStorage.getItem("jp_admin_backup"),
  );
  const login = useCallback((data) => {
    const next = {
      token: data.token,
      role: data.role,
      phone: data.phone,
    };
    localStorage.setItem("jp_token", data.token);
    localStorage.setItem("jp_session", JSON.stringify(next));
    setSession(next);
    playSuccessChime();
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("jp_token");
    localStorage.removeItem("jp_session");
    localStorage.removeItem("jp_admin_backup");
    localStorage.removeItem("jp_admin_token_backup");
    setSession(null);
    setIsImpersonating(false);
  }, []);
  const impersonate = useCallback((data) => {
    const currentSession = localStorage.getItem("jp_session");
    const currentToken = localStorage.getItem("jp_token");
    if (currentSession) localStorage.setItem("jp_admin_backup", currentSession);
    if (currentToken)
      localStorage.setItem("jp_admin_token_backup", currentToken);
    const next = {
      token: data.token,
      role: data.role,
      phone: data.phone,
    };
    localStorage.setItem("jp_token", data.token);
    localStorage.setItem("jp_session", JSON.stringify(next));
    setSession(next);
    setIsImpersonating(true);
    playSuccessChime();
  }, []);
  const stopImpersonating = useCallback(() => {
    const backupSession = localStorage.getItem("jp_admin_backup");
    const backupToken = localStorage.getItem("jp_admin_token_backup");
    if (backupSession && backupToken) {
      localStorage.setItem("jp_session", backupSession);
      localStorage.setItem("jp_token", backupToken);
      setSession(JSON.parse(backupSession));
      localStorage.removeItem("jp_admin_backup");
      localStorage.removeItem("jp_admin_token_backup");
      setIsImpersonating(false);
      window.location.href = "/admin";
    } else {
      logout();
    }
  }, [logout]);
  const value = {
    session,
    isAuthenticated: !!session?.token,
    isAdmin: session?.role === "ADMIN",
    isImpersonating,
    login,
    logout,
    impersonate,
    stopImpersonating,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
