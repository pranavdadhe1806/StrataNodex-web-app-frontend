import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { getToken, setToken, setStoredUser, getStoredUser } from '../../utils/token';
import Spinner from '../ui/Spinner';

// In dev, redirect to local landing page; in prod, to the custom domain
const LANDING_BASE_URL =
  import.meta.env.VITE_LANDING_URL ?? 'https://stratanodex.online';

function getLandingAuthUrl() {
  // Encode the current page so the landing page can bounce back after login
  const redirect = encodeURIComponent(window.location.href);
  return `${LANDING_BASE_URL}/auth?redirect=${redirect}`;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // ── Cross-origin token handoff ────────────────────────────────────────────
    // localStorage is scoped per origin (host+port). When the landing page
    // (localhost:3001) redirects back here (localhost:5173) after login it
    // appends ?token=<jwt> so we can store it in THIS origin's localStorage.
    const params = new URLSearchParams(window.location.search);
    const incomingToken = params.get('token');
    if (incomingToken) {
      setToken(incomingToken);
      // Remove the token from the URL immediately (security + clean history)
      params.delete('token');
      const cleanSearch = params.toString();
      const cleanUrl =
        window.location.pathname +
        (cleanSearch ? `?${cleanSearch}` : '') +
        window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
    // ─────────────────────────────────────────────────────────────────────────

    const token = getToken();
    if (!token) {
      window.location.href = getLandingAuthUrl();
      return;
    }

    // If Zustand already has user (same React session), nothing to do
    if (user) {
      setChecking(false);
      return;
    }

    // Fast path: we have a cached user in sn_user — validate token with backend
    const stored = getStoredUser();
    if (stored) {
      authApi.me()
        .then(u => {
          setUser(u);
          setStoredUser({ name: u.name ?? undefined, email: u.email });
          setChecking(false);
        })
        .catch(() => {
          // If 401, the Axios interceptor already cleared the token and is redirecting
          // to the landing page. Don't fight it — just bail.
          if (!getToken()) return;
          // Non-401 error (network issue, 500, etc.) — stop spinner, show error UI
          setChecking(false);
        });
      return;
    }

    // Slow path: no cached user — call /me directly to validate and hydrate
    authApi.me()
      .then(u => {
        setUser(u);
        setStoredUser({ name: u.name ?? undefined, email: u.email });
        setChecking(false);
      })
      .catch(() => {
        // Same guard: if the interceptor already cleared the token, let its redirect win
        if (!getToken()) return;
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  // If we stopped checking but have no user and no token, the interceptor is probably redirecting.
  // Or it's a network error. We can just return null or an error message here.
  if (!user && !getToken()) return null;
  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)', color: 'white' }}>
        <p>Could not connect to the server. Please check if the backend is running.</p>
      </div>
    );
  }

  return <>{children}</>;
}
