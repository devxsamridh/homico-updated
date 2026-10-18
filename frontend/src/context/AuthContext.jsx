import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth.js";
import { clearTokens, getAccessToken, setTokens } from "../utils/storage.js";

const AuthContext = createContext(null);

/**
 * Wraps the app and exposes { user, login, register, logout, loading }.
 * On mount, if an access token exists we fetch the current user.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { access, refresh } = await authApi.login({ email, password });
    setTokens({ access, refresh });
    const me = await authApi.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    await authApi.register(payload);
    return login(payload.email, payload.password);
  }, [login]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
