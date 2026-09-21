// ============================================================
//  heroSignatures.ts — Marvel Major Heroes Signature VFX & SFX
// ============================================================

import { soundManager } from '../utils/soundManager';

export type HeroVFXType =
  | 'lightning'    // Thor, Storm
  | 'repulsor'     // Iron Man, Captain Marvel
  | 'shield'       // Captain America, Hawkeye
  | 'smash'        // Hulk, She-Hulk, Deadpool
  | 'mystic'       // Doctor Strange, Scarlet Witch, Loki
  | 'web'          // Spider-Man, Miles Morales
  | 'vibranium'    // Black Panther, Wolverine
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
  soundKey:
    | 'thunder'
    | 'repulsor'
    | 'shield'
    | 'smash'
    | 'mystic'
    | 'web'
    | 'vibranium'
    | 'snap'
    | 'chaos'
    | 'photon'
    | 'arrow'
    | 'loki'
    | 'deadpool'
    | 'widow'
    | 'claw';
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
    glowColor: 'rgba(56, 189, 248, 0.75)',
    bgGradient: 'from-sky-600/35 via-cyan-900/45 to-blue-950/85',
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
    glowColor: 'rgba(103, 232, 249, 0.7)',
    bgGradient: 'from-cyan-600/35 via-indigo-900/45 to-slate-950/85',
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
    glowColor: 'rgba(245, 158, 11, 0.7)',
    bgGradient: 'from-amber-600/35 via-red-950/55 to-slate-950/85',
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
    glowColor: 'rgba(59, 130, 246, 0.7)',
    bgGradient: 'from-blue-600/35 via-red-900/35 to-slate-950/85',
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
    glowColor: 'rgba(34, 197, 94, 0.7)',
    bgGradient: 'from-green-600/35 via-emerald-950/55 to-black/85',
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
    glowColor: 'rgba(249, 115, 22, 0.7)',
    bgGradient: 'from-orange-600/35 via-amber-950/45 to-slate-950/85',
    soundKey: 'mystic',
  },
  {
    id: 'spider_man',
    name: 'Spider-Man',
    aliases: ['Spider-Man', 'Miles Morales', 'สไปเดอร์แมน', 'Spider-Gwen'],
    titleTh: 'สไปเดอร์แมน • ฮีโร่เพื่อนบ้านผู้แสนดี',
    titleEn: 'SPIDER-MAN • FRIENDLY NEIGHBORHOOD',
    tagline: 'ใยแมงมุมพุ่งกระชับพื้นที่!',
    icon: '🕷️',
    vfxType: 'web',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    bgGradient: 'from-red-600/35 via-blue-950/55 to-slate-950/85',
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
    glowColor: 'rgba(168, 85, 247, 0.7)',
    bgGradient: 'from-purple-600/35 via-fuchsia-950/55 to-slate-950/85',
    soundKey: 'vibranium',
  },
  {
    id: 'thanos',
    name: 'Thanos',
    aliases: ['Thanos', 'ธานอส', 'Galactus'],
    titleTh: 'ธานอส • จอมราชันย์แห่งไททัน',
    titleEn: 'THANOS • THE MAD TITAN',
    tagline: 'สมดุลแห่งจักรวาลอยู่ในกำมือ!',
    icon: '🧤',
    vfxType: 'infinity',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.7)',
    bgGradient: 'from-yellow-600/35 via-purple-950/65 to-black/85',
    soundKey: 'snap',
  },
  {
    id: 'scarlet_witch',
    name: 'Scarlet Witch',
    aliases: ['Scarlet Witch', 'สการ์เล็ต วิทช์', 'Wanda', 'วันด้า'],
    titleTh: 'สการ์เล็ต วิทช์ • จอมเวทเคออส',
    titleEn: 'SCARLET WITCH • CHAOS MAGIC',
    tagline: 'พลังแห่งความโกลาหลบิดเบือนความเป็นจริง!',
    icon: '✨',
    vfxType: 'mystic',
    accentColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.75)',
    bgGradient: 'from-rose-600/35 via-red-950/60 to-black/85',
    soundKey: 'chaos',
  },
  {
    id: 'captain_marvel',
    name: 'Captain Marvel',
    aliases: ['Captain Marvel', 'กัปตัน มาร์เวล', 'Carol Danvers'],
    titleTh: 'กัปตัน มาร์เวล • แสงสว่างแห่งจักรวาล',
    titleEn: 'CAPTAIN MARVEL • COSMIC BINARY',
    tagline: 'พลังงานโฟตอนระดับจักรวาลปะทุ!',
    icon: '🌟',
    vfxType: 'repulsor',
    accentColor: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.75)',
    bgGradient: 'from-amber-500/35 via-blue-900/50 to-red-950/80',
    soundKey: 'photon',
  },
  {
    id: 'hawkeye',
    name: 'Hawkeye',
    aliases: ['Hawkeye', 'ฮอว์กอาย', 'Clint Barton'],
    titleTh: 'ฮอว์กอาย • นักแม่นศรผู้ไม่เคยพลาด',
    titleEn: 'HAWKEYE • WORLD’S GREATEST MARKSMAN',
    tagline: 'ศรทะลวงเป้าหมายอย่างแม่นยำ!',
    icon: '🏹',
    vfxType: 'shield',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.7)',
    bgGradient: 'from-purple-600/35 via-slate-900/60 to-black/85',
    soundKey: 'arrow',
  },
  {
    id: 'loki',
    name: 'Loki',
    aliases: ['Loki', 'โลกิ'],
    titleTh: 'โลกิ • เทพแห่งมนตราและการลวง',
    titleEn: 'LOKI • GOD OF MISCHIEF',
    tagline: 'มนตราแห่งภาพลวงตาครอบงำกระดาน!',
    icon: '👑',
    vfxType: 'mystic',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    bgGradient: 'from-emerald-600/35 via-teal-950/60 to-black/85',
    soundKey: 'loki',
  },
  {
    id: 'deadpool',
    name: 'Deadpool',
    aliases: ['Deadpool', 'เดดพูล', 'Wade Wilson'],
    titleTh: 'เดดพูล • ทหารรับจ้างปากมาก',
    titleEn: 'DEADPOOL • MERC WITH A MOUTH',
    tagline: 'คมดาบคู่ฟาดฟันทะลุมิติ!',
    icon: '⚔️',
    vfxType: 'smash',
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.75)',
    bgGradient: 'from-red-600/35 via-zinc-900/60 to-black/85',
    soundKey: 'deadpool',
  },
  {
    id: 'black_widow',
    name: 'Black Widow',
    aliases: ['Black Widow', 'แบล็ค วิโดว์', 'Natasha Romanoff'],
    titleTh: 'แบล็ค วิโดว์ • ยอดสายลับอเวนเจอร์ส',
    titleEn: 'BLACK WIDOW • MASTER SPY',
    tagline: 'Widow’s Bite ช็อตทำลายล้างความมืด!',
    icon: '🕷️',
    vfxType: 'repulsor',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    bgGradient: 'from-cyan-600/35 via-slate-900/60 to-black/85',
    soundKey: 'widow',
  },
  {
    id: 'wolverine',
    name: 'Wolverine',
    aliases: ['Wolverine', 'วูล์ฟเวอรีน', 'Logan'],
    titleTh: 'วูล์ฟเวอรีน • กรงเล็บอดาแมนเทียม',
    titleEn: 'WOLVERINE • WEAPON X',
    tagline: 'กรงเล็บสังหารสับสะท้านกระดาน!',
    icon: '🐺',
    vfxType: 'vibranium',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.75)',
    bgGradient: 'from-yellow-600/35 via-blue-950/60 to-black/85',
    soundKey: 'claw',
  },
  {
    id: 'she_hulk',
    name: 'She-Hulk',
    aliases: ['She-Hulk', 'ชี-ฮัลค์', 'Jennifer Walters'],
    titleTh: 'ชี-ฮัลค์ • ฮีโร่ทนายสาวพลังยักษ์',
    titleEn: 'SHE-HULK • ATTORNEY AT LAW',
    tagline: 'พลังแกมมาไร้ขีดจำกัดถล่มกระดาน!',
    icon: '⚖️',
    vfxType: 'smash',
    accentColor: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.7)',
    bgGradient: 'from-emerald-600/35 via-green-950/60 to-black/85',
    soundKey: 'smash',
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
    case 'chaos':
      soundManager.playHeroChaos();
      break;
    case 'photon':
      soundManager.playHeroPhoton();
      break;
    case 'arrow':
      soundManager.playHeroArrow();
      break;
    case 'loki':
      soundManager.playHeroLoki();
      break;
    case 'deadpool':
      soundManager.playHeroDeadpool();
      break;
    case 'widow':
      soundManager.playHeroWidow();
      break;
    case 'claw':
      soundManager.playHeroClaw();
      break;
  }
}
