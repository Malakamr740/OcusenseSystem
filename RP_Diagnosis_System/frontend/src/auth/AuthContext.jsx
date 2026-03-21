import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let mounted = true;
    setLoadingUser(true);

    getMe(token)
      .then((data) => {
        if (mounted) setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) setLoadingUser(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  function login(accessToken) {
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}