// ============================================================
//  LoginScreen.tsx — Marvel Splendor High-Fidelity Access Portal
//  Bespoke Human-Grade Architecture & Editorial Game UX
// ============================================================

import React, { useState } from 'react';
import type { UseAuthReturn } from '../hooks/useAuth';

interface LoginScreenProps {
  auth: UseAuthReturn;
  onContinueAsGuest: () => void;
}

const INFINITY_STONES = [
  { name: 'Space', color: '#3b82f6', bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.45)', icon: '🔵' },
  { name: 'Mind', color: '#eab308', bg: 'rgba(234,179,8,0.18)', border: 'rgba(234,179,8,0.45)', icon: '🟡' },
  { name: 'Reality', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.45)', icon: '🔴' },
  { name: 'Power', color: '#a855f7', bg: 'rgba(168,85,247,0.18)', border: 'rgba(168,85,247,0.45)', icon: '🟣' },
  { name: 'Time', color: '#22c55e', bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.45)', icon: '🟢' },
  { name: 'Soul', color: '#f97316', bg: 'rgba(249,115,22,0.18)', border: 'rgba(249,115,22,0.45)', icon: '🟠' },
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden bg-[#05070d] text-slate-100 select-none">
      {/* ── Background: Cinematic Battlefield Artwork with Deep Scrim ────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-105 pointer-events-none"
        style={{
          backgroundImage: "url('/images/maps/avengers_tower.jpg'), url('/images/maps/sanctum.jpg')",
          filter: 'brightness(0.38) saturate(1.15) contrast(1.1)',
        }}
      />

      {/* Atmospheric Vignette Gradients (Dark edge falloff, no cheap glow blobs) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 65% 50%, rgba(5,7,13,0.72) 0%, rgba(5,7,13,0.94) 75%, #05070d 100%), linear-gradient(180deg, rgba(5,7,13,0.7) 0%, rgba(5,7,13,0.92) 100%)',
        }}
      />

      {/* Subtle Structural Technical Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Main Stage Container (Asymmetrical Split Architecture) ───────────────── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        
        {/* ── Left Hero Side: Marvel Identity & Game Features ─────────────────────── */}
        <div className="w-full lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner text-xs font-medium tracking-wider text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-white/50 uppercase tracking-widest font-mono text-[10px]">SYSTEM READY</span>
            <span className="text-white/20">•</span>
            <span className="text-amber-300/90 font-semibold">INFINITY GAUNTLET ARENA</span>
          </div>

          {/* Epic Brand Title */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <span className="px-3.5 py-1 bg-[#e23636] text-white font-black text-3xl sm:text-4xl tracking-tighter rounded shadow-[0_0_30px_rgba(226,54,54,0.45)] uppercase border border-red-400/30 font-['Bebas_Neue',sans-serif]">
                MARVEL
              </span>
              <span className="text-3xl sm:text-5xl font-black tracking-wider uppercase font-['Montserrat',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_12px_rgba(234,179,8,0.3)]">
                SPLENDOR
              </span>
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-300 tracking-wide pt-2 font-['Prompt',sans-serif]">
              ศึกชิงอัญมณีอินฟินิตี้ • ดิจิทัลบอร์ดเกมยุทธวิธีระดับพรีเมียม
            </p>
          </div>

          {/* Infinity Stones Bar (Unified Gauntlet Socket Dock — Clean 1-Row Grid) */}
          <div className="w-full max-w-lg pt-1">
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md shadow-inner">
              {INFINITY_STONES.map((stone) => (
                <div
                  key={stone.name}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-2 rounded-xl border text-center transition-all duration-200 hover:scale-[1.06] hover:shadow-lg cursor-default"
                  style={{
                    backgroundColor: stone.bg,
                    borderColor: stone.border,
                    color: stone.color,
                  }}
                  title={`${stone.name} Stone`}
                >
                  <span className="text-xs sm:text-sm">{stone.icon}</span>
                  <span className="font-['Montserrat',sans-serif] tracking-wider text-[9px] sm:text-[10px] font-extrabold uppercase">
                    {stone.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlights Bento Box — Gemstone Interactive Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2 text-left">
            {/* Card 1: Mind/Reality Stone Radiant Gold */}
            <div className="group relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-amber-400/70 hover:bg-amber-950/20 hover:shadow-[0_0_30px_rgba(245,158,11,0.35),inset_0_0_20px_rgba(245,158,11,0.15)] cursor-pointer">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="text-amber-400 group-hover:text-amber-300 font-bold text-lg font-['Montserrat',sans-serif] transition-colors drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                  90 CARDS
                </div>
                <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">🟡</span>
              </div>
              <div className="text-[11px] text-slate-400 group-hover:text-amber-100/90 leading-tight pt-1 transition-colors">
                ฮีโร่และวายร้ายครบ 3 Tiers
              </div>
            </div>

            {/* Card 2: Space Stone Radiant Cyan */}
            <div className="group relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-cyan-400/70 hover:bg-cyan-950/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.15)] cursor-pointer">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="text-cyan-400 group-hover:text-cyan-200 font-bold text-lg font-['Montserrat',sans-serif] transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                  MARVEL AI
                </div>
                <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">🔵</span>
              </div>
              <div className="text-[11px] text-slate-400 group-hover:text-cyan-100/90 leading-tight pt-1 transition-colors">
                บอท Stark, Thanos, Ultron
              </div>
            </div>

            {/* Card 3: Time Stone Radiant Emerald */}
            <div className="group relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md col-span-2 sm:col-span-1 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-emerald-400/70 hover:bg-emerald-950/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.35),inset_0_0_20px_rgba(16,185,129,0.15)] cursor-pointer">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="text-emerald-400 group-hover:text-emerald-200 font-bold text-lg font-['Montserrat',sans-serif] transition-colors drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                  REAL-TIME
                </div>
                <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">🟢</span>
              </div>
              <div className="text-[11px] text-slate-400 group-hover:text-emerald-100/90 leading-tight pt-1 transition-colors">
                เล่นออนไลน์ 2–4 ผู้เล่น
              </div>
            </div>
          </div>

          {/* Nachapol Industries Telemetry Footer */}
          <div className="hidden lg:flex items-center gap-2 pt-4 text-[11px] text-slate-400 font-mono tracking-widest uppercase">
            <span>NACHAPOL INDUSTRIES</span>
            <span>//</span>
            <span>NACHAPOL PROTOCOL VERIFIED</span>
          </div>
        </div>

        {/* ── Right Side: Tactile Access Terminal ──────────────────────────────────── */}
        <div className="w-full lg:w-5/12 max-w-md">
          <div
            className="rounded-3xl border border-white/[0.12] overflow-hidden transition-all duration-300"
            style={{
              background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
              backdropFilter: 'blur(28px)',
              boxShadow:
                '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Terminal Header & Mode Selector Pill */}
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
                  <span className="font-['Montserrat',sans-serif] font-bold tracking-widest text-xs uppercase text-slate-200">
                    ACCESS TERMINAL
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/90 tracking-wider">
                  ● CLOUD DATABASE SYNCED
                </span>
              </div>

              {/* Segmented Mode Pill Switcher */}
              <div className="mt-5 p-1 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalError('');
                    auth.clearError();
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
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
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 ${
                    mode === 'register'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }`}
                >
                  สมัครสมาชิก
                </button>
              </div>
            </div>

            {/* Form Container */}
            <div className="p-6 pt-3">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Username Input Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="font-['Prompt',sans-serif]">ชื่อผู้ใช้ (Username)</span>
                    <span className="text-[10px] font-mono text-slate-400">2–20 อักษร</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="เช่น ThanosSlayer99"
                      maxLength={20}
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/35 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all font-['Prompt',sans-serif]"
                    />
                  </div>
                </div>

                {/* Password Input Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="font-['Prompt',sans-serif]">รหัสผ่าน (Password)</span>
                    <span className="text-[10px] font-mono text-slate-400">อย่างน้อย 6 ตัว</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-black/35 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Register Only) */}
                {mode === 'register' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-300 font-['Prompt',sans-serif]">
                      ยืนยันรหัสผ่าน (Confirm Password)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                        autoComplete="new-password"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/35 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Alert Notification Display */}
                {displayError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="leading-relaxed">{displayError}</span>
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={auth.isLoading}
                  className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-lg"
                  style={{
                    background: auth.isLoading
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                    color: auth.isLoading ? 'rgba(255, 255, 255, 0.4)' : '#05070d',
                    boxShadow: auth.isLoading ? 'none' : '0 8px 25px -4px rgba(245, 158, 11, 0.45)',
                  }}
                >
                  {auth.isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>กำลังประมวลผล...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'เข้าสู่ระบบ (Sign In)' : 'สร้างบัญชีผู้ใช้ใหม่ (Register)'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative px-3 bg-[#0d131f] text-[11px] font-mono uppercase text-slate-400">
                  หรือ (OR)
                </div>
              </div>

              {/* Secondary S.H.I.E.L.D. Guest Access Clearance Button */}
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-slate-200 text-xs font-semibold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span className="text-sm">🛡️</span>
                <span className="font-['Prompt',sans-serif]">เข้าเล่นเป็นผู้เยี่ยมชม (Guest Clearance)</span>
              </button>

              {/* Technical Footnote */}
              <p className="text-center text-slate-400 text-[11px] mt-4 leading-relaxed font-['Prompt',sans-serif]">
                {mode === 'login'
                  ? '🔒 บันทึกสถานะห้องและสถิติผ่านคลาวด์ สลับเล่นข้ามอุปกรณ์ได้ทันที'
                  : '✨ สมัครฟรี บันทึกประวัติการแข่งขัน อัปเกรดฉายา และสะสมสถิติ'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
