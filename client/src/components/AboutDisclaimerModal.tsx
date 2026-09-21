// ============================================================
//  AboutDisclaimerModal.tsx — Developer Credits & Legal Notice
// ============================================================
//  Presents creator credits (sanior09) and non-commercial fair use
//  disclaimer in a clean, human-designed, highly-readable layout.
// ============================================================

import React from 'react';
import { createPortal } from 'react-dom';
import { soundManager } from '../utils/soundManager';

interface AboutDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDisclaimerModal: React.FC<AboutDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    soundManager.playModalClose();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#0b0f19] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up z-10 text-slate-200 font-sans">
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-500 to-blue-600" />

        {/* Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="marvel-badge px-2 py-0.5 rounded text-[11px] font-black tracking-wider shadow">
                MARVEL
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Fan Project
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide mt-1">
              ข้อมูลโครงการและข้อกำหนดลิขสิทธิ์
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer border border-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm leading-relaxed">
          {/* Card 1: Developer Credits */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                ผู้พัฒนาเว็บไซต์ (Developer)
              </span>
              <span className="font-mono font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 rounded-full text-xs">
                sanior09
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              เกมกระดาน Splendor: Marvel เวอร์ชันเว็บนี้ พัฒนาและดูแลระบบโดย <strong>sanior09</strong> เพื่อเป็นโครงงานศึกษาและฝึกฝนทักษะการพัฒนาระบบ Real-Time Multiplayer Web Application ด้วย React, TypeScript, Node.js และ Web Audio API
            </p>
          </div>

          {/* Card 2: Non-Commercial Policy */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-amber-500/30 space-y-2.5">
            <div className="text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <span>เจตนารมณ์ไม่แสวงหาผลกำไร (Non-Commercial Statement)</span>
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              เว็บไซต์นี้สร้างขึ้นเพื่อการศึกษา ความบันเทิงส่วนบุคคล และเป็น Fan-Made Tribute เท่านั้น <strong className="text-amber-300">มิได้มีวัตถุประสงค์เพื่อการค้า ในเชิงพาณิชย์ หรือเพื่อการแสวงหาผลกำไร/หารายได้ใดๆ ทั้งสิ้น</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-black/40 rounded-lg p-2.5 border border-slate-800 text-center">
                <div className="text-slate-200 font-semibold text-xs">เล่นฟรี 100%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">ไม่มีค่าบริการใดๆ</div>
              </div>
              <div className="bg-black/40 rounded-lg p-2.5 border border-slate-800 text-center">
                <div className="text-slate-200 font-semibold text-xs">ไม่มีระบบเติมเงิน</div>
                <div className="text-[11px] text-slate-400 mt-0.5">ไม่มี In-App Purchases</div>
              </div>
              <div className="bg-black/40 rounded-lg p-2.5 border border-slate-800 text-center">
                <div className="text-slate-200 font-semibold text-xs">ไม่มีโฆษณา</div>
                <div className="text-[11px] text-slate-400 mt-0.5">ไม่มี Ads สร้างรายได้</div>
              </div>
            </div>
          </div>

          {/* Card 3: Copyright & Trademark Notice */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="text-slate-300 font-bold text-xs sm:text-sm">
              ทรัพย์สินทางปัญญาและลิขสิทธิ์ (Copyright & Fair Use)
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              ตัวละคร เครื่องหมายการค้า ภาพประกอบ และเนื้อหาทั้งหมดของ Marvel เป็นลิขสิทธิ์ของ <strong>MARVEL Entertainment / The Walt Disney Company</strong>
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              กติกาและกลไกของเกม Splendor เป็นลิขสิทธิ์ของ <strong>Space Cowboys / Asmodee Group</strong>
            </p>
            <p className="text-slate-400 text-xs leading-relaxed italic pt-1 border-t border-slate-800/80">
              ผลงานนี้สร้างสรรค์ขึ้นภายใต้หลัก Fair Use หากชื่นชอบความสนุกของเกม โปรดร่วมสนับสนุนบอร์ดเกมกล่องแท้ "Splendor: Marvel" จากตัวแทนจำหน่ายที่ถูกต้องตามลิขสิทธิ์ครับ
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-5 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Marvel Splendor Fan Project</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
