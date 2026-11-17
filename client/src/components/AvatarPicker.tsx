// ============================================================
//  AvatarPicker.tsx — Marvel Splendor Profile Avatar Selector
// ============================================================

import React, { useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Check, X } from 'lucide-react';
import marvelAvatarsData from '../data/marvelAvatarsData.json';

export interface AvatarOption {
  id: string;
  name: string;
  src: string;
  color: string;
}

export const MARVEL_AVATARS: AvatarOption[] = [
  { id: 'iron_man',        name: 'Iron Man',        src: (marvelAvatarsData as Record<string, string>)['iron_man'] || '/images/avatars/iron_man.jpg',        color: 'ring-amber-400' },
  { id: 'thor',            name: 'Thor',            src: (marvelAvatarsData as Record<string, string>)['thor'] || '/images/avatars/thor.jpg',            color: 'ring-amber-400' },
  { id: 'captain_america', name: 'Captain America', src: (marvelAvatarsData as Record<string, string>)['captain_america'] || '/images/avatars/captain_america.jpg', color: 'ring-amber-400' },
  { id: 'hulk',            name: 'Hulk',            src: (marvelAvatarsData as Record<string, string>)['hulk'] || '/images/avatars/hulk.jpg',            color: 'ring-amber-400' },
  { id: 'spider_man',      name: 'Spider-Man',      src: (marvelAvatarsData as Record<string, string>)['spider_man'] || '/images/avatars/spider_man.jpg',      color: 'ring-amber-400' },
  { id: 'black_panther',   name: 'Black Panther',   src: (marvelAvatarsData as Record<string, string>)['black_panther'] || '/images/avatars/black_panther.jpg',   color: 'ring-amber-400' },
  { id: 'doctor_strange',  name: 'Dr. Strange',     src: (marvelAvatarsData as Record<string, string>)['doctor_strange'] || '/images/avatars/doctor_strange.jpg',  color: 'ring-amber-400' },
  { id: 'thanos',          name: 'Thanos',          src: (marvelAvatarsData as Record<string, string>)['thanos'] || '/images/avatars/thanos.jpg',          color: 'ring-amber-400' },
  { id: 'scarlet_witch',   name: 'Scarlet Witch',   src: (marvelAvatarsData as Record<string, string>)['scarlet_witch'] || '/images/avatars/scarlet_witch.jpg',   color: 'ring-amber-400' },
  { id: 'black_widow',     name: 'Black Widow',     src: (marvelAvatarsData as Record<string, string>)['black_widow'] || '/images/avatars/black_widow.jpg',     color: 'ring-amber-400' },
  { id: 'hawkeye',         name: 'Hawkeye',         src: (marvelAvatarsData as Record<string, string>)['hawkeye'] || '/images/avatars/hawkeye.jpg',         color: 'ring-amber-400' },
  { id: 'loki',            name: 'Loki',            src: (marvelAvatarsData as Record<string, string>)['loki'] || '/images/avatars/loki.jpg',            color: 'ring-amber-400' },
  { id: 'captain_marvel',  name: 'Captain Marvel',  src: (marvelAvatarsData as Record<string, string>)['captain_marvel'] || '/images/avatars/captain_marvel.jpg',  color: 'ring-amber-400' },
  { id: 'vision',          name: 'Vision',          src: (marvelAvatarsData as Record<string, string>)['vision'] || '/images/avatars/vision.jpg',          color: 'ring-amber-400' },
  { id: 'ant_man',         name: 'Ant-Man',         src: (marvelAvatarsData as Record<string, string>)['ant_man'] || '/images/avatars/ant_man.jpg',         color: 'ring-amber-400' },
  { id: 'war_machine',     name: 'War Machine',     src: (marvelAvatarsData as Record<string, string>)['war_machine'] || '/images/avatars/war_machine.jpg',     color: 'ring-amber-400' },
  { id: 'deadpool',        name: 'Deadpool',        src: (marvelAvatarsData as Record<string, string>)['deadpool'] || '/images/avatars/deadpool.jpg',        color: 'ring-amber-400' },
  { id: 'wolverine',       name: 'Wolverine',       src: (marvelAvatarsData as Record<string, string>)['wolverine'] || '/images/avatars/wolverine.jpg',       color: 'ring-amber-400' },
  { id: 'groot',           name: 'Groot',           src: (marvelAvatarsData as Record<string, string>)['groot'] || '/images/avatars/groot.jpg',           color: 'ring-amber-400' },
  { id: 'rocket',          name: 'Rocket',          src: (marvelAvatarsData as Record<string, string>)['rocket'] || '/images/avatars/rocket.jpg',          color: 'ring-amber-400' },
  { id: 'doctor_doom',     name: 'Doctor Doom',     src: (marvelAvatarsData as Record<string, string>)['doctor_doom'] || '/images/avatars/doctor_doom.jpg', color: 'ring-amber-400' },
];

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
        'relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-colors cursor-pointer group focus:outline-none active:scale-[0.98]',
        isSelected
          ? 'bg-[#1a1e28] border-amber-400/60'
          : 'border-transparent hover:bg-[#1a1e28]/70 hover:border-white/[0.08]',
      ].join(' ')}
    >
      <div
        className={[
          'w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-colors',
          isSelected ? 'border-amber-400' : 'border-white/[0.12]',
        ].join(' ')}
      >
        {imgFailed ? (
          <div className="w-full h-full bg-[#1a1e28] flex items-center justify-center text-sm font-medium text-[#eef0f5] select-none">
            {av.name.slice(0, 2).toUpperCase()}
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
      <span
        className={[
          'text-[11px] font-medium text-center leading-tight w-full truncate transition-colors',
          isSelected ? 'text-[#eef0f5]' : 'text-[#a3a9b8] group-hover:text-[#eef0f5]',
        ].join(' ')}
      >
        {av.name}
      </span>
      {isSelected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[#07080d] z-10">
          <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
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
        if (url) {
          onSelect(url, 'custom_upload');
          onClose();
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [onSelect, onClose],
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-[#11141c] border border-white/[0.1] rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-[#eef0f5] leading-tight">
              เลือกอวตารฮีโร่
            </h2>
            <p className="text-xs text-[#a3a9b8] mt-0.5">
              เลือกตัวละคร Marvel หรืออัปโหลดรูปภาพของคุณเอง
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1e28] hover:bg-white/[0.1] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-11 rounded-lg border border-dashed border-white/[0.15] hover:border-amber-400/50 bg-[#07080d] hover:bg-[#1a1e28] text-[#a3a9b8] hover:text-[#eef0f5] text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
            <span>อัปโหลดรูปของคุณเอง</span>
            <span className="text-[#7a8296] font-normal">PNG หรือ JPG ไม่เกิน 5MB</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>

        <div className="px-5 py-3 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-xs text-[#7a8296]">ตัวละครในเกม</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        <div className="px-3 pb-5 max-h-[52vh] sm:max-h-[340px] overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-4 gap-2 py-1">
            {MARVEL_AVATARS.map((av) => (
              <HeroAvatarImg
                key={av.id}
                av={av}
                isSelected={currentAvatarId === av.id}
                onSelect={() => {
                  onSelect(av.src, av.id);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
