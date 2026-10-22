// ============================================================
//  AboutDisclaimerModal.tsx — Developer Credits & Non-Commercial Disclaimer
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative glass-strong rounded-2xl border border-yellow-400/30 shadow-[0_0_80px_rgba(0,0,0,0.95)] max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-slide-up z-10 bg-slate-950/95 text-white font-sans antialiased">
        {/* Header */}
        <header className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-950/70 via-slate-950 to-blue-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛡️</span>
            <div>
              <h2 className="font-sans text-sm sm:text-base font-bold text-white tracking-wide">
                เกี่ยวกับเว็บไซต์และข้อกำหนดลิขสิทธิ์
              </h2>
              <p className="text-[10px] sm:text-xs text-white/60">
                Splendor: Marvel Fan-Made Project • ข้อมูลผู้พัฒนา
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-red-600/80 text-white/80 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer border border-white/15"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs leading-relaxed">
          {/* Section 1: Developer Info */}
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-white/60 font-bold uppercase text-[10px] tracking-wider">
                ผู้พัฒนาเว็บไซต์ (Developer / Creator)
              </span>
              <span className="bg-gradient-to-r from-amber-950/90 via-yellow-950/80 to-amber-950/90 text-amber-200 border border-amber-400/60 px-3 py-0.5 rounded-full font-bold text-xs shadow-[0_1px_8px_rgba(245,158,11,0.25)] tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                👑 sanior09
              </span>
            </div>
            <p className="text-white/80 text-[11px]">
              โครงการนี้พัฒนาขึ้นโดย <strong className="text-amber-200 font-bold">sanior09</strong> ด้วยความมุ่งมั่นในการสร้างสรรค์ระบบเว็บเกมกระดานแบบ Real-Time Multiplayer และ Solo AI บนสถาปัตยกรรม React, TypeScript, Node.js และ Web Audio API
            </p>
          </div>

          {/* Section 2: Non-Commercial Statement (Critical Notice) */}
          <div className="bg-red-950/30 rounded-xl p-3.5 border border-red-500/40 space-y-2">
            <div className="flex items-center gap-1.5 text-red-300 font-bold text-xs uppercase tracking-wider">
              <span>⚠️</span>
              <span>คำชี้แจง: ไม่ได้ทำเพื่อการค้าหรือหารายได้ (Non-Commercial Notice)</span>
            </div>
            <p className="text-white/90 text-[11px] leading-relaxed">
              เว็บไซต์และเกมนี้สร้างขึ้นมา <strong className="text-amber-200 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">เพื่อการศึกษา ความบันเทิงส่วนบุคคล และเป็น Fan-Made Tribute สำหรับแฟนบอร์ดเกม Splendor และ Marvel เท่านั้น</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/75 text-[10.5px] pl-1">
              <li><strong>ไม่มีการแสวงหาผลกำไร:</strong> ไม่มีการเรียกเก็บค่าธรรมเนียมหรือค่าใช้จ่ายใดๆ จากผู้เล่นทั้งสิ้น</li>
              <li><strong>ไม่มีระบบเติมเงิน:</strong> ไม่มีการขายสินค้า การซื้อขายไอเทม หรือระบบ Microtransactions ใดๆ</li>
              <li><strong>ไม่มีโฆษณา:</strong> ไม่มีการติดแบนเนอร์โฆษณา (No Ads) หรือสร้างรายได้จากการเข้าชมเว็บไซต์</li>
            </ul>
          </div>

          {/* Section 3: Copyright & Trademark Notice */}
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-white/80 font-bold text-xs">
              <span>⚖️</span>
              <span>ทรัพย์สินทางปัญญาและลิขสิทธิ์ (Copyright & Trademarks)</span>
            </div>
            <p className="text-white/70 text-[10.5px] leading-relaxed">
              เครื่องหมายการค้า ตัวละคร ฮีโร่ รูปภาพ โลโก้ และเนื้อหาจักรวาลมาร์เวลทั้งหมด เป็นลิขสิทธิ์และทรัพย์สินทางปัญญาของ <strong>MARVEL Entertainment / The Walt Disney Company</strong>
            </p>
            <p className="text-white/70 text-[10.5px] leading-relaxed">
              กลไกและระบบกติกาเกม Splendor เป็นทรัพย์สินทางปัญญาของ <strong>Space Cowboys / Asmodee Group</strong>
            </p>
            <p className="text-amber-300/80 text-[10.5px] italic">
              หากท่านชื่นชอบความสนุกของเกม ขอแนะนำให้อุดหนุนบอร์ดเกมกล่องแท้ "Splendor: Marvel" เพื่อสนับสนุนผู้ถือลิขสิทธิ์อย่างเป็นทางการครับ
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 py-2.5 bg-black/70 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 shrink-0">
          <span>Made with ❤️ for Marvel Splendor Fans</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs cursor-pointer transition-all shadow"
          >
            รับทราบและปิด
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
