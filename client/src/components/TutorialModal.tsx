// ============================================================
//  TutorialModal.tsx — Roblox-Style Interactive Game Guide
// ============================================================
//  Step-by-step interactive tutorial explaining how to play
//  Marvel Splendor: Stones, Cards, Reserves, Avengers, & Victory.
// ============================================================

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { soundManager } from '../utils/soundManager';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  stepNumber: number;
  badge: string;
  badgeColor: string;
  icon: string;
  title: string;
  titleEn: string;
  summary: string;
  bullets: {
    icon: string;
    title: string;
    desc: string;
  }[];
  proTip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    badge: 'เป้าหมายหลัก • GOAL',
    badgeColor: 'from-amber-500 to-yellow-600',
    icon: '🧤',
    title: 'ภารกิจพิชิต INFINITY GAUNTLET',
    titleEn: 'Assembling the Infinity Gauntlet',
    summary: 'เป้าหมายของเกมคือการเป็นคนแรกที่ปลดล็อกเงื่อนไขถุงมืออินฟินิตี้ครบทั้ง 3 ประการเพื่อคว้าชัยชนะ!',
    bullets: [
      {
        icon: '🎯',
        title: 'สะสมให้ครบ 16 แต้ม (Infinity Points)',
        desc: 'ได้จากการซื้อการ์ดฮีโร่ และการครองไทล์สถานที่พิเศษ (Locations)',
      },
      {
        icon: '🌈',
        title: 'สะสมโบนัสการ์ดฮีโร่ครบ 5 สีหลัก',
        desc: 'ต้องมีการ์ดฮีโร่อย่างน้อยสีละ 1 ใบ: 🔴 Reality, 🔵 Space, 🟠 Soul, 🟡 Mind, 🟣 Power',
      },
      {
        icon: '🟢',
        title: 'ครอบครอง Green Time Stone',
        desc: 'ได้รับทันทีเมื่อคุณซื้อการ์ดระดับ 3 (Tier 3) ใบแรกของเกม!',
      },
    ],
    proTip: '💡 วางแผนสะสมการ์ดให้ครบทั้ง 5 สีก่อน ไม่ใช่เน้นแค่แต้มสูงอย่างเดียว!',
  },
  {
    stepNumber: 2,
    badge: 'เทิร์นของคุณ • ACTIONS',
    badgeColor: 'from-cyan-500 to-blue-600',
    icon: '💎',
    title: 'การหยิบเหรียญอัญมณี (Infinity Stones)',
    titleEn: 'Collecting Infinity Stones from Bank',
    summary: 'ในแต่ละเทิร์นของคุณ สามารถเลือกทำได้ 1 อย่าง ซึ่งวิธีที่ง่ายที่สุดคือการหยิบเหรียญจากกองกลาง:',
    bullets: [
      {
        icon: '1️⃣',
        title: 'หยิบ 3 ก้อน (ต่างสีกัน)',
        desc: 'เลือกหยิบเหรียญคนละสี 3 ก้อน จาก 5 สีหลัก (แดง, น้ำเงิน, ส้ม, เหลือง, ม่วง)',
      },
      {
        icon: '2️⃣',
        title: 'หยิบ 2 ก้อน (สีเดียวกัน)',
        desc: 'เลือกหยิบสีเดียวกัน 2 ก้อนได้ เฉพาะเมื่อกองสีนั้นในธนาคารเหลือตั้งแต่ 4 ก้อนขึ้นไป',
      },
      {
        icon: '⚠️',
        title: 'กฎสำคัญ: ถือเหรียญรวมได้ไม่เกิน 10 ก้อน',
        desc: 'หากหยิบแล้วเหรียญในมือเกิน 10 ก้อน ระบบจะให้คุณเลือกทิ้งเหรียญส่วนเกินคืนธนาคาร',
      },
    ],
    proTip: '💡 เหรียญสีเทา 🛡️ S.H.I.E.L.D. จะหยิบจากธนาคารไม่ได้ จะได้เฉพาะตอน "จองการ์ด" เท่านั้น!',
  },
  {
    stepNumber: 3,
    badge: 'สร้างกองทัพ • RECRUIT',
    badgeColor: 'from-red-500 to-rose-700',
    icon: '🦸‍♂️',
    title: 'การซื้อการ์ดฮีโร่ & ส่วนลดถาวร',
    titleEn: 'Recruiting Marvel Heroes & Permanent Discounts',
    summary: 'ใช้เหรียญอัญมณีในมือเพื่อจ้างการ์ดฮีโร่ลงสนาม โดยการ์ดจะให้คุณประโยชน์มหาศาลตลอดทั้งเกม:',
    bullets: [
      {
        icon: '💰',
        title: 'จ่ายเหรียญตามราคามุมล่าง',
        desc: 'ดูต้นทุนที่ระบุไว้ที่ขอบล่างของการ์ด แล้วจ่ายเหรียญคืนเข้าสู่กองกลาง',
      },
      {
        icon: '🏷️',
        title: 'รับส่วนลดถาวร (Permanent Bonus)',
        desc: 'การ์ดที่ซื้อแล้วจะให้ไอคอนอัญมณีมุมบนขวา การซื้อครั้งต่อไปคุณจะจ่ายถูกลง 1 ก้อนต่อการ์ด 1 ใบตลอดกาล!',
      },
      {
        icon: '⚡',
        title: 'เอฟเฟกต์เฉพาะตัวสำหรับฮีโร่ตัวหลัก!',
        desc: 'เมื่อซื้อการ์ดตัวหลัก เช่น Thor (สายฟ้า), Iron Man (รีพัลเซอร์), Hulk (ทุบแผ่นดิน) จะมีแสงและเสียงเฉพาะตัวสุดเท่!',
      },
    ],
    proTip: '💡 ช่วงต้นเกมให้เน้นซื้อการ์ด Tier 1 ราคาถูก เพื่อสะสมส่วนลด ยิ่งมีเยอะ ยิ่งซื้อการ์ดใหญ่ๆ ได้ฟรี!',
  },
  {
    stepNumber: 4,
    badge: 'กลยุทธ์กักตุน • RESERVE',
    badgeColor: 'from-purple-500 to-indigo-700',
    icon: '🔒',
    title: 'การจองการ์ด & เหรียญโจ๊กเกอร์ S.H.I.E.L.D.',
    titleEn: 'Reserving Cards & Wildcard Tokens',
    summary: 'ถ้าคุณเห็นการ์ดที่อยากได้แต่เหรียญยังไม่พอ หรือต้องการกันท่าไม่ให้เพื่อนแย่งซื้อ ให้กด "จองการ์ด":',
    bullets: [
      {
        icon: '📥',
        title: 'เก็บการ์ดเข้ามือไว้ซื้อทีหลัง',
        desc: 'การ์ดจะถูกย้ายมาอยู่ในช่องการ์ดจองของคุณ (จองได้สูงสุด 3 ใบ) คนอื่นจะซื้อการ์ดใบนี้ไม่ได้อีก',
      },
      {
        icon: '🛡️',
        title: 'รับเหรียญ S.H.I.E.L.D. สีเทา 1 ก้อนทันที',
        desc: 'เมื่อจอง คุณจะได้เหรียญสีเทา 1 ก้อนฟรี (ถ้าในกองยังมีเหลือ) ซึ่งสามารถใช้แทนอัญมณีสีใดก็ได้!',
      },
      {
        icon: '🃏',
        title: 'จองจากการ์ดบนกระดาน หรือสุ่มใบบนสุดของกอง',
        desc: 'สามารถเลือกจองการ์ดที่เปิดอยู่ หรือจองใบลับบนสุดของกอง Tier 1, 2, หรือ 3 ก็ได้',
      },
    ],
    proTip: '💡 การจองเป็นวิธีเดียวในการได้เหรียญ Wildcard สีเทา ซึ่งมีค่ามากในการซื้อการ์ดราคาแพง!',
  },
  {
    stepNumber: 5,
    badge: 'แต้มพิเศษ • BONUS',
    badgeColor: 'from-emerald-500 to-teal-700',
    icon: '🅰️',
    title: 'ตรา Avengers & ยึดครองสถานที่',
    titleEn: 'Avengers Assemble & Location Tiles (+3 PTS)',
    summary: 'ทางลัดในการเพิ่มคะแนนอย่างก้าวกระโดดผ่านไทล์พิเศษที่แย่งชิงกันบนกระดาน:',
    bullets: [
      {
        icon: '🅰️',
        title: 'ไทล์ Avengers Assemble (+3 คะแนน)',
        desc: 'ใครสะสมการ์ดที่มีสัญลักษณ์ตัว A ได้ตั้งแต่ 3 ตราขึ้นไปและมีมากที่สุด จะได้ครองไทล์นี้ (การ์ด Tier 3 บางใบ เช่น Iron Man ให้ถึง 2 ตรา! และสามารถถูกผู้เล่นอื่นแย่งชิงได้ตลอดเวลา)',
      },
      {
        icon: '🏛️',
        title: 'ไทล์สถานที่ (Locations เช่น Avengers Tower, Wakanda)',
        desc: 'ให้ +3 คะแนนทันที ใครสะสมการ์ดโบนัสสีตรงตามเงื่อนไขครบก่อน จะได้รับไทล์ไปถาวร (ไม่มีใครแย่งได้)',
      },
      {
        icon: '👁️',
        title: 'ตรวจดูเงื่อนไขสถานที่ที่แถวด้านบน',
        desc: 'ในแต่ละเกมจะสุ่มไทล์สถานที่ขึ้นมา วางแผนสะสมการ์ดสีที่ตรงกับสถานที่เพื่อรับแต้มฟรี 3 คะแนน!',
      },
    ],
    proTip: '💡 แต้มจาก Avengers (+3) และสถานที่ (+3) รวมกันได้ถึง 6-9 แต้ม ช่วยให้ชนะเกมได้รวดเร็วมาก!',
  },
  {
    stepNumber: 6,
    badge: 'คว้าแชมป์ • VICTORY',
    badgeColor: 'from-amber-400 to-orange-600',
    icon: '🏆',
    title: 'รอบสุดท้ายและการตัดสินผู้ชนะ',
    titleEn: 'Final Round & Victory Conditions',
    summary: 'เมื่อมีผู้เล่นปลดล็อกเงื่อนไขถุงมืออินฟินิตี้ครบถ้วน สงครามจะเข้าสู่รอบชี้ชะตา:',
    bullets: [
      {
        icon: '⚡',
        title: 'การกระตุ้นรอบสุดท้าย (Final Round Trigger)',
        desc: 'เมื่อมีผู้เล่นมี 16 คะแนนขึ้นไป + มีโบนัสครบ 5 สี + ถือ Time Stone สีเขียว จะกระตุ้นรอบสุดท้าย',
      },
      {
        icon: '⏳',
        title: 'ทุกคนได้เล่นจนครบรอบเท่ากัน',
        desc: 'ผู้เล่นที่ยังไม่ได้เล่นในรอบนั้น จะได้เล่นเทิร์นสุดท้าย เพื่อให้จำนวนเทิร์นของทุกคนเท่าเทียมกัน',
      },
      {
        icon: '👑',
        title: 'ผู้ชนะคือผู้ที่มีคะแนนสูงสุด!',
        desc: 'เมื่อจบรอบ ผู้เล่นที่ทำคะแนนรวมได้สูงสุดจะเป็นผู้ชนะอันดับ 1 แห่งจักรวาล Marvel Splendor!',
      },
    ],
    proTip: '💡 หากคะแนนเท่ากัน ผู้ที่มีการ์ดฮีโร่น้อยกว่า (ใช้ทรัพยากรคุ้มค่ากว่า) จะเป็นผู้ชนะ!',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex]!;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      soundManager.playModalClose();
      onClose();
    } else {
      soundManager.playButtonClick();
      setCurrentStepIndex((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1));
    }
  };

  const handlePrev = () => {
    soundManager.playButtonClick();
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleClose = () => {
    soundManager.playModalClose();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Outer Roblox-style tactile card */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-neutral-900 via-slate-950 to-neutral-950 border-2 border-yellow-400/50 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-black/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <span>วิธีเล่น MARVEL SPLENDOR</span>
                <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded-full font-mono">
                  TUTORIAL
                </span>
              </div>
              <div className="text-[10px] text-white/50">
                คู่มือการเล่นแบบทีละขั้นตอน (Step-by-Step Interactive Guide)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-white/70 hover:text-white font-bold flex items-center justify-center transition-all cursor-pointer text-base shadow"
            title="ปิดหน้าต่าง (Close Tutorial)"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Tracker (Roblox style) */}
        <div className="px-5 pt-3 pb-2 bg-white/5 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-white/70 mb-1.5">
            <span className="flex items-center gap-1 text-white">
              <span>ขั้นตอนที่ {currentStepIndex + 1} จาก {TUTORIAL_STEPS.length}:</span>
              <span className="text-yellow-300">{currentStep.title}</span>
            </span>
            <span className="text-[11px] font-mono text-white/50">
              {Math.round(((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100)}%
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="grid grid-cols-6 gap-1.5 h-2">
            {TUTORIAL_STEPS.map((step, idx) => (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setCurrentStepIndex(idx);
                }}
                className={`h-full rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_8px_#facc15]'
                    : idx < currentStepIndex
                    ? 'bg-emerald-500'
                    : 'bg-white/15 hover:bg-white/30'
                }`}
                title={`ไปที่ขั้นตอนที่ ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Slide Content Area (Scrollable if screen is small) */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Title Badge & Icon */}
          <div className="flex items-start gap-3.5 bg-black/40 border border-white/10 p-3.5 rounded-2xl shadow-inner">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-400/40 flex items-center justify-center text-3xl shadow-lg shrink-0">
              {currentStep.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white uppercase bg-gradient-to-r ${currentStep.badgeColor} shadow-sm`}>
                  {currentStep.badge}
                </span>
                <span className="text-[10px] text-white/40 font-mono">STEP {currentStep.stepNumber}</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                {currentStep.title}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed mt-1">
                {currentStep.summary}
              </p>
            </div>
          </div>

          {/* Bullet Points with Icons */}
          <div className="space-y-2.5">
            {currentStep.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/30 transition-colors"
              >
                <span className="text-xl shrink-0 mt-0.5">{bullet.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-yellow-300">
                    {bullet.title}
                  </div>
                  <div className="text-xs text-white/80 mt-0.5 leading-relaxed">
                    {bullet.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pro-Tip Box */}
          {currentStep.proTip && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2.5 font-medium shadow-sm">
              <span>{currentStep.proTip}</span>
            </div>
          )}
        </div>

        {/* Bottom Navigation Controls (Roblox style buttons) */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className={[
              'px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow',
              isFirst
                ? 'opacity-30 cursor-not-allowed text-white/40 bg-white/5 border border-white/5'
                : 'text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer active:scale-95',
            ].join(' ')}
          >
            <span>⮜ ย้อนกลับ</span>
          </button>

          {/* Dots Indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStepIndex ? 'w-5 bg-yellow-400' : 'bg-white/25'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className={[
              'px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg cursor-pointer active:scale-95',
              isLast
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-yellow-400/30',
            ].join(' ')}
          >
            <span>{isLast ? '🚀 เข้าใจแล้ว เริ่มเล่นเลย!' : 'ถัดไป (Next) ➜'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
