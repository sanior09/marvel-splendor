// ============================================================
//  marvelMaps.ts — Marvel Universe Battlefield Map Registry
// ============================================================

export interface MarvelMapDefinition {
  id: string;
  name: string;
  nameEn: string;
  subtitle: string;
  realm: string;
  icon: string;
  badgeColor: string;
  accentBorder: string;
  /** Background gradient styling for the game board fallback */
  bgStyle: string;
  /** Ambient lighting / particle hint color */
  ambientColor: string;
  description: string;
  /** High-resolution Marvel background wallpaper URL */
  imageUrl: string;
}

export const MARVEL_MAPS: MarvelMapDefinition[] = [
  {
    id: 'asgard',
    name: 'แอสการ์ด (สะพานไบฟรอสต์)',
    nameEn: 'Realm of Asgard',
    subtitle: 'Golden Palace & Bifrost Bridge',
    realm: 'Nine Realms • Cosmic',
    icon: '⚡',
    badgeColor: 'from-yellow-400 to-amber-700',
    accentBorder: 'border-yellow-400/50',
    ambientColor: '#eab308',
    imageUrl: '/images/maps/asgard.jpg?v=5',
    description: 'อาณาจักรแห่งทวยเทพ พระราชวังทองคำอร่าม แสงละอองดวงดาวไบฟรอสต์ประกายรุ้ง',
    bgStyle: `
      radial-gradient(ellipse at 50% 0%, rgba(234, 179, 8, 0.22) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 85%, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 15% 75%, rgba(56, 189, 248, 0.12) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 50%, #1c1408 0%, #070503 100%)
    `,
  },
  {
    id: 'avengers_tower',
    name: 'อเวนเจอร์ส ทาวเวอร์',
    nameEn: 'Avengers Tower',
    subtitle: 'Stark Tech & New York Skyline',
    realm: 'Midgard • Earth',
    icon: '🏢',
    badgeColor: 'from-cyan-500 to-blue-700',
    accentBorder: 'border-cyan-400/50',
    ambientColor: '#0ea5e9',
    imageUrl: '/images/maps/avengers_tower.jpg?v=6',
    description: 'ศูนย์บัญชาการสตาร์ค ทิวทัศน์มหานครนิวยอร์ก เทคโนโลยีโฮโลกราฟิกสีฟ้าล้ำยุค',
    bgStyle: `
      radial-gradient(ellipse at 15% 15%, rgba(6, 182, 212, 0.18) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 25%, rgba(59, 130, 246, 0.14) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 85%, rgba(30, 58, 138, 0.22) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 50%, #081226 0%, #030712 100%)
    `,
  },
  {
    id: 'wakanda',
    name: 'วากานด้า (โกลเด้นซิตี้)',
    nameEn: 'Kingdom of Wakanda',
    subtitle: 'Golden City & Mount Bashenga',
    realm: 'Africa • Earth',
    icon: '🐆',
    badgeColor: 'from-amber-500 to-purple-800',
    accentBorder: 'border-amber-400/50',
    ambientColor: '#f59e0b',
    imageUrl: '/images/maps/wakanda.jpg?v=5',
    description: 'มหานครแห่งไวเบรเนียม พระอาทิตย์ตกสีทองอร่าม ผสานพลังงานไวโอเล็ตศักดิ์สิทธิ์',
    bgStyle: `
      radial-gradient(ellipse at 25% 10%, rgba(245, 158, 11, 0.18) 0%, transparent 45%),
      radial-gradient(ellipse at 80% 80%, rgba(147, 51, 234, 0.18) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(120, 53, 15, 0.15) 0%, transparent 65%),
      radial-gradient(ellipse at 50% 50%, #150d1e 0%, #06040a 100%)
    `,
  },
  {
    id: 'sanctum',
    name: 'แซงค์ทัม แซงค์โทรัม',
    nameEn: 'Sanctum Sanctorum',
    subtitle: 'Mirror Dimension & Kamar-Taj',
    realm: 'Mystic Arts • Multiverse',
    icon: '🔮',
    badgeColor: 'from-orange-500 to-emerald-700',
    accentBorder: 'border-orange-400/50',
    ambientColor: '#ea580c',
    imageUrl: '/images/maps/sanctum.jpg?v=5',
    description: 'วิหารจอมเวทย์ สัญลักษณ์หน้าต่างวิเศษ อักขระรูนเวทมนตร์และประกายไฟพอร์ทัลสีส้มทอง',
    bgStyle: `
      radial-gradient(ellipse at 20% 20%, rgba(234, 88, 12, 0.20) 0%, transparent 45%),
      radial-gradient(ellipse at 80% 30%, rgba(16, 185, 129, 0.14) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 90%, rgba(180, 83, 9, 0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 50%, #1b0e06 0%, #070402 100%)
    `,
  },
  {
    id: 'knowhere',
    name: 'โนแวร์ (กะโหลกเซเลสเชียล)',
    nameEn: 'Knowhere',
    subtitle: 'Mining Colony of the Celestials',
    realm: 'Deep Space • Cosmic Void',
    icon: '🪐',
    badgeColor: 'from-fuchsia-600 to-purple-900',
    accentBorder: 'border-fuchsia-400/50',
    ambientColor: '#d946ef',
    imageUrl: '/images/maps/knowhere.jpg?v=5',
    description: 'สถานีเหมืองอวกาศในหัวกะโหลกสิ่งมีชีวิตโบราณ เนบิวลาสีม่วง-ชมพูคอสมิกสุดตระการตา',
    bgStyle: `
      radial-gradient(ellipse at 75% 20%, rgba(217, 70, 239, 0.20) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 70%, rgba(147, 51, 234, 0.18) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 40%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 50%, #170924 0%, #06020a 100%)
    `,
  },
  {
    id: 'quantum_realm',
    name: 'มิติควอนตัม (ซับอะตอมิค)',
    nameEn: 'Quantum Realm',
    subtitle: 'Subatomic Void & Time Vortex',
    realm: 'Microverse • Quantum',
    icon: '⚛️',
    badgeColor: 'from-emerald-500 to-cyan-700',
    accentBorder: 'border-emerald-400/50',
    ambientColor: '#10b981',
    imageUrl: '/images/maps/quantum_realm.jpg?v=5',
    description: 'มิติหลุดโลกต่ำกว่าระดับปรมาณู วังวนกระแสเวลาและละอองอนุภาคเรืองแสงสีเขียวมรกต',
    bgStyle: `
      radial-gradient(ellipse at 20% 20%, rgba(16, 185, 129, 0.18) 0%, transparent 45%),
      radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.18) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 85%, rgba(13, 148, 136, 0.16) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 50%, #061917 0%, #020908 100%)
    `,
  },
];

export const DEFAULT_MAP_ID = 'asgard';

export function getMarvelMap(mapId?: string | null): MarvelMapDefinition {
  const found = MARVEL_MAPS.find((m) => m.id === mapId);
  return found ?? MARVEL_MAPS[0]!;
}
