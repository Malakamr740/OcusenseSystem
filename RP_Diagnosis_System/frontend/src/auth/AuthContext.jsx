import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
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
        if (mounted) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        }
      })
      .catch((err) => {
        // Don't log out, just keep the stored user if available
        console.warn("Failed to fetch user:", err.message);
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
    // User will be set by useEffect
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login"; // Redirect to login
  }

  // Make logout global for API errors
  window.logout = logout;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}