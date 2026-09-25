// ============================================================
//  LoginScreen.tsx — Marvel Splendor Account Portal
// ============================================================

import React, { useState } from 'react';
import type { UseAuthReturn } from '../hooks/useAuth';

interface LoginScreenProps {
  auth: UseAuthReturn;
  onContinueAsGuest: () => void;
}

// Fixed particle positions (stable across renders)
const PARTICLES = [
  { x: 12, y: 15, size: 3, color: '#ffd700', delay: 0, dur: 6 },
  { x: 85, y: 10, size: 2, color: '#e23636', delay: 1.2, dur: 7 },
  { x: 70, y: 82, size: 4, color: '#4895ef', delay: 0.5, dur: 5.5 },
  { x: 25, y: 75, size: 2, color: '#ffd700', delay: 2, dur: 8 },
  { x: 90, y: 55, size: 3, color: '#a855f7', delay: 0.8, dur: 6.5 },
  { x: 5, y: 45, size: 2, color: '#4895ef', delay: 1.5, dur: 7 },
  { x: 55, y: 92, size: 3, color: '#ffd700', delay: 0.3, dur: 5 },
  { x: 40, y: 8, size: 2, color: '#e23636', delay: 2.5, dur: 6 },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ auth, onContinueAsGuest }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password) {
      setLocalError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('รหัสผ่านไม่ตรงกัน');
        return;
      }
      await auth.register(username.trim(), password);
    } else {
      await auth.login(username.trim(), password);
    }
  };

  const displayError = localError || auth.error;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(234,179,8,0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(220,38,38,0.09) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(72,149,239,0.07) 0%, transparent 40%), #06070f',
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      {/* Background particles — fixed positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: p.color,
              opacity: 0.35,
              animation: `particle-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo Header */}
        <div className="text-center mb-7">
          {/* Marvel badge */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <span
              className="marvel-badge px-3 py-1 rounded text-2xl font-black tracking-wider shadow-xl"
            >
              MARVEL
            </span>
            <span
              className="text-3xl font-black tracking-widest"
              style={{
                background: 'linear-gradient(90deg, #ffd700, #e040fb, #4895ef, #ffd700)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              SPLENDOR
            </span>
          </div>
          <p className="text-white/40 text-xs tracking-widest">แย่งชิงถุงมืออินฟินิตี้</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/10"
          style={{
            background: 'linear-gradient(145deg, rgba(22,14,38,0.96) 0%, rgba(8,7,20,0.98) 100%)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 30px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          {/* Mode tab — underline style */}
          <div className="flex border-b border-white/8">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setLocalError(''); auth.clearError(); }}
                className="flex-1 py-3.5 text-sm font-bold transition-all duration-200 relative"
                style={{
                  color: mode === m ? '#fbbf24' : 'rgba(255,255,255,0.35)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                {/* Active underline */}
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    background: mode === m ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'transparent',
                    boxShadow: mode === m ? '0 0 8px rgba(251,191,36,0.6)' : 'none',
                  }}
                />
              </button>
            ))}
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-[11px] text-white/40 mb-1.5 tracking-widest uppercase">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ThanosSlayer99"
                  maxLength={20}
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] text-white/40 mb-1.5 tracking-widest uppercase">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              </div>

              {/* Confirm Password (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5 tracking-widest uppercase">
                    ยืนยันรหัสผ่าน
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                  />
                </div>
              )}

              {/* Error message */}
              {displayError && (
                <div
                  className="px-4 py-2.5 rounded-xl text-xs text-red-300"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  {displayError}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={auth.isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 mt-1"
                style={{
                  background: auth.isLoading
                    ? 'rgba(255,255,255,0.12)'
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
                  color: auth.isLoading ? 'rgba(255,255,255,0.4)' : '#000',
                  boxShadow: auth.isLoading ? 'none' : '0 8px 24px rgba(251,191,36,0.3)',
                  cursor: auth.isLoading ? 'wait' : 'pointer',
                  border: 'none',
                }}
              >
                {auth.isLoading
                  ? 'กำลังดำเนินการ...'
                  : mode === 'login'
                  ? 'เข้าสู่ระบบ'
                  : 'สร้างบัญชีใหม่'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/25 text-[11px]">หรือ</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Guest button */}
            <button
              onClick={onContinueAsGuest}
              className="w-full py-2.5 rounded-xl text-white/45 text-sm font-medium transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
              }}
            >
              เล่นเป็นผู้เยี่ยมชม
            </button>

            {/* Info note */}
            <p className="text-center text-white/18 text-[10px] mt-4 leading-relaxed">
              {mode === 'login'
                ? 'ล็อกอินจากอุปกรณ์ใดก็ได้ แล้วกลับเข้าห้องที่กำลังเล่นได้ทันที'
                : 'สมัครฟรี — สะสม XP, ดูสถิติ, resume game จากมือถือ'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
