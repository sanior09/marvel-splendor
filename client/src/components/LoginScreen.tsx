// ============================================================
//  LoginScreen.tsx — Marvel Splendor Sign-In & Guest Access
// ============================================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Lock,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import type { UseAuthReturn } from '../hooks/useAuth';

interface LoginScreenProps {
  auth: UseAuthReturn;
  onContinueAsGuest: () => void;
}

const INFINITY_STONES = [
  { name: 'Space', crystalClass: 'crystal-sapphire' },
  { name: 'Mind', crystalClass: 'crystal-topaz' },
  { name: 'Reality', crystalClass: 'crystal-ruby' },
  { name: 'Power', crystalClass: 'crystal-amethyst' },
  { name: 'Time', crystalClass: 'crystal-emerald' },
  { name: 'Soul', crystalClass: 'crystal-obsidian' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ auth, onContinueAsGuest }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password) {
      setLocalError('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (password.toLowerCase() === username.trim().toLowerCase()) {
        setLocalError('รหัสผ่านต้องไม่ซ้ำกับชื่อผู้ใช้');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
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
      className="relative w-full h-full min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start lg:justify-center bg-[#0b0d14] text-[#eef0f5] select-none py-8 px-4 sm:px-6"
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      }}
    >
      {/* Subtle battlefield art layer blended into Ink background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-20"
        style={{
          backgroundImage: "url('/images/maps/avengers_tower.jpg'), url('/images/maps/sanctum.jpg')",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 60% 45%, rgba(11,13,20,0.68) 0%, rgba(11,13,20,0.95) 70%, #0b0d14 100%)',
        }}
      />

      {/* Main Layout */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 my-auto">
        {/* Left Column: Product Identity & Core Highlights */}
        <div className="w-full lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Brand Wordmark */}
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <span className="px-3 py-1 bg-[#c51d24] text-white font-marvel text-3xl sm:text-4xl tracking-wider rounded leading-none">
              MARVEL
            </span>
            <h1 className="font-display font-semibold text-3xl sm:text-4xl tracking-wide text-[#eef0f5] leading-none">
              SPLENDOR
            </h1>
          </div>

          <p className="mt-4 text-sm sm:text-base text-[#a3a9b8] max-w-md leading-relaxed">
            ดิจิทัลบอร์ดเกมสะสมอัญมณีอินฟินิตี้และรวบรวมทีมฮีโร่ เล่นดวลกับบอท AI หรือสร้างห้องออนไลน์ได้ 2–4 คน
          </p>

          {/* Moment: 6 Infinity Stones physical bar */}
          <div className="w-full max-w-lg mt-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 rounded-xl bg-[#11141c] border border-white/[0.08]">
              {INFINITY_STONES.map((stone) => (
                <div
                  key={stone.name}
                  className="flex items-center justify-center gap-2 py-2 px-2 rounded-lg bg-[#1a1e28]/70"
                >
                  <span className={`w-3 h-3 rounded-full shrink-0 ${stone.crystalClass}`} />
                  <span className="font-display text-xs font-medium text-[#eef0f5]">
                    {stone.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Feature Summaries (Desktop) */}
          <div className="hidden lg:grid grid-cols-3 gap-3 w-full max-w-lg mt-4 text-left">
            <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08]">
              <div className="flex items-center gap-2 text-[#eef0f5] text-sm font-medium">
                <Layers className="w-4 h-4 text-[#7a8296] shrink-0" strokeWidth={1.5} />
                <span className="font-num">90 การ์ด</span>
              </div>
              <p className="mt-1.5 text-xs text-[#a3a9b8] leading-snug">
                ฮีโร่และวายร้ายครบ 3 ระดับ
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08]">
              <div className="flex items-center gap-2 text-[#eef0f5] text-sm font-medium">
                <Bot className="w-4 h-4 text-[#7a8296] shrink-0" strokeWidth={1.5} />
                <span>บอท 3 สไตล์</span>
              </div>
              <p className="mt-1.5 text-xs text-[#a3a9b8] leading-snug">
                Stark, Thanos และ Ultron
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08]">
              <div className="flex items-center gap-2 text-[#eef0f5] text-sm font-medium">
                <Users className="w-4 h-4 text-[#7a8296] shrink-0" strokeWidth={1.5} />
                <span className="font-num">2–4 ผู้เล่น</span>
              </div>
              <p className="mt-1.5 text-xs text-[#a3a9b8] leading-snug">
                เล่นออนไลน์แบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Footer (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 mt-8 text-xs text-[#7a8296]">
            <span>© 2026 Marvel Splendor</span>
            <span>•</span>
            <span>Fan-Made Project by sanior09</span>
          </div>
        </div>

        {/* Right Column: Sign-In / Register Panel */}
        <div className="w-full lg:w-5/12 max-w-md flex flex-col items-center">
          <div className="w-full rounded-2xl bg-[#11141c] border border-white/[0.08] overflow-hidden">
            {/* Panel Header + Switcher */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <h2 className="text-base font-medium text-[#eef0f5]">
                  {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีผู้เล่น'}
                </h2>
                <span className="text-xs text-[#7a8296]">
                  บันทึกยศและสถิติข้ามอุปกรณ์
                </span>
              </div>

              <div className="mt-4 p-1 rounded-xl bg-[#07080d] border border-white/[0.08] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalError('');
                    auth.clearError();
                  }}
                  className={`h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#1a1e28] text-[#eef0f5] border border-white/[0.1]'
                      : 'text-[#7a8296] hover:text-[#a3a9b8]'
                  }`}
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setLocalError('');
                    auth.clearError();
                  }}
                  className={`h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    mode === 'register'
                      ? 'bg-[#1a1e28] text-[#eef0f5] border border-white/[0.1]'
                      : 'text-[#7a8296] hover:text-[#a3a9b8]'
                  }`}
                >
                  สมัครสมาชิก
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-username"
                    className="flex items-center justify-between text-xs font-medium text-[#a3a9b8] mb-1.5"
                  >
                    <span>ชื่อผู้ใช้</span>
                    <span className="text-[#7a8296] font-num">2–20 อักษร</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7a8296]">
                      <User className="w-4 h-4" strokeWidth={1.5} />
                    </span>
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#07080d] border border-white/[0.08] text-sm text-[#eef0f5] placeholder-[#7a8296] focus:outline-none focus:border-amber-400/70 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="flex items-center justify-between text-xs font-medium text-[#a3a9b8] mb-1.5"
                  >
                    <span>รหัสผ่าน</span>
                    <span className="text-[#7a8296] font-num">อย่างน้อย 6 ตัว</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7a8296]">
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      className="w-full h-11 pl-10 pr-11 rounded-lg bg-[#07080d] border border-white/[0.08] text-sm text-[#eef0f5] placeholder-[#7a8296] focus:outline-none focus:border-amber-400/70 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-[#7a8296] hover:text-[#eef0f5] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="animate-fade-in">
                    <label
                      htmlFor="login-confirm-password"
                      className="block text-xs font-medium text-[#a3a9b8] mb-1.5"
                    >
                      ยืนยันรหัสผ่าน
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7a8296]">
                        <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                      <input
                        id="login-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#07080d] border border-white/[0.08] text-sm text-[#eef0f5] placeholder-[#7a8296] focus:outline-none focus:border-amber-400/70 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {displayError && (
                  <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#e5484d] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="leading-relaxed">{displayError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={auth.isLoading}
                  className="w-full h-11 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-amber-400 hover:bg-amber-300 text-[#07080d]"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
                  }}
                >
                  {auth.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      <span>กำลังดำเนินการ</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้'}</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-5 flex items-center justify-center">
                <div className="w-full border-t border-white/[0.08]" />
                <span className="px-3 bg-[#11141c] text-xs text-[#7a8296] shrink-0">หรือ</span>
                <div className="w-full border-t border-white/[0.08]" />
              </div>

              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full h-11 px-4 rounded-lg border border-white/[0.08] bg-[#1a1e28] hover:bg-white/[0.08] text-[#eef0f5] text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Shield className="w-4 h-4 text-[#a3a9b8]" strokeWidth={1.5} />
                <span>เข้าเล่นเป็นผู้เยี่ยมชม</span>
              </button>

              <p className="text-center text-[#7a8296] text-xs mt-4 leading-relaxed">
                {mode === 'login'
                  ? 'เชื่อมต่อบัญชีเพื่อเก็บสถิติการชนะ ระดับยศ และห้องที่เล่นค้างไว้'
                  : 'สมัครใช้งานฟรีเพื่อสะสม EXP และปลดล็อกระดับยศในเกม'}
              </p>
            </div>
          </div>

          {/* Mobile Feature Summary */}
          <div className="grid lg:hidden grid-cols-3 gap-2 w-full mt-4 text-left">
            <div className="p-3 rounded-xl bg-[#11141c] border border-white/[0.08]">
              <div className="text-xs font-medium text-[#eef0f5] font-num">90 การ์ด</div>
              <div className="text-[11px] text-[#7a8296] mt-0.5">ครบ 3 ระดับ</div>
            </div>
            <div className="p-3 rounded-xl bg-[#11141c] border border-white/[0.08]">
              <div className="text-xs font-medium text-[#eef0f5]">บอท AI</div>
              <div className="text-[11px] text-[#7a8296] mt-0.5">3 สไตล์การเล่น</div>
            </div>
            <div className="p-3 rounded-xl bg-[#11141c] border border-white/[0.08]">
              <div className="text-xs font-medium text-[#eef0f5] font-num">2–4 คน</div>
              <div className="text-[11px] text-[#7a8296] mt-0.5">ออนไลน์เรียลไทม์</div>
            </div>
          </div>

          <div className="flex lg:hidden items-center justify-center gap-2 mt-6 text-xs text-[#7a8296]">
            <span>© 2026 Marvel Splendor</span>
            <span>•</span>
            <span>sanior09</span>
          </div>
        </div>
      </div>
    </div>
  );
};
