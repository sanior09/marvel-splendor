// ============================================================
//  TutorialModal.tsx — Interactive Game Guide
// ============================================================

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  Eye,
  Gem,
  Layers,
  Lightbulb,
  Lock,
  MapPin,
  Shield,
  Tag,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  stepNumber: number;
  badge: string;
  Icon: LucideIcon;
  title: string;
  summary: string;
  bullets: {
    Icon: LucideIcon;
    title: string;
    desc: string;
  }[];
  proTip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    badge: 'เป้าหมายหลัก',
    Icon: Trophy,
    title: 'ภารกิจพิชิต Infinity Gauntlet',
    summary: 'เป้าหมายของเกมคือการเป็นคนแรกที่ทำเงื่อนไขถุงมืออินฟินิตี้ครบทั้ง 3 ประการเพื่อชนะการแข่งขัน',
    bullets: [
      {
        Icon: Target,
        title: 'สะสมให้ครบ 16 คะแนน',
        desc: 'ได้จากการซื้อการ์ดฮีโร่และการยึดครองไทล์สถานที่พิเศษ',
      },
      {
        Icon: Layers,
        title: 'สะสมโบนัสการ์ดฮีโร่ครบ 5 สีหลัก',
        desc: 'ต้องมีการ์ดฮีโร่อย่างน้อยสีละ 1 ใบ ได้แก่ Reality (แดง), Space (น้ำเงิน), Soul (ส้ม), Mind (เหลือง) และ Power (ม่วง)',
      },
      {
        Icon: Gem,
        title: 'ครอบครอง Green Time Stone',
        desc: 'ได้รับทันทีเมื่อคุณซื้อการ์ดระดับ 3 ใบแรกของเกม',
      },
    ],
    proTip: 'วางแผนสะสมการ์ดให้ครบทั้ง 5 สีควบคู่กับแต้ม จะช่วยให้ปิดเกมได้เร็วกว่าเน้นแต้มสูงอย่างเดียว',
  },
  {
    stepNumber: 2,
    badge: 'การเล่นในเทิร์น',
    Icon: Gem,
    title: 'การหยิบเหรียญอัญมณี',
    summary: 'ในแต่ละเทิร์นสามารถเลือกกระทำได้ 1 อย่าง โดยวิธีเริ่มต้นคือการหยิบเหรียญอัญมณีจากกองกลาง',
    bullets: [
      {
        Icon: Coins,
        title: 'หยิบ 3 ก้อนต่างสีกัน',
        desc: 'เลือกหยิบเหรียญคนละสี 3 ก้อน จาก 5 สีหลัก',
      },
      {
        Icon: Coins,
        title: 'หยิบ 2 ก้อนสีเดียวกัน',
        desc: 'ทำได้เฉพาะเมื่อสีนั้นในกองกลางมีเหลืออยู่ตั้งแต่ 4 ก้อนขึ้นไป',
      },
      {
        Icon: AlertTriangle,
        title: 'ถือเหรียญรวมได้สูงสุด 10 ก้อน',
        desc: 'หากหยิบแล้วเกิน 10 ก้อน ระบบจะให้เลือกทิ้งเหรียญส่วนเกินคืนกองกลาง',
      },
    ],
    proTip: 'เหรียญ S.H.I.E.L.D. สีเทาไม่สามารถหยิบจากกองกลางโดยตรงได้ จะได้รับเฉพาะเมื่อสั่งจองการ์ดเท่านั้น',
  },
  {
    stepNumber: 3,
    badge: 'สร้างทีมฮีโร่',
    Icon: Users,
    title: 'การซื้อการ์ดฮีโร่และส่วนลดถาวร',
    summary: 'ใช้เหรียญอัญมณีในมือเพื่อซื้อการ์ดฮีโร่ลงสนาม โดยการ์ดแต่ละใบจะช่วยลดต้นทุนตลอดทั้งเกม',
    bullets: [
      {
        Icon: Coins,
        title: 'จ่ายเหรียญตามราคาด้านล่างการ์ด',
        desc: 'นำเหรียญจากมือจ่ายคืนกองกลางตามจำนวนที่ระบุบนการ์ด',
      },
      {
        Icon: Tag,
        title: 'รับโบนัสส่วนลดถาวร',
        desc: 'โบนัสอัญมณีมุมบนขวาของการ์ดที่ซื้อแล้ว จะใช้เป็นส่วนลดถาวร 1 ก้อนต่อใบในการซื้อครั้งถัดไป',
      },
      {
        Icon: Zap,
        title: 'เอฟเฟกต์ประจำตัวฮีโร่',
        desc: 'การ์ดตัวละครหลักบางใบ เช่น Thor, Iron Man หรือ Hulk จะมีภาพและเสียงเฉพาะตัวเมื่อซื้อเข้าทีม',
      },
    ],
    proTip: 'ช่วงต้นเกมควรเน้นซื้อการ์ด Tier 1 ราคาประหยัดเพื่อสะสมส่วนลดถาวรก่อนขยับไป Tier 2 และ 3',
  },
  {
    stepNumber: 4,
    badge: 'การจองการ์ด',
    Icon: Lock,
    title: 'การจองการ์ดและเหรียญ Wildcard',
    summary: 'หากต้องการเก็บการ์ดไว้ซื้อทีหลังหรือกันไม่ให้คู่แข่งซื้อ สามารถใช้สิทธิ์จองการ์ดในเทิร์นนั้นได้',
    bullets: [
      {
        Icon: Lock,
        title: 'จองเข้ามือได้สูงสุด 3 ใบ',
        desc: 'การ์ดที่จองจะถูกเก็บไว้ในช่องส่วนตัวโดยผู้เล่นอื่นไม่สามารถซื้อได้',
      },
      {
        Icon: Shield,
        title: 'รับเหรียญ S.H.I.E.L.D. ฟรี 1 ก้อน',
        desc: 'เมื่อจองจะได้รับเหรียญ Wildcard สีเทา 1 ก้อน (หากในกองกลางยังมีเหลือ) ใช้แทนอัญมณีสีใดก็ได้',
      },
      {
        Icon: Layers,
        title: 'จองได้ทั้งใบเปิดและใบบนสุดของกอง',
        desc: 'เลือกจองการ์ดที่เปิดอยู่บนกระดาน หรือสุ่มหยิบใบคว่ำบนสุดของกองระดับ 1, 2 หรือ 3 ก็ได้',
      },
    ],
    proTip: 'การจองเป็นทางเดียวในการรับเหรียญ Wildcard สีเทาซึ่งมีประโยชน์มากสำหรับซื้อการ์ด Tier 3',
  },
  {
    stepNumber: 5,
    badge: 'คะแนนโบนัส',
    Icon: Award,
    title: 'ตรา Avengers และสถานที่พิเศษ',
    summary: 'คะแนนเสริมจากไทล์พิเศษบนกระดานช่วยเร่งแต้มให้ถึงเป้าหมายได้เร็วขึ้นมาก',
    bullets: [
      {
        Icon: Award,
        title: 'ไทล์ Avengers Assemble (+3 แต้ม)',
        desc: 'ผู้เล่นที่สะสมสัญลักษณ์ตัว A ได้ตั้งแต่ 3 ตราขึ้นไปและมากที่สุดจะได้ครองไทล์นี้ (สามารถถูกแย่งคืนได้หากอีกฝ่ายสะสมแซง)',
      },
      {
        Icon: MapPin,
        title: 'ไทล์สถานที่ (+3 แต้มถาวร)',
        desc: 'เมื่อมีโบนัสการ์ดฮีโร่ครบตามสีที่สถานที่กำหนด จะได้รับไทล์ทันทีแบบถาวร',
      },
      {
        Icon: Eye,
        title: 'วางแผนตามสถานที่ประจำรอบ',
        desc: 'ตรวจดูไทล์สถานที่ที่สุ่มขึ้นมาในแถวบนตั้งแต่ต้นเกม เพื่อวางแผนเก็บการ์ดสีที่สอดคล้องกัน',
      },
    ],
    proTip: 'แต้มจาก Avengers และสถานที่รวมกันให้โบนัสมากถึง 6–9 แต้ม ช่วยปิดเกมได้เร็วขึ้นหลายเทิร์น',
  },
  {
    stepNumber: 6,
    badge: 'รอบตัดสิน',
    Icon: Crown,
    title: 'รอบสุดท้ายและการตัดสินผู้ชนะ',
    summary: 'เมื่อมีผู้เล่นปลดล็อกเงื่อนไขครบถ้วน เกมจะเข้าสู่รอบสุดท้ายเพื่อให้ทุกคนเล่นครบจำนวนเทิร์นเท่ากัน',
    bullets: [
      {
        Icon: Zap,
        title: 'การเริ่มรอบสุดท้าย',
        desc: 'เกิดเมื่อมีผู้เล่นมีแต้มถึงเป้าหมาย มีโบนัสครบ 5 สี และถือ Time Stone สีเขียว',
      },
      {
        Icon: Clock,
        title: 'เล่นจนครบรอบเท่ากัน',
        desc: 'ผู้เล่นที่ยังไม่ได้เล่นในรอบนั้นจะได้เล่นอีก 1 เทิร์นสุดท้ายจนครบทั้งวง',
      },
      {
        Icon: Crown,
        title: 'ตัดสินผู้ชนะจากคะแนนรวม',
        desc: 'ผู้ที่มีคะแนนรวมสูงที่สุดเมื่อจบรอบคือผู้ชนะ หากคะแนนเท่ากันจะตัดสินจากผู้ที่มีการ์ดฮีโร่น้อยกว่า',
      },
    ],
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex]!;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;
  const StepIcon = currentStep.Icon;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#11141c] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#eef0f5] antialiased">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#a3a9b8] shrink-0" strokeWidth={1.5} />
            <div>
              <h2 className="text-sm sm:text-base font-medium text-[#eef0f5]">
                วิธีเล่น Marvel Splendor
              </h2>
              <p className="text-xs text-[#7a8296] mt-0.5">
                คู่มือกติกาเกมทีละขั้นตอน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-[#1a1e28] hover:bg-white/[0.1] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="ปิดคู่มือ"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-5 py-3 bg-[#07080d] border-b border-white/[0.08] shrink-0">
          <div className="flex items-center justify-between text-xs text-[#a3a9b8] mb-2">
            <span>
              ขั้นตอนที่ <span className="font-num text-[#eef0f5] font-medium">{currentStepIndex + 1}</span> จาก{' '}
              <span className="font-num">{TUTORIAL_STEPS.length}</span>
            </span>
            <span className="font-num text-[#7a8296]">
              {Math.round(((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 h-1.5">
            {TUTORIAL_STEPS.map((step, idx) => (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setCurrentStepIndex(idx);
                }}
                className={`h-full rounded-full transition-colors cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-amber-400'
                    : idx < currentStepIndex
                    ? 'bg-[#4cc38a]'
                    : 'bg-white/[0.12] hover:bg-white/[0.24]'
                }`}
                aria-label={`ขั้นตอนที่ ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-start gap-3.5 bg-[#1a1e28] border border-white/[0.08] p-4 rounded-xl">
            <div className="w-11 h-11 rounded-xl bg-[#11141c] border border-white/[0.08] flex items-center justify-center shrink-0">
              <StepIcon className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-[#07080d] bg-amber-400">
                  {currentStep.badge}
                </span>
                <span className="text-xs text-[#7a8296] font-num">
                  Step {currentStep.stepNumber}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-[#eef0f5] leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs text-[#a3a9b8] leading-relaxed mt-1">
                {currentStep.summary}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {currentStep.bullets.map((bullet, idx) => {
              const BulletIcon = bullet.Icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1a1e28]/60 border border-white/[0.08]"
                >
                  <BulletIcon className="w-4 h-4 text-[#a3a9b8] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-[#eef0f5]">{bullet.title}</div>
                    <div className="text-xs text-[#a3a9b8] mt-1 leading-relaxed">
                      {bullet.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {currentStep.proTip && (
            <div className="p-3.5 rounded-xl bg-[#07080d] border border-white/[0.08] text-[#a3a9b8] text-xs flex items-start gap-2.5 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{currentStep.proTip}</span>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-5 py-3.5 border-t border-white/[0.08] bg-[#07080d] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className={`h-9 px-4 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors ${
              isFirst
                ? 'opacity-35 cursor-not-allowed text-[#7a8296] bg-[#11141c] border border-white/[0.06]'
                : 'text-[#eef0f5] bg-[#1a1e28] hover:bg-white/[0.1] border border-white/[0.08] cursor-pointer active:scale-[0.98]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>ย้อนกลับ</span>
          </button>

          <span className="text-xs text-[#7a8296] font-num">
            {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className={`h-9 px-5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] ${
              isLast
                ? 'bg-emerald-500 hover:bg-emerald-400 text-[#07080d]'
                : 'bg-amber-400 hover:bg-amber-300 text-[#07080d]'
            }`}
          >
            <span>{isLast ? 'เข้าใจแล้ว เริ่มเล่นเลย' : 'ถัดไป'}</span>
            {!isLast && <ChevronRight className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
