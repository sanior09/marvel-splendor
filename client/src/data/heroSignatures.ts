// ============================================================
//  heroSignatures.ts — Marvel Major Heroes Signature VFX & SFX
// ============================================================

import { soundManager } from '../utils/soundManager';

export type HeroVFXType =
  | 'lightning'    // Thor, Storm
  | 'repulsor'     // Iron Man, Captain Marvel, Star-Lord
  | 'shield'       // Captain America, Hawkeye, Nick Fury
  | 'smash'        // Hulk, She-Hulk, Deadpool, Groot
  | 'mystic'       // Doctor Strange, Scarlet Witch, Loki, Jean Grey
  | 'web'          // Spider-Man, Miles Morales, Spider-Gwen
  | 'vibranium'    // Black Panther, Wolverine, Magneto
  | 'infinity';    // Thanos, Galactus

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
    | 'claw'
    | 'magnetic'
    | 'groot';
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
    aliases: ['Iron Man', 'ไอรอนแมน', 'Tony Stark'],
    titleTh: 'ไอรอนแมน • อัจฉริยะเกราะเหล็ก',
    titleEn: 'IRON MAN • ARMORED AVENGER',
    tagline: 'ระบบเตาปฏิกรณ์อาร์คและรีพัลเซอร์พร้อมประจัญบาน!',
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
    aliases: ['Captain America', 'กัปตันอเมริกา', 'Steve Rogers'],
    titleTh: 'กัปตันอเมริกา • ผู้พิทักษ์เสรีภาพ',
    titleEn: 'CAPTAIN AMERICA • FIRST AVENGER',
    tagline: 'โล่ไวเบรเนียมสะท้อนเกียรติยศสะท้านสนามรบ!',
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
    aliases: ['Hulk', 'ฮัลค์', 'Bruce Banner'],
    titleTh: 'ฮัลค์ • พลังหมัดทำลายล้าง',
    titleEn: 'THE INCREDIBLE HULK',
    tagline: 'HULK SMASH! คลื่นพลังแกมมาถล่มพื้นพสุธา!',
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
    aliases: ['Doctor Strange', 'ด็อกเตอร์สเตรนจ์', 'ดร. สเตรนจ์', 'Stephen Strange'],
    titleTh: 'ด็อกเตอร์ สเตรนจ์ • จอมเวทย์สูงสุด',
    titleEn: 'DOCTOR STRANGE • SORCERER SUPREME',
    tagline: 'ศาสตร์ลึกลับแห่งคามาร์-ทาจเบิกเนตรแห่งมิติ!',
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
    aliases: ['Spider-Man', 'Miles Morales', 'สไปเดอร์แมน', 'Spider-Gwen', 'Peter Parker'],
    titleTh: 'สไปเดอร์แมน • ฮีโร่เพื่อนบ้านผู้แสนดี',
    titleEn: 'SPIDER-MAN • FRIENDLY NEIGHBORHOOD',
    tagline: 'ใยแมงมุมพุ่งกระชับพื้นที่อย่างรวดเร็ว!',
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
    aliases: ['Black Panther', 'แบล็คแพนเธอร์', "T'Challa"],
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
    tagline: 'สมดุลแห่งจักรวาลอยู่ในกำมือเพียงแค่ดีดนิ้ว!',
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
  {
    id: 'magneto',
    name: 'Magneto',
    aliases: ['Magneto', 'แมกนีโต', 'Erik Lehnsherr'],
    titleTh: 'แมกนีโต • จ้าวแห่งสนามแม่เหล็ก',
    titleEn: 'MAGNETO • MASTER OF MAGNETISM',
    tagline: 'คลื่นแม่เหล็กไฟฟ้าบิดเบือนโลหะทั้งมวล!',
    icon: '🧲',
    vfxType: 'vibranium',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.75)',
    bgGradient: 'from-purple-700/35 via-indigo-950/60 to-black/85',
    soundKey: 'magnetic',
  },
  {
    id: 'groot',
    name: 'Groot',
    aliases: ['Groot', 'กรูท'],
    titleTh: 'กรูท • ผู้พิทักษ์พฤกษาพสุธา',
    titleEn: 'GROOT • I AM GROOT',
    tagline: 'รากไม้โบราณผุดทะลวงพื้นพิภพ!',
    icon: '🌳',
    vfxType: 'smash',
    accentColor: '#84cc16',
    glowColor: 'rgba(132, 204, 22, 0.7)',
    bgGradient: 'from-lime-600/35 via-stone-900/60 to-black/85',
    soundKey: 'groot',
  },
  {
    id: 'star_lord',
    name: 'Star-Lord',
    aliases: ['Star-Lord', 'สตาร์ลอร์ด', 'Peter Quill'],
    titleTh: 'สตาร์ลอร์ด • ผู้นำการ์เดียนส์',
    titleEn: 'STAR-LORD • GUARDIANS LEADER',
    tagline: 'ปืนบลาสเตอร์คู่ยิงกระหน่ำจักรวาล!',
    icon: '🚀',
    vfxType: 'repulsor',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    bgGradient: 'from-orange-600/35 via-slate-900/60 to-black/85',
    soundKey: 'repulsor',
  },
  {
    id: 'jean_grey',
    name: 'Jean Grey',
    aliases: ['Jean Grey', 'จีน เกรย์', 'Phoenix', 'ฟีนิกซ์'],
    titleTh: 'จีน เกรย์ • ร่างสถิตฟีนิกซ์',
    titleEn: 'JEAN GREY • PHOENIX FORCE',
    tagline: 'เพลิงฟีนิกซ์แผดเผาห้วงมิติ!',
    icon: '🔥',
    vfxType: 'mystic',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    bgGradient: 'from-rose-600/35 via-amber-950/60 to-black/85',
    soundKey: 'chaos',
  },
  {
    id: 'nick_fury',
    name: 'Nick Fury',
    aliases: ['Nick Fury', 'นิค ฟิวรี่'],
    titleTh: 'นิค ฟิวรี่ • ผู้อำนวยการชิลด์',
    titleEn: 'NICK FURY • DIRECTOR OF S.H.I.E.L.D.',
    tagline: 'คำสั่งรวมพลอเวนเจอร์สเริ่มขึ้นแล้ว!',
    icon: '🎖️',
    vfxType: 'shield',
    accentColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.7)',
    bgGradient: 'from-slate-700/35 via-zinc-900/60 to-black/85',
    soundKey: 'shield',
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
    case 'magnetic':
      soundManager.playHeroMagnetic();
      break;
    case 'groot':
      soundManager.playHeroGroot();
      break;
  }
}
