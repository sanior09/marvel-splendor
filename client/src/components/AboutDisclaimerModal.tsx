// ============================================================
//  AboutDisclaimerModal.tsx — Developer Credits & Non-Commercial Disclaimer
// ============================================================

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Scale, Shield, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-black/75 transition-opacity"
        onClick={handleClose}
      />

      <div className="relative z-10 rounded-2xl border border-white/[0.1] max-w-xl w-full flex flex-col overflow-hidden animate-fade-in bg-[#11141c] text-[#eef0f5]">
        <header className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#a3a9b8] shrink-0" strokeWidth={1.5} />
            <div>
              <h2 className="text-base font-medium text-[#eef0f5] leading-tight">
                เกี่ยวกับเว็บไซต์และข้อกำหนดลิขสิทธิ์
              </h2>
              <p className="text-xs text-[#7a8296] mt-0.5">
                Splendor: Marvel Fan-Made Project
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-[#1a1e28] hover:bg-white/[0.1] text-[#a3a9b8] hover:text-[#eef0f5] flex items-center justify-center transition-colors cursor-pointer border border-white/[0.08]"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </header>

        <div className="p-5 space-y-3 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-[75vh]">
          <div className="bg-[#1a1e28] rounded-xl p-4 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-medium text-[#a3a9b8]">ผู้พัฒนาเว็บไซต์</span>
              <span className="text-xs font-medium text-amber-300 bg-[#11141c] border border-white/[0.08] px-2.5 py-0.5 rounded-md">
                sanior09
              </span>
            </div>
            <p className="text-xs text-[#a3a9b8] leading-relaxed font-normal">
              โครงการนี้พัฒนาขึ้นโดย <span className="text-[#eef0f5] font-medium">sanior09</span> เพื่อจำลองการเล่นบอร์ดเกมแบบ Real-Time Multiplayer และ Solo AI ด้วย React, TypeScript, Node.js และ Web Audio API
            </p>
          </div>

          <div className="bg-[#1a1e28] rounded-xl p-4 border border-red-500/25 space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-medium text-xs">
              <AlertTriangle className="w-4 h-4 text-[#e5484d] shrink-0" strokeWidth={1.5} />
              <span>คำชี้แจงเรื่องการใช้งานที่ไม่ใช่เชิงพาณิชย์</span>
            </div>
            <p className="text-xs text-[#eef0f5] leading-relaxed">
              เว็บไซต์และเกมนี้สร้างขึ้นเพื่อการศึกษาและความบันเทิงส่วนบุคคลสำหรับแฟนบอร์ดเกม Splendor และ Marvel เท่านั้น
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#a3a9b8] text-xs pl-1 leading-relaxed">
              <li><span className="text-[#eef0f5] font-medium">ไม่มีการแสวงหาผลกำไร</span> ไม่มีการเรียกเก็บค่าธรรมเนียมหรือค่าใช้จ่ายใดๆ จากผู้เล่น</li>
              <li><span className="text-[#eef0f5] font-medium">ไม่มีระบบเติมเงิน</span> ไม่มีการขายสินค้า ไอเทม หรือ Microtransactions</li>
              <li><span className="text-[#eef0f5] font-medium">ไม่มีโฆษณา</span> ไม่มีการติดแบนเนอร์โฆษณาเพื่อสร้างรายได้</li>
            </ul>
          </div>

          <div className="bg-[#1a1e28] rounded-xl p-4 border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2 text-[#eef0f5] font-medium text-xs">
              <Scale className="w-4 h-4 text-[#a3a9b8] shrink-0" strokeWidth={1.5} />
              <span>ทรัพย์สินทางปัญญาและลิขสิทธิ์</span>
            </div>
            <p className="text-xs text-[#a3a9b8] leading-relaxed">
              เครื่องหมายการค้า ตัวละคร รูปภาพ และเนื้อหาจักรวาล Marvel เป็นลิขสิทธิ์ของ{' '}
              <span className="text-[#eef0f5] font-medium">MARVEL Entertainment / The Walt Disney Company</span>
            </p>
            <p className="text-xs text-[#a3a9b8] leading-relaxed">
              กลไกและกติกาเกม Splendor เป็นทรัพย์สินทางปัญญาของ{' '}
              <span className="text-[#eef0f5] font-medium">Space Cowboys / Asmodee Group</span>
            </p>
            <div className="bg-[#07080d] border border-white/[0.08] rounded-lg p-3 text-[#a3a9b8] text-xs leading-relaxed">
              หากชื่นชอบตัวเกม แนะนำให้อุดหนุนบอร์ดเกมกล่องแท้{' '}
              <span className="text-[#eef0f5] font-medium">Splendor: Marvel</span> เพื่อสนับสนุนผู้ถือลิขสิทธิ์อย่างเป็นทางการ
            </div>
          </div>
        </div>

        <footer className="px-5 py-3 bg-[#07080d] border-t border-white/[0.08] flex items-center justify-between text-xs text-[#7a8296] shrink-0">
          <span>Fan-Made Tribute</span>
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-5 rounded-lg bg-[#eef0f5] hover:bg-white text-[#07080d] font-medium text-xs transition-colors cursor-pointer active:scale-[0.98]"
          >
            รับทราบและปิด
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
