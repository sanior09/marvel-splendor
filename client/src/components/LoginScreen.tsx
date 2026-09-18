// ============================================================
//  LoginScreen.tsx — Marvel Splendor Account Portal
//  Login / Register with dark glassmorphism design
// ============================================================

import React, { useState } from 'react';
import type { UseAuthReturn } from '../hooks/useAuth';

interface LoginScreenProps {
  auth: UseAuthReturn;
  onContinueAsGuest: () => void;
}

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
        background: 'radial-gradient(ellipse at 30% 20%, rgba(234,179,8,0.10) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(220,38,38,0.10) 0%, transparent 55%), #06070f',
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#e23636' : '#4895ef',
              animation: `particle-float ${Math.random() * 4 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <span
              className="text-4xl font-black tracking-widest"
              style={{
                background: 'linear-gradient(90deg, #ffd700, #e040fb, #4895ef, #ffd700)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              MARVEL
            </span>
            <span className="text-4xl font-black tracking-widest text-white">SPLENDOR</span>
          </div>
          <p className="text-white/50 text-sm tracking-wider">แย่งชิงถุงมืออินฟินิตี้</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Mode toggle */}
          <div className="flex gap-1 mb-7 p-1 rounded-xl bg-white/5">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setLocalError(''); auth.clearError(); }}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: mode === m ? 'linear-gradient(135deg, #ffd700 0%, #ea580c 100%)' : 'transparent',
                  color: mode === m ? '#000' : 'rgba(255,255,255,0.5)',
                  boxShadow: mode === m ? '0 4px 12px rgba(234,179,8,0.3)' : 'none',
                }}
              >
                {m === 'login' ? '🔑 เข้าสู่ระบบ' : '✨ สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ตัวอย่าง: ThanosSlayer99"
                maxLength={20}
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234,179,8,0.6)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234,179,8,0.6)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234,179,8,0.6)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
            )}

            {/* Error message */}
            {displayError && (
              <div
                className="px-4 py-3 rounded-xl text-sm text-red-300 border border-red-500/30"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                ⚠️ {displayError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={auth.isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-black text-sm tracking-wider transition-all duration-200 mt-2"
              style={{
                background: auth.isLoading
                  ? 'rgba(255,255,255,0.2)'
                  : 'linear-gradient(135deg, #ffd700 0%, #ea580c 100%)',
                boxShadow: auth.isLoading ? 'none' : '0 8px 24px rgba(234,179,8,0.35)',
                opacity: auth.isLoading ? 0.7 : 1,
              }}
            >
              {auth.isLoading
                ? '⏳ กำลังดำเนินการ...'
                : mode === 'login'
                ? '🔑 เข้าสู่ระบบ'
                : '🚀 สร้างบัญชี'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">หรือ</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Guest button */}
          <button
            onClick={onContinueAsGuest}
            className="w-full py-3 rounded-xl text-white/50 text-sm font-medium border border-white/10 hover:border-white/25 hover:text-white/80 transition-all"
          >
            👤 เล่นเป็นผู้เยี่ยมชม (ไม่สะสมแต้ม)
          </button>

          {/* Info note */}
          <p className="text-center text-white/20 text-xs mt-5 leading-relaxed">
            {mode === 'login'
              ? 'ล็อกอินจากอุปกรณ์ใดก็ได้ แล้วกลับเข้าห้องที่กำลังเล่นได้ทันที'
              : 'สมัครฟรี! สะสม XP ดูสถิติ และ resume game จากมือถือ'}
          </p>
        </div>
      </div>
    </div>
  );
};
