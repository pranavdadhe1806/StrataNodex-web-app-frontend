import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

const cardStyle: React.CSSProperties = {
  background: '#2A2D33',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '14px',
  padding: '28px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
};

const labelStyle: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: 'Poppins, sans-serif',
  marginBottom: '8px',
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  background: '#32363C',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  color: '#EDEFF3',
  padding: '12px 14px',
  fontSize: '14px',
  fontFamily: 'Poppins, sans-serif',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#EDEFF3',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'Poppins, sans-serif',
};

function OtpBoxes({
  otp,
  onChange,
}: {
  otp: string[];
  onChange: (index: number, value: string) => void;
}) {
  const refs = Array.from({ length: 6 }, () => null) as (HTMLInputElement | null)[];
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '20px' }}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs[i] = el; }}
          type="text"
          inputMode="numeric"
          value={digit}
          maxLength={1}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            onChange(i, val);
            if (val && i < 5) (e.target.nextSibling as HTMLInputElement)?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digit && i > 0)
              (e.currentTarget.previousSibling as HTMLInputElement)?.focus();
          }}
          style={{
            width: '44px',
            height: '52px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 600,
            fontFamily: 'Poppins, sans-serif',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#EDEFF3',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(0,191,255,0.4)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
      ))}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 1000,
        padding: '12px 20px',
        borderRadius: '10px',
        background: type === 'success' ? 'rgba(0, 200, 150, 0.15)' : 'rgba(248, 81, 73, 0.15)',
        border: `1px solid ${type === 'success' ? 'rgba(0,200,150,0.3)' : 'rgba(248,81,73,0.3)'}`,
        color: type === 'success' ? '#00c896' : '#f85149',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}

type ChangePasswordStep = 'idle' | 'sending' | 'otp';

export default function SecuritySettings() {
  const { user, setUser } = useAuthStore();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── 2FA state ──
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const handle2FAToggle = async () => {
    if (!user) return;
    setTwoFaLoading(true);
    try {
      if (user.twoFactorEnabled) {
        const updated = await authApi.disable2FA();
        setUser(updated);
        showToast('✅ Two-factor authentication disabled', 'success');
      } else {
        const updated = await authApi.enable2FA('EMAIL');
        setUser(updated);
        showToast('✅ Two-factor authentication enabled (Email OTP)', 'success');
      }
    } catch {
      showToast('❌ Failed to update 2FA settings', 'error');
    } finally {
      setTwoFaLoading(false);
    }
  };

  // ── Change password state ──
  const [pwStep, setPwStep] = useState<ChangePasswordStep>('idle');
  const [pwLoading, setPwLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleSendResetCode = async () => {
    if (!user?.email) return;
    setPwLoading(true);
    setPwError('');
    try {
      await authApi.forgotPassword(user.email);
      setPwStep('otp');
      setOtp(['', '', '', '', '', '']);
    } catch {
      setPwError('Failed to send reset code. Try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setPwError('Please enter the full 6-digit code.'); return; }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    if (!user?.email) return;
    setPwLoading(true);
    setPwError('');
    try {
      await authApi.resetPassword(user.email, code, newPassword);
      showToast('✅ Password changed successfully', 'success');
      setPwStep('idle');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPwError('Invalid or expired code. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const btnBase: React.CSSProperties = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    padding: '10px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    border: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ── Two-Factor Authentication ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <div style={sectionTitleStyle}>🔐 Two-Factor Authentication</div>
            <p style={{ color: '#7D828B', fontFamily: 'Poppins, sans-serif', fontSize: '13px', marginTop: '6px', lineHeight: 1.6 }}>
              {user?.twoFactorEnabled
                ? 'Enabled — a one-time code will be required at every login.'
                : 'Disabled — enable to require an email OTP every time you sign in.'}
            </p>
          </div>
          <button
            onClick={handle2FAToggle}
            disabled={twoFaLoading}
            style={{
              ...btnBase,
              flexShrink: 0,
              background: user?.twoFactorEnabled ? 'rgba(248,81,73,0.1)' : 'rgba(0,191,255,0.1)',
              border: `1px solid ${user?.twoFactorEnabled ? 'rgba(248,81,73,0.3)' : 'rgba(0,191,255,0.3)'}`,
              color: user?.twoFactorEnabled ? '#f85149' : '#00bfff',
              opacity: twoFaLoading ? 0.6 : 1,
            }}
          >
            {twoFaLoading ? '...' : user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>

        {user?.twoFactorEnabled && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(0,191,255,0.06)',
              border: '1px solid rgba(0,191,255,0.15)',
              borderRadius: '10px',
              color: '#00bfff',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
            }}
          >
            ✅ Active — method: <strong>Email OTP</strong>
          </div>
        )}
      </div>

      {/* ── Change Password ── */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>🔑 Change Password</div>
        <p style={{ color: '#7D828B', fontFamily: 'Poppins, sans-serif', fontSize: '13px', marginTop: '6px', marginBottom: '20px', lineHeight: 1.6 }}>
          A one-time code will be sent to <strong style={{ color: '#9CA3AF' }}>{user?.email}</strong>.
        </p>

        {pwStep === 'idle' && (
          <button
            onClick={handleSendResetCode}
            disabled={pwLoading}
            style={{
              ...btnBase,
              background: 'rgba(0,191,255,0.1)',
              border: '1px solid rgba(0,191,255,0.3)',
              color: '#00bfff',
              opacity: pwLoading ? 0.6 : 1,
            }}
          >
            {pwLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        )}

        {pwStep === 'otp' && (
          <div>
            <p style={{ color: '#9CA3AF', fontFamily: 'Poppins, sans-serif', fontSize: '13px', marginBottom: '16px' }}>
              Enter the 6-digit code sent to your email, then set a new password.
            </p>

            <OtpBoxes
              otp={otp}
              onChange={(i, val) => {
                const next = [...otp];
                next[i] = val;
                setOtp(next);
              }}
            />

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(0,191,255,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#7D828B', cursor: 'pointer', padding: 0 }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,191,255,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {pwError && (
              <p style={{ color: '#f85149', fontFamily: 'Poppins, sans-serif', fontSize: '13px', marginBottom: '14px' }}>
                {pwError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleResetPassword}
                disabled={pwLoading}
                style={{ ...btnBase, background: '#00bfff', color: '#fff', opacity: pwLoading ? 0.6 : 1 }}
              >
                {pwLoading ? 'Saving...' : 'Change Password'}
              </button>
              <button
                onClick={() => { setPwStep('idle'); setPwError(''); setOtp(['', '', '', '', '', '']); setNewPassword(''); setConfirmPassword(''); }}
                style={{ ...btnBase, background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
