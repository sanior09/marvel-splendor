// ============================================================
//  AvatarPicker.tsx — Marvel Splendor Profile Avatar Selector
// ============================================================

import React, { useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface AvatarOption {
  id: string;
  name: string;
  src: string;
  color: string;
}

export const MARVEL_AVATARS: AvatarOption[] = [
  { id: 'iron_man',        name: 'Iron Man',        src: '/images/avatars/iron_man.jpg',        color: 'ring-red-500' },
  { id: 'thor',            name: 'Thor',            src: '/images/avatars/thor.jpg',            color: 'ring-yellow-400' },
  { id: 'captain_america', name: 'Captain America', src: '/images/avatars/captain_america.jpg', color: 'ring-blue-500' },
  { id: 'hulk',            name: 'Hulk',            src: '/images/avatars/hulk.jpg',            color: 'ring-green-500' },
  { id: 'spider_man',      name: 'Spider-Man',      src: '/images/avatars/spider_man.jpg',      color: 'ring-red-400' },
  { id: 'black_panther',   name: 'Black Panther',   src: '/images/avatars/black_panther.jpg',   color: 'ring-purple-500' },
  { id: 'doctor_strange',  name: 'Dr. Strange',     src: '/images/avatars/doctor_strange.jpg',  color: 'ring-indigo-400' },
  { id: 'thanos',          name: 'Thanos',          src: '/images/avatars/thanos.jpg',          color: 'ring-violet-600' },
  { id: 'scarlet_witch',   name: 'Scarlet Witch',   src: '/images/avatars/scarlet_witch.jpg',   color: 'ring-rose-500' },
  { id: 'black_widow',     name: 'Black Widow',     src: '/images/avatars/black_widow.jpg',     color: 'ring-gray-400' },
  { id: 'hawkeye',         name: 'Hawkeye',         src: '/images/avatars/hawkeye.jpg',         color: 'ring-purple-500' },
  { id: 'loki',            name: 'Loki',            src: '/images/avatars/loki.jpg',            color: 'ring-emerald-500' },
  { id: 'captain_marvel',  name: 'Captain Marvel',  src: '/images/avatars/captain_marvel.jpg',  color: 'ring-yellow-500' },
  { id: 'vision',          name: 'Vision',          src: '/images/avatars/vision.jpg',          color: 'ring-red-300' },
  { id: 'ant_man',         name: 'Ant-Man',         src: '/images/avatars/ant_man.jpg',         color: 'ring-red-600' },
  { id: 'war_machine',     name: 'War Machine',     src: '/images/avatars/war_machine.jpg',     color: 'ring-zinc-400' },
  { id: 'deadpool',        name: 'Deadpool',        src: '/images/avatars/deadpool.jpg',        color: 'ring-red-600' },
  { id: 'wolverine',       name: 'Wolverine',       src: '/images/avatars/wolverine.jpg',       color: 'ring-amber-500' },
  { id: 'groot',           name: 'Groot',           src: '/images/avatars/groot.jpg',           color: 'ring-emerald-700' },
  { id: 'rocket',          name: 'Rocket',          src: '/images/avatars/rocket.jpg',          color: 'ring-orange-500' },
];

const FALLBACK_COLORS: Record<string, string> = {
  iron_man: 'from-red-600 to-yellow-500', thor: 'from-yellow-400 to-blue-600',
  captain_america: 'from-blue-600 to-red-500', hulk: 'from-green-500 to-green-800',
  spider_man: 'from-red-600 to-blue-700', black_panther: 'from-purple-800 to-gray-900',
  doctor_strange: 'from-indigo-600 to-yellow-500', thanos: 'from-violet-700 to-purple-900',
  scarlet_witch: 'from-rose-600 to-red-900', black_widow: 'from-gray-700 to-gray-900',
  hawkeye: 'from-purple-600 to-purple-900', loki: 'from-emerald-600 to-yellow-600',
  captain_marvel: 'from-yellow-500 to-blue-700', vision: 'from-yellow-400 to-red-600',
  ant_man: 'from-red-700 to-red-900', war_machine: 'from-zinc-600 to-zinc-900',
  deadpool: 'from-red-600 to-neutral-900', wolverine: 'from-amber-500 to-blue-700',
  groot: 'from-emerald-800 to-amber-900', rocket: 'from-orange-600 to-slate-800',
};

const FALLBACK_EMOJI: Record<string, string> = {
  iron_man: '🦾', thor: '⚡', captain_america: '🛡️', hulk: '💚',
  spider_man: '🕷️', black_panther: '🐾', doctor_strange: '✨', thanos: '🧤',
  scarlet_witch: '🔮', black_widow: '🕸️', hawkeye: '🎯', loki: '🐍',
  captain_marvel: '⭐', vision: '🤖', ant_man: '🐜', war_machine: '⚙️',
  deadpool: '⚔️', wolverine: '🐺', groot: '🌳', rocket: '🦝',
};

interface HeroAvatarImgProps {
  av: AvatarOption;
  isSelected: boolean;
  onSelect: () => void;
}

const HeroAvatarImg: React.FC<HeroAvatarImgProps> = ({ av, isSelected, onSelect }) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      title={av.name}
      className={[
        'relative flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer group focus:outline-none active:scale-95',
        isSelected ? 'bg-white/15 scale-105 shadow-lg' : 'hover:bg-white/10',
      ].join(' ')}
    >
      <div
        className={[
          'w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 transition-all',
          isSelected ? `${av.color} ring-offset-2 ring-offset-black/60 shadow-xl` : 'ring-white/20',
        ].join(' ')}
      >
        {imgFailed ? (
          <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_COLORS[av.id] ?? 'from-red-600 to-purple-700'} flex items-center justify-center text-2xl select-none`}>
            {FALLBACK_EMOJI[av.id] ?? '🦸'}
          </div>
        ) : (
          <img
            src={av.src}
            alt={av.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-center"
          />
        )}
      </div>
      <span className={[
        'text-[9px] sm:text-[10px] font-bold text-center leading-tight w-full truncate px-0.5 transition-colors',
        isSelected ? 'text-white' : 'text-white/55 group-hover:text-white/90',
      ].join(' ')}>
        {av.name}
      </span>
      {isSelected && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg z-10">
          ✓
        </span>
      )}
    </button>
  );
};

interface AvatarPickerProps {
  isOpen: boolean;
  currentAvatarId: string | null;
  onSelect: (url: string, id: string) => void;
  onClose: () => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  isOpen,
  currentAvatarId,
  onSelect,
  onClose,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์ใหญ่เกินไป กรุณาเลือกรูปขนาดไม่เกิน 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (url) { onSelect(url, 'custom_upload'); onClose(); }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [onSelect, onClose],
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-neutral-950/97 border border-white/15 shadow-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up">

        {/* Mobile drag indicator */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-white text-lg leading-tight tracking-wide">
              🦸 เลือกโปรไฟล์ฮีโร่
            </h2>
            <p className="text-white/45 text-xs mt-0.5">ตัวละคร Marvel หรืออัปโหลดรูปของคุณเอง</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xl leading-none transition-all cursor-pointer"
            aria-label="ปิด"
          >×</button>
        </div>

        {/* Upload CTA */}
        <div className="px-5 pt-4 pb-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-white/20 hover:border-yellow-400/60 bg-white/5 hover:bg-yellow-400/5 text-white/65 hover:text-yellow-300 font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95"
          >
            <span className="text-xl">📷</span>
            <span>อัปโหลดรูปของคุณเอง</span>
            <span className="text-white/30 text-xs font-normal">(PNG/JPG ≤5MB)</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Divider */}
        <div className="px-5 py-2 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider">ฮีโร่มาร์เวล</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Hero grid */}
        <div className="px-3 pb-6 max-h-[52vh] sm:max-h-[340px] overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-4 gap-1.5 py-1">
            {MARVEL_AVATARS.map((av) => (
              <HeroAvatarImg
                key={av.id}
                av={av}
                isSelected={currentAvatarId === av.id}
                onSelect={() => { onSelect(av.src, av.id); onClose(); }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
