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
  category?: 'avengers' | 'cosmic_mystic' | 'mutants_street';
  stages?: string[];
}

export interface SoundStageInfo {
  stageCount: number;
  stages: string[];
  summaryTh: string;
}

export const HERO_SOUND_STAGES: Record<string, SoundStageInfo> = {
  thunder: {
    stageCount: 4,
    stages: [
      'Stage 1: ประกายประจุไฟฟ้าไอออนไนซ์ (Stepped leader sparks)',
      'Stage 2: แส้สายฟ้าฟาดโอเวอร์ไดรฟ์ (Overdriven whip-crack transient)',
      'Stage 3: คลื่นกระแทกซับเบส 28Hz (28Hz Sub-bass shockwave)',
      'Stage 4: เสียงฟ้าร้องสะท้อนก้อง 2.4 วินาที (Cavernous rolling thunder)',
    ],
    summaryTh: 'ฟ้าร้อง 4 สเตจ: ประจุไอออน ➔ แส้สายฟ้า ➔ ซับเบส 28Hz ➔ ฟ้าร้องสะท้อนก้อง',
  },
  repulsor: {
    stageCount: 5,
    stages: [
      'Stage 1: JARVIS สแกนและปิง HUD คู่ (Dual HUD pings)',
      'Stage 2: ชาร์จเตาปฏิกรณ์อาร์คความถี่ 4.2kHz (Arc Reactor FM whine)',
      'Stage 3: ลำแสงพลาสม่ายูนิบีม & Pink noise (Unibeam plasma blast)',
      'Stage 4: คลื่นกระแทกซับเบส 32Hz (32Hz Sub-bass kick)',
      'Stage 5: ระบบล็อกเกราะไททาเนียม & ระบายไอร้อน (Servo lock & cooling hiss)',
    ],
    summaryTh: 'รีพัลเซอร์ 5 สเตจ: JARVIS HUD ➔ ชาร์จเตาปฏิกรณ์ ➔ ลำแสงยูนิบีม ➔ ซับเบส ➔ ระบายความร้อน',
  },
  shield: {
    stageCount: 4,
    stages: [
      'Stage 1: เสียงแหวกอากาศดอปเปลอร์ (Doppler throw whoosh)',
      'Stage 2: แรงปะทะจลน์กระแทกหนัก (Heavy kinetic blunt slam)',
      'Stage 3: เสียงกังวานโลหะไวเบรเนียมบริสุทธิ์ 5 ฮาร์โมนิก (5 Vibranium bell partials)',
      'Stage 4: แม่เหล็กดูดโล่กลับเข้าปลอกแขน (Magnetic gauntlet catch clack)',
    ],
    summaryTh: 'โล่ไวเบรเนียม 4 สเตจ: ขว้างแหวกอากาศ ➔ ปะทะหนัก ➔ โลหะกังวาน 5 ฮาร์โมนิก ➔ ดูดโล่เข้ามือ',
  },
  smash: {
    stageCount: 4,
    stages: [
      'Stage 1: พุ่งทะยานแหวกอากาศพลังแกมมา (Gamma leap wind whoosh)',
      'Stage 2: ทุบแผ่นดินแตกกระจาย คลื่นเสียงดิสทอร์ชัน (Bedrock rupture wave distortion)',
      'Stage 3: ซากหินและคอนกรีตแตกละเอียด (Concrete/rock fragmentation crunch)',
      'Stage 4: แผ่นดินไหวสะเทือนก้อง 2.2 วินาที (2.2s Seismic tremor)',
    ],
    summaryTh: 'หมัดทำลายล้าง 4 สเตจ: พุ่งทะยาน ➔ ทุบแผ่นดินแตก ➔ หินแตกกระจาย ➔ คลื่นแผ่นดินไหว',
  },
  mystic: {
    stageCount: 4,
    stages: [
      'Stage 1: ประกายไฟสลิงริงหมุนเปิดมิติ (Sling ring spark ignition whoosh)',
      'Stage 2: ระฆังแก้วมนตราคามาร์-ทาจ 7 ตัวโน้ตเพนทาทอนิก (7-note Kamar-Taj chimes)',
      'Stage 3: คลื่นเสียงคอรัสถอดจิต & ดวงตาแห่งอกาม็อตโต (Astral chorus & Agamotto shimmer)',
      'Stage 4: เสียงมิติสะท้อนดังก้องลึก (Deep dimensional drone)',
    ],
    summaryTh: 'มนตราคามาร์-ทาจ 4 สเตจ: ประกายสลิงริง ➔ ระฆังแก้ว 7 โน้ต ➔ คลื่นถอดจิต ➔ มิติก้องลึก',
  },
  snap: {
    stageCount: 4,
    stages: [
      'Stage 1: เกราะโลหะอูรูขยับกระทบ (Uru gauntlet armor clink)',
      'Stage 2: ดีดนิ้วทำลายล้างเหนือเสียง (Supersonic finger snap transient)',
      'Stage 3: คอร์ดพลังมณีอินฟินิตี้ทั้ง 6 ประสานเสียง (6 Infinity Stones harmony chord)',
      'Stage 4: สุญญากาศยุบตัวสู่ความว่างเปล่า (Abyssal vacuum collapse)',
    ],
    summaryTh: 'ดีดนิ้วล้างจักรวาล 4 สเตจ: ขยับถุงมือ ➔ ดีดนิ้วความเร็วเหนือเสียง ➔ มณี 6 สีประสาน ➔ สุญญากาศยุบตัว',
  },
  web: {
    stageCount: 4,
    stages: [
      'Stage 1: กลไกยิงใยคู่คลิกทำงาน (Dual trigger clicks)',
      'Stage 2: แก๊ส CO2 ดันยิงใยพุ่ง "THWIP" (Pneumatic CO2 gas "THWIP")',
      'Stage 3: เส้นใยแรงดึงสูงดีดยืดหยุ่น (High-tension elastic whip zip)',
      'Stage 4: ใยเหนียวติดหนึบเป้าหมาย "THWAP" (Web surface stick "THWAP")',
    ],
    summaryTh: 'ยิงใยแมงมุม 4 สเตจ: คลิกกลไก ➔ ยิงใย THWIP ➔ ใยดีดตึง ➔ ติดหนึบ THWAP',
  },
  vibranium: {
    stageCount: 3,
    stages: [
      'Stage 1: ชุดนาโนสูทดูดซับพลังงานจลน์ (Kinetic suit charging hum)',
      'Stage 2: ระเบิดคลื่นพลังงานจลน์สีม่วง (Kinetic explosive purple blast)',
      'Stage 3: กรงเล็บไวเบรเนียมฟาดสะท้อนกังวาน (Vibranium razor claw ring)',
    ],
    summaryTh: 'ชุดไวเบรเนียม 3 สเตจ: ชาร์จพลังจลน์ ➔ ระเบิดคลื่นสีม่วง ➔ กรงเล็บสะท้อนกังวาน',
  },
  chaos: {
    stageCount: 3,
    stages: [
      'Stage 1: เสียงกระซิบคำสาป & คอร์ดขัดแย้ง Minor 2nd (Dark hex whisper & dissonance)',
      'Stage 2: คลื่นกวาดมนตราเคออสบิดเบือนมิติ (Reality-warping bandpass sweep)',
      'Stage 3: ระเบิดเวทมนตร์สีแดงคลื่นซับเบสต่ำ (Deep red magic sub-bass detonation)',
    ],
    summaryTh: 'มนตราเคออส 3 สเตจ: เสียงกระซิบคำสาป ➔ มิติบิดเบี้ยว ➔ ระเบิดเวทสีแดง',
  },
  photon: {
    stageCount: 4,
    stages: [
      'Stage 1: ทะยานสู่สภาวะไบนารี่ความเร็วแสง (Binary stellar ascension sweep)',
      'Stage 2: ลำแสงโฟตอนคอสมิกยิงทะลวง (Supersonic photon blast)',
      'Stage 3: ละอองพลาสม่าแผ่ขยาย (Plasma shockwave wash)',
      'Stage 4: โซนิคบูมระเบิดสะท้านอวกาศ (Concussive space sonic boom)',
    ],
    summaryTh: 'ลำแสงโฟตอน 4 สเตจ: ทะยานไบนารี่ ➔ ยิงลำแสงความเร็วแสง ➔ คลื่นพลาสม่า ➔ โซนิคบูม',
  },
  arrow: {
    stageCount: 4,
    stages: [
      'Stage 1: คันศรง้างสายแรงดึงสูง (Bowstring tension creak)',
      'Stage 2: สายธนูดีดปล่อยลูกศรพุ่ง (High-tension release twang)',
      'Stage 3: ลูกศรแหวกอากาศส่งเสียงหวีด (Whistling arrow flight)',
      'Stage 4: หัวลูกศรปักเป้าหมายแม่นยำหนักแน่น (Pinpoint bullseye impact thud)',
    ],
    summaryTh: 'ลูกศรแม่นยำ 4 สเตจ: ง้างสายคันศร ➔ ดีดสายยิง ➔ เสียงศรแหวกอากาศ ➔ ปักเป้าหมาย',
  },
  loki: {
    stageCount: 3,
    stages: [
      'Stage 1: คทาเปล่งแสงอัญมณีสีมรกต (Scepter emerald glow)',
      'Stage 2: มนตราภาพลวงตาสลับตัวเสียงเพี้ยนพริ้ว (Deceptive illusion pitch drift)',
      'Stage 3: ละอองเวทมนตร์ล่องหนแวววาว (Trickster whisper shimmer)',
    ],
    summaryTh: 'มนตราลวงตา 3 สเตจ: คทามรกตเรืองแสง ➔ มนต์ภาพลวงตา ➔ ละอองเวทล่องหน',
  },
  deadpool: {
    stageCount: 3,
    stages: [
      'Stage 1: คมดาบคู่คาตานะชักฟันปะทะ "SHING" (Dual katana clash "SHING")',
      'Stage 2: ขึ้นลำปืนคู่และลั่นไกกระสุนระเบิด (Double pistol cock & gunshots)',
      'Stage 3: ปลอกกระสุนทองเหลืองดีดตกกระทบพื้น (Bouncing spent brass casing)',
    ],
    summaryTh: 'คาตานะ & ปืนคู่ 3 สเตจ: ชักดาบฟัน SHING ➔ ลั่นไกปืนคู่ ➔ ปลอกกระสุนตกกระทบพื้น',
  },
  widow: {
    stageCount: 3,
    stages: [
      'Stage 1: ม้วนตัวยุทธวิธีจู่โจมเงียบ (Tactical combat roll)',
      'Stage 2: กำไล Widow’s Bite ปล่อยกระแสไฟฟ้าช็อต 140Hz (Widow’s Bite 140Hz buzz)',
      'Stage 3: แส้ไฟฟ้าฟาดตวัดเป้าหมาย (Electro-whip snap)',
    ],
    summaryTh: 'ไฟฟ้าช็อตสายลับ 3 สเตจ: ม้วนตัวยุทธวิธี ➔ ปล่อยกระแสไฟช็อต 140Hz ➔ แส้ไฟฟ้าฟาด',
  },
  claw: {
    stageCount: 3,
    stages: [
      'Stage 1: กรงเล็บอดาแมนเทียม 3 นิ้วสไลด์ยื่น "SNIKT" ("SNIKT" 3-claw extension)',
      'Stage 2: สะบัดกรงเล็บเฉือนอากาศฟันตัดไขว้ (Supersonic razor cross-slash)',
      'Stage 3: โลหะอดาแมนเทียมสะท้อนกังวานยาวนาน (Metallic ring sustain)',
    ],
    summaryTh: 'กรงเล็บอดาแมนเทียม 3 สเตจ: เสียงยื่นกรงเล็บ SNIKT ➔ สะบัดฟันตัดไขว้ ➔ กังวานโลหะก้อง',
  },
  magnetic: {
    stageCount: 3,
    stages: [
      'Stage 1: คลื่นแม่เหล็กไฟฟ้าเหนี่ยวนำกระหึ่ม (Electromagnetic induction hum)',
      'Stage 2: แผ่นเหล็กถูกบิดงอและกรีดร้องด้วยแรงดึงดูด (Ferrous metal twisting screech)',
      'Stage 3: ระเบิดคลื่นแม่เหล็กไฟฟ้า EMP Shockwave (EMP shockwave detonation)',
    ],
    summaryTh: 'สนามแม่เหล็ก 3 สเตจ: คลื่นเหนี่ยวนำ ➔ บิดงอแผ่นเหล็ก ➔ ระเบิดคลื่น EMP',
  },
  groot: {
    stageCount: 3,
    stages: [
      'Stage 1: ใยพฤกษาโบราณขยายตัวลั่นเอี๊ยด (Ancient wood fiber creak)',
      'Stage 2: รากไม้ยักษ์ทะลวงแผ่นดินผุดขึ้นมา (Subterranean root eruption crunch)',
      'Stage 3: ไม้โบราณสะท้อนก้องกังวานลึก (Deep timber resonance)',
    ],
    summaryTh: 'รากไม้โบราณ 3 สเตจ: กิ่งก้านลั่นขยาย ➔ รากไม้ทะลวงพื้น ➔ เสียงไม้ก้องสะท้อน',
  },
};

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
