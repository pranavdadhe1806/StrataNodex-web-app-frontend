import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { getToken } from '../../utils/token';
import Spinner from '../ui/Spinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = 'https://stratanodex-landing-page.vercel.app/#auth';
      return;
    }
    if (user) {
      setChecking(false);
      return;
    }
    authApi.me()
      .then(u => { setUser(u); setChecking(false); })
      .catch(() => {
        window.location.href = 'https://stratanodex-landing-page.vercel.app/#auth';
      });
  }, []);

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1B1D21' }}>
        <Spinner size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
