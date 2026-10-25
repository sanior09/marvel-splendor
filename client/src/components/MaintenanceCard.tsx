import React, { useState } from 'react';
import { soundManager } from '../utils/soundManager';

export interface MaintenanceCardProps {
  systemName?: string;
  statusText?: string;
  title?: string;
  description?: string;
  note?: string;
  protocolFooter?: string;
}

export function MaintenanceCard({
  systemName = 'STARK INDUSTRIES TACTICAL COMMAND',
  statusText = 'SYSTEMS OFFLINE // MAINTENANCE MODE',
  title = 'ระบบปิดปรับปรุงชั่วคราว',
  description = 'ทีมวิศวกร Stark Industries กำลังยกระดับโครงสร้างควอนตัมเซิร์ฟเวอร์ และปรับสมดุลคลื่นพลังงานมณีอินฟินิตี้ เพื่อยกระดับความเสถียรและประสิทธิภาพสูงสุด',
  note = 'ข้อมูลบัญชี สถิติการรบ และเหรียญเกียรติยศของท่านถูกสำรองอย่างปลอดภัย 100% ใน Stark Secure Vault',
  protocolFooter = 'STARK INDUSTRIES SECURE PROTOCOL • QUANTUM ENCRYPTION ACTIVE • 2026',
}: MaintenanceCardProps): React.ReactElement {
  const [checking, setChecking] = useState(false);
  const [muted, setMuted] = useState(soundManager.isMuted());

  const handleRefresh = () => {
    soundManager.playButtonClick();
    setChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 450);
  };

  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setMuted(next);
  };

  return (
    <div className="relative w-full max-w-[620px] rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-[#0c1022]/98 to-[#070a14]/99 p-5 sm:p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.12)] backdrop-blur-2xl overflow-hidden select-none animate-slide-up">
      {/* Top Subtle Amber Tech Light Beam */}
      <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

      {/* Decorative Corner Tech Crosshairs */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-amber-400/40 pointer-events-none" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-amber-400/40 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-amber-400/40 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-amber-400/40 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="marvel-badge px-2 py-0.5 rounded text-[11px] font-black tracking-wider">MARVEL</span>
          <span className="font-['Outfit',sans-serif] font-black text-sm text-white tracking-widest">SPLENDOR</span>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono border-l border-white/20 pl-2">
            STARK OS v4.8
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            title={muted ? 'เปิดเสียง' : 'ปิดเสียง'}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xs transition-colors cursor-pointer text-slate-300"
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Central Hero: Arc Reactor Diagnostic Core */}
      <div className="flex flex-col items-center text-center my-2 sm:my-4">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-5">
          {/* Subtle Outer Pulse Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-cyan-500/15 to-red-500/20 blur-xl animate-pulse" />

          {/* SVG Arc Reactor Schematic */}
          <svg className="w-full h-full relative z-10" viewBox="0 0 120 120" fill="none">
            {/* Outer Segmented Calibration Ring */}
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="rgba(245, 158, 11, 0.45)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              className="animate-spin-slow origin-center"
            />
            {/* Middle Counter-Rotating Compass Ring */}
            <circle
              cx="60"
              cy="60"
              r="42"
              stroke="rgba(56, 189, 248, 0.55)"
              strokeWidth="1.5"
              strokeDasharray="14 8"
              className="animate-spin-reverse-slow origin-center"
            />
            {/* 6 Infinity Nodes on Periphery */}
            <circle cx="60" cy="18" r="3" fill="#ef4444" />
            <circle cx="96" cy="39" r="3" fill="#3b82f6" />
            <circle cx="96" cy="81" r="3" fill="#22c55e" />
            <circle cx="60" cy="102" r="3" fill="#f97316" />
            <circle cx="24" cy="81" r="3" fill="#eab308" />
            <circle cx="24" cy="39" r="3" fill="#a855f7" />

            {/* Inner Power Core Base */}
            <circle cx="60" cy="60" r="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(245, 158, 11, 0.7)" strokeWidth="2" />
            {/* Triangular Vibranium Core Core */}
            <polygon
              points="60,42 76,70 44,70"
              fill="rgba(56, 189, 248, 0.35)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            {/* Center Quantum Dot */}
            <circle cx="60" cy="60" r="5" fill="#fef08a" className="animate-ping origin-center" />
            <circle cx="60" cy="60" r="4" fill="#f59e0b" />
          </svg>
        </div>

        {/* System Protocol Subtitle */}
        <span className="text-[10.5px] font-mono tracking-widest text-amber-400 font-bold uppercase mb-1">
          {systemName}
        </span>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300 tracking-wide font-['Prompt',sans-serif] mb-2">
          {title}
        </h1>

        {/* Description & Note */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-lg mb-2">
          {description}
        </p>
        <p className="text-[11px] sm:text-xs text-slate-400 font-normal leading-relaxed max-w-md">
          {note}
        </p>
      </div>

      {/* Bento Diagnostics Grid (3 Tactical Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-5">
        {/* Card 1: Quantum Server */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
            <span>🖥️ SERVER CORE</span>
            <span className="text-cyan-400 font-bold">88%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[88%] animate-pulse" />
          </div>
          <span className="text-[9.5px] text-slate-400 truncate">ซิงค์ฐานข้อมูลและล้างแคช</span>
        </div>

        {/* Card 2: Infinity Stones Resonance */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
            <span>💎 STONES SYNC</span>
            <span className="text-emerald-400 font-bold">STABLE</span>
          </div>
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <span className="text-[9.5px] text-slate-400 truncate">ปรับสมดุลสเกลพลังมณี</span>
        </div>

        {/* Card 3: Security & Player Assets */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
            <span>🛡️ USER ASSETS</span>
            <span className="text-amber-400 font-bold">SECURE</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full w-full" />
          </div>
          <span className="text-[9.5px] text-slate-400 truncate">สำรองข้อมูลครบถ้วน 100%</span>
        </div>
      </div>

      {/* Action Area: Check System Status Refresh Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>ESTIMATED RETURN: SOON</span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={checking}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_28px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
        >
          <span className={checking ? 'animate-spin' : ''}>🔄</span>
          <span>{checking ? 'กำลังตรวจสอบเซิร์ฟเวอร์...' : 'ตรวจสอบสถานะระบบ (Refresh)'}</span>
        </button>
      </div>

      {/* Protocol Footer */}
      <div className="mt-6 pt-3.5 border-t border-white/10 text-center text-[9px] font-mono text-slate-400 tracking-widest uppercase">
        {protocolFooter}
      </div>
    </div>
  );
}
