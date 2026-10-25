import React, { useState } from 'react';
import { soundManager } from '../utils/soundManager';

export interface MaintenanceCardProps {
  statusText?: string;
  title?: string;
  description?: string;
  note?: string;
  footerText?: string;
}

export function MaintenanceCard({
  statusText = 'ระบบกำลังปิดปรับปรุงชั่วคราว',
  title = 'กำลังปรับปรุงเซิร์ฟเวอร์',
  description = 'ระบบเกม Marvel Splendor กำลังอยู่ระหว่างการอัปเดตและบำรุงรักษาโครงสร้างระบบ เพื่อเพิ่มความเสถียรและประสิทธิภาพสูงสุดในการเล่น',
  note = 'ข้อมูลบัญชี สถิติ และความคืบหน้าทั้งหมดของท่านปลอดภัยและได้รับการบันทึกเรียบร้อยครับ',
  footerText = 'Marvel Splendor — Server Maintenance',
}: MaintenanceCardProps): React.ReactElement {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    soundManager.playButtonClick();
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="relative w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#0d1322]/90 p-6 sm:p-8 text-center text-white shadow-2xl backdrop-blur-xl animate-fade-in">
      {/* Top subtle highlight line */}
      <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

      {/* Modern Status Beacon Icon */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
        <svg
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.9 6.9a2.12 2.12 0 01-3-3l6.9-6.9A6 6 0 0118.4 2.53l-3.7 3.77z"
          />
        </svg>
      </div>

      {/* Clean Status Pill Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 mb-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <span>{statusText}</span>
      </div>

      {/* Main Title */}
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-['Prompt',sans-serif] mb-3">
        {title}
      </h1>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed font-normal mb-3 font-['Prompt',sans-serif]">
        {description}
      </p>

      {/* Note */}
      <p className="text-xs text-slate-400 leading-relaxed font-normal mb-6 font-['Prompt',sans-serif]">
        {note}
      </p>

      {/* Clean Status Details Box */}
      <div className="rounded-xl border border-white/5 bg-black/30 p-3.5 mb-6 text-left space-y-2 text-xs font-['Prompt',sans-serif]">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">สถานะการทำงาน:</span>
          <span className="font-medium text-amber-300">อยู่ระหว่างดำเนินการ</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">ข้อมูลผู้เล่น:</span>
          <span className="font-medium text-emerald-400">ปลอดภัย 100%</span>
        </div>
      </div>

      {/* Action Button: Refresh */}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-['Prompt',sans-serif]"
      >
        <svg
          className={`h-4 w-4 text-slate-300 ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>{isRefreshing ? 'กำลังตรวจสอบการเชื่อมต่อ...' : 'รีเฟรชเพื่อตรวจสอบสถานะ'}</span>
      </button>

      {/* Subtle Footer */}
      <p className="mt-6 text-[11px] text-slate-400 font-mono tracking-wide">
        {footerText}
      </p>
    </div>
  );
}
