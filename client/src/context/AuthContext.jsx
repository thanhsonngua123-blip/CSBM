import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const bootstrapAuth = async () => {
      try {
        const res = await authApi.getMe();

        if (isActive) {
          setUser(res.data.user || null);
        }
      } catch {
        if (isActive) {
          setUser((currentUser) => currentUser);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    const userData = res.data.user || null;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [loading, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
