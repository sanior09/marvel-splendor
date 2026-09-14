// ============================================================
//  heroSignatures.ts — Marvel Major Heroes Signature VFX & SFX
// ============================================================

import { soundManager } from '../utils/soundManager';

export type HeroVFXType =
  | 'lightning'    // Thor, Storm
  | 'repulsor'     // Iron Man
  | 'shield'       // Captain America
  | 'smash'        // Hulk
  | 'mystic'       // Doctor Strange
  | 'web'          // Spider-Man, Miles Morales
  | 'vibranium'    // Black Panther
  | 'infinity';    // Thanos

export interface HeroSignature {
  id: string;
  name: string;
  aliases: string[];
  titleTh: string;
  titleEn: string;
  tagline: string;
  icon: string;
  vfxType: HeroVFXType;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  soundKey: 'thunder' | 'repulsor' | 'shield' | 'smash' | 'mystic' | 'web' | 'vibranium' | 'snap';
}

export const HERO_SIGNATURES: HeroSignature[] = [
  {
    id: 'thor',
    name: 'Thor',
    aliases: ['Thor', 'ธอร์'],
    titleTh: 'ธอร์ • เทพเจ้าสายฟ้า',
    titleEn: 'THOR • GOD OF THUNDER',
    tagline: 'สายฟ้าคำรามสะท้านกระดาน!',
    icon: '⚡',
    vfxType: 'lightning',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    bgGradient: 'from-sky-600/30 via-cyan-900/40 to-blue-950/80',
    soundKey: 'thunder',
  },
  {
    id: 'storm',
    name: 'Storm',
    aliases: ['Storm', 'สตอร์ม'],
    titleTh: 'สตอร์ม • มิวแทนท์พายุ',
    titleEn: 'STORM • GODDESS OF WEATHER',
    tagline: 'มหาพายุสายฟ้าโหมกระหน่ำ!',
    icon: '🌩️',
    vfxType: 'lightning',
    accentColor: '#67e8f9',
    glowColor: 'rgba(103, 232, 249, 0.65)',
    bgGradient: 'from-cyan-600/30 via-indigo-900/40 to-slate-950/80',
    soundKey: 'thunder',
  },
  {
    id: 'iron_man',
    name: 'Iron Man',
    aliases: ['Iron Man', 'ไอรอนแมน'],
    titleTh: 'ไอรอนแมน • อัจฉริยะเกราะเหล็ก',
    titleEn: 'IRON MAN • ARMORED AVENGER',
    tagline: 'ระบบเตาปฏิกรณ์อาร์คพร้อมประจัญบาน!',
    icon: '🤖',
    vfxType: 'repulsor',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    bgGradient: 'from-amber-600/30 via-red-950/50 to-slate-950/80',
    soundKey: 'repulsor',
  },
  {
    id: 'captain_america',
    name: 'Captain America',
    aliases: ['Captain America', 'กัปตันอเมริกา'],
    titleTh: 'กัปตันอเมริกา • ผู้พิทักษ์เสรีภาพ',
    titleEn: 'CAPTAIN AMERICA • FIRST AVENGER',
    tagline: 'โล่ไวเบรเนียมสะท้อนเกียรติยศ!',
    icon: '🛡️',
    vfxType: 'shield',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.65)',
    bgGradient: 'from-blue-600/30 via-red-900/30 to-slate-950/80',
    soundKey: 'shield',
  },
  {
    id: 'hulk',
    name: 'Hulk',
    aliases: ['Hulk', 'ฮัลค์'],
    titleTh: 'ฮัลค์ • พลังหมัดทำลายล้าง',
    titleEn: 'THE INCREDIBLE HULK',
    tagline: 'HULK SMASH! คลื่นพลังแกมมาถล่มพื้น!',
    icon: '💥',
    vfxType: 'smash',
    accentColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.65)',
    bgGradient: 'from-green-600/30 via-emerald-950/50 to-black/80',
    soundKey: 'smash',
  },
  {
    id: 'doctor_strange',
    name: 'Doctor Strange',
    aliases: ['Doctor Strange', 'ด็อกเตอร์สเตรนจ์', 'ดร. สเตรนจ์'],
    titleTh: 'ด็อกเตอร์ สเตรนจ์ • จอมเวทย์สูงสุด',
    titleEn: 'DOCTOR STRANGE • SORCERER SUPREME',
    tagline: 'ศาสตร์ลึกลับแห่งคามาร์-ทาจเบิกเนตร!',
    icon: '🔮',
    vfxType: 'mystic',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.65)',
    bgGradient: 'from-orange-600/30 via-amber-950/40 to-slate-950/80',
    soundKey: 'mystic',
  },
  {
    id: 'spider_man',
    name: 'Spider-Man',
    aliases: ['Spider-Man', 'Miles Morales', 'สไปเดอร์แมน'],
    titleTh: 'สไปเดอร์แมน • ฮีโร่เพื่อนบ้านผู้แสนดี',
    titleEn: 'SPIDER-MAN • FRIENDLY NEIGHBORHOOD',
    tagline: 'ใยแมงมุมพุ่งกระชับพื้นที่!',
    icon: '🕷️',
    vfxType: 'web',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.65)',
    bgGradient: 'from-red-600/30 via-blue-950/50 to-slate-950/80',
    soundKey: 'web',
  },
  {
    id: 'black_panther',
    name: 'Black Panther',
    aliases: ['Black Panther', 'แบล็คแพนเธอร์'],
    titleTh: 'แบล็ค แพนเธอร์ • กษัตริย์แห่งวากานด้า',
    titleEn: 'BLACK PANTHER • KING OF WAKANDA',
    tagline: 'พลังจลน์ไวเบรเนียมคำราม! WAKANDA FOREVER!',
    icon: '🐾',
    vfxType: 'vibranium',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    bgGradient: 'from-purple-600/30 via-fuchsia-950/50 to-slate-950/80',
    soundKey: 'vibranium',
  },
  {
    id: 'thanos',
    name: 'Thanos',
    aliases: ['Thanos', 'ธานอส'],
    titleTh: 'ธานอส • จอมราชันย์แห่งไททัน',
    titleEn: 'THANOS • THE MAD TITAN',
    tagline: 'สมดุลแห่งจักรวาลอยู่ในกำมือ!',
    icon: '🧤',
    vfxType: 'infinity',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    bgGradient: 'from-yellow-600/30 via-purple-950/60 to-black/85',
    soundKey: 'snap',
  },
];

export function getHeroSignature(cardName?: string | null): HeroSignature | null {
  if (!cardName) return null;
  const lower = cardName.trim().toLowerCase();
  for (const sig of HERO_SIGNATURES) {
    for (const alias of sig.aliases) {
      if (lower === alias.toLowerCase() || lower.includes(alias.toLowerCase())) {
        return sig;
      }
    }
  }
  return null;
}

export function playHeroSignatureSound(sig: HeroSignature): void {
  switch (sig.soundKey) {
    case 'thunder':
      soundManager.playHeroThunder();
      break;
    case 'repulsor':
      soundManager.playHeroRepulsor();
      break;
    case 'shield':
      soundManager.playHeroShieldClang();
      break;
    case 'smash':
      soundManager.playHeroSmash();
      break;
    case 'mystic':
      soundManager.playHeroMystic();
      break;
    case 'web':
      soundManager.playHeroWeb();
      break;
    case 'vibranium':
      soundManager.playHeroVibranium();
      break;
    case 'snap':
      soundManager.playHeroSnap();
      break;
  }
}
