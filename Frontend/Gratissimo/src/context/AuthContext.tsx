import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthState";
import type { User } from "./AuthState";

const apiUrl = import.meta.env.VITE_API_URL;

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

function tokenExpiry(token: string) {
  try {
    const payload = token.split(".")[1];
    return (JSON.parse(atob(payload)).exp as number) * 1000;
  } catch {
    return null;
  }
}

function readUser() {
  const value = readCookie("gratissimo_user");
  if (!value) return null;

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    readCookie("gratissimo_access_token"),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    readCookie("gratissimo_refresh_token"),
  );
  const [user, setUser] = useState<User | null>(() => readUser());

  useEffect(() => {
    if (!accessToken || !refreshToken || !user) return;

    writeCookie("gratissimo_access_token", accessToken);
    writeCookie("gratissimo_refresh_token", refreshToken);
    writeCookie("gratissimo_user", JSON.stringify(user));
  }, [accessToken, refreshToken, user]);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const expiry = tokenExpiry(accessToken);
    if (!expiry) return;

    const delay = Math.max(expiry - Date.now() - 30000, 1000);
    const timer = window.setTimeout(async () => {
      const response = await fetch(`${apiUrl}/api/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ refreshToken }),
      });

      if (!response.ok) return;

      const data = await response.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [accessToken, refreshToken]);

  function setSession(
    nextAccessToken: string,
    nextRefreshToken: string,
    nextUser: User,
  ) {
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
    setUser(nextUser);
  }

  async function logout() {
    if (refreshToken) {
      await fetch(`${apiUrl}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ refreshToken }),
      }).catch(() => undefined);
    }

    clearCookie("gratissimo_access_token");
    clearCookie("gratissimo_refresh_token");
    clearCookie("gratissimo_user");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        isAuthenticated: Boolean(accessToken && refreshToken && user),
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
