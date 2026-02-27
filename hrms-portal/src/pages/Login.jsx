import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    const result = login(username, password);
    setLoading(false);
    if (!result.ok) setError(result.error);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f6fb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', padding: 16,
    }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(124,58,237,0.05)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(59,130,246,0.04)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#5b21b6,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
          }}>👥</div>
          <h1 style={{ color: '#0f172a', fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>HRMS Lite</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Human Resource Management System</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 24, border: '1px solid #e2e8f0',
          padding: 36, boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 28px' }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Username</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your username"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: `1.5px solid ${error && !username ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc', color: '#0f172a', fontSize: 14,
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', borderRadius: 12,
                    border: `1.5px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                    background: '#f8fafc', color: '#0f172a', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', fontSize: 16, padding: 4,
                }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, padding: '10px 14px', marginBottom: 18,
                color: '#dc2626', fontSize: 13, fontWeight: 500,
              }}>⚠️ {error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
                background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#5b21b6,#7c3aed)',
                color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.5)',
                transition: 'all 0.2s', letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              {loading ? '⏳ Signing in…' : '→ Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 24 }}>
          HRMS Lite Portal · v2.0
        </p>
      </div>
    </div>
  );
}
