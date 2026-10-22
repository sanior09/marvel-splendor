// ============================================================
//  ranks.ts — Marvel Splendor Rank System & Progression Definitions
// ============================================================

export interface RankDef {
  name: string;
  nameEn: string;
  minXP: number;
  icon: string;
  color: string;
  description: string;
  isOwner?: boolean;
}

export const GAME_RANKS: RankDef[] = [
  {
    name: 'นักสู้ใหม่',
    nameEn: 'Recruit',
    minXP: 0,
    icon: '🥉',
    color: '#cd7f32',
    description: 'ผู้เริ่มต้นเข้าสู่สังเวียนมาร์เวล',
  },
  {
    name: 'เจ้าหน้าที่ S.H.I.E.L.D.',
    nameEn: 'S.H.I.E.L.D. Agent',
    minXP: 300,
    icon: '🥈',
    color: '#94a3b8',
    description: 'เจ้าหน้าที่ภาคสนามสังกัดหน่วยชีลด์',
  },
  {
    name: 'ซูเปอร์โซลเยอร์',
    nameEn: 'Super Soldier',
    minXP: 800,
    icon: '🛡️',
    color: '#38bdf8',
    description: 'นักรบพลังเหนือมนุษย์ผู้มีวินัยและไหวพริบ',
  },
  {
    name: 'อเวนเจอร์',
    nameEn: 'Avenger',
    minXP: 1800,
    icon: '🥇',
    color: '#ffd700',
    description: 'สมาชิกแถวหน้าแห่งทีมซูเปอร์ฮีโร่อเวนเจอร์ส',
  },
  {
    name: 'ผู้พิทักษ์กาแล็กซี',
    nameEn: 'Guardian',
    minXP: 3500,
    icon: '💎',
    color: '#a855f7',
    description: 'ผู้ปกป้องดวงดาวและความสงบสุขแห่งกาแล็กซี',
  },
  {
    name: 'จอมเวทสูงสุด',
    nameEn: 'Sorcerer Supreme',
    minXP: 6500,
    icon: '🌌',
    color: '#06b6d4',
    description: 'ผู้รอบรู้ศาสตร์ลี้ลับและมิติคู่ขนาน',
  },
  {
    name: 'ผู้ถือครองอินฟินิตี้',
    nameEn: 'Infinity Wielder',
    minXP: 12000,
    icon: '🔥',
    color: '#ff6a00',
    description: 'ผู้ครอบครองพลังอัญมณีอินฟินิตี้ระดับคอสมิก',
  },
  {
    name: 'THE ONE ABOVE ALL',
    nameEn: 'The One Above All',
    minXP: 50000,
    icon: '👑',
    color: '#ffd700',
    description: 'พระผู้สร้างสูงสุดแห่งจักรวาลมาร์เวล (MAX RANK)',
    isOwner: true,
  },
];

export const XP_GAIN_RULES = [
  { label: 'เล่นจบเกม', xp: '+50 EXP', icon: '🎮' },
  { label: 'ชนะอันดับที่ 1', xp: '+150 EXP', icon: '🏆' },
  { label: 'ซื้อการ์ด Tier 3', xp: '+15 EXP', icon: '⭐' },
  { label: 'เชิญการ์เดียน', xp: '+25 EXP', icon: '✨' },
];
