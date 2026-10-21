// ============================================================
//  avatarUtils.ts — Marvel Hero Avatar Resolution & Fallbacks
// ============================================================

import marvelAvatarsData from '../data/marvelAvatarsData.json';

const avatarMap = marvelAvatarsData as Record<string, string>;

/**
 * Standard Marvel character keyword mappings to avatar keys
 */
const CHARACTER_KEY_MAP: Record<string, string> = {
  doom: 'doctor_doom',
  doctor_doom: 'doctor_doom',
  'dr. doom': 'doctor_doom',
  'dr doom': 'doctor_doom',
  loki: 'loki',
  thanos: 'thanos',
  stark: 'iron_man',
  iron: 'iron_man',
  iron_man: 'iron_man',
  tony: 'iron_man',
  spid: 'spider_man',
  spider: 'spider_man',
  spider_man: 'spider_man',
  peter: 'spider_man',
  thor: 'thor',
  odinson: 'thor',
  hulk: 'hulk',
  banner: 'hulk',
  cap: 'captain_america',
  captain_america: 'captain_america',
  america: 'captain_america',
  steve: 'captain_america',
  rogers: 'captain_america',
  deadpool: 'deadpool',
  wade: 'deadpool',
  wolv: 'wolverine',
  wolverine: 'wolverine',
  logan: 'wolverine',
  strange: 'doctor_strange',
  doctor_strange: 'doctor_strange',
  'dr. strange': 'doctor_strange',
  'dr strange': 'doctor_strange',
  stephen: 'doctor_strange',
  panther: 'black_panther',
  black_panther: 'black_panther',
  wakanda: 'black_panther',
  tchalla: 'black_panther',
  vision: 'vision',
  jarvis: 'vision',
  'j.a.r.v.i.s.': 'vision',
  ultron: 'vision',
  witch: 'scarlet_witch',
  scarlet_witch: 'scarlet_witch',
  wanda: 'scarlet_witch',
  groot: 'groot',
  rocket: 'rocket',
  raccoon: 'rocket',
  widow: 'black_widow',
  black_widow: 'black_widow',
  natasha: 'black_widow',
  hawkeye: 'hawkeye',
  clint: 'hawkeye',
  barton: 'hawkeye',
  ant: 'ant_man',
  ant_man: 'ant_man',
  scott: 'ant_man',
  war_machine: 'war_machine',
  'war machine': 'war_machine',
  rhodey: 'war_machine',
  captain_marvel: 'captain_marvel',
  'captain marvel': 'captain_marvel',
  danvers: 'captain_marvel',
  carol: 'captain_marvel',
};

/**
 * Resolves an avatar URL or character name to a valid Base64 avatar data URI.
 * Guarantees that Marvel character presets never fail or fall back to broken URLs.
 */
export const resolveMarvelAvatar = (
  nameOrKey?: string,
  currentAvatarUrl?: string,
): string | undefined => {
  // 1. If a valid inline data URI is already provided, use it directly
  if (currentAvatarUrl && currentAvatarUrl.startsWith('data:image')) {
    return currentAvatarUrl;
  }

  // 2. If an HTTP(S) URL is provided (e.g., custom web avatar)
  if (currentAvatarUrl && currentAvatarUrl.startsWith('http')) {
    return currentAvatarUrl;
  }

  // 3. Match by character name keywords if name is provided
  const target = (nameOrKey || '').toLowerCase();
  for (const [kw, avatarKey] of Object.entries(CHARACTER_KEY_MAP)) {
    if (target.includes(kw) && avatarMap[avatarKey]) {
      return avatarMap[avatarKey];
    }
  }

  // 4. If a direct key exists in marvelAvatarsData
  if (currentAvatarUrl && avatarMap[currentAvatarUrl]) {
    return avatarMap[currentAvatarUrl];
  }
  if (nameOrKey && avatarMap[nameOrKey]) {
    return avatarMap[nameOrKey];
  }

  // 5. If currentAvatarUrl is a legacy path like '/images/avatars/doctor_doom.jpg'
  if (currentAvatarUrl && currentAvatarUrl.includes('/images/avatars/')) {
    const filename = currentAvatarUrl.split('/').pop()?.replace(/\.(jpg|png|webp|jpeg)$/i, '') || '';
    if (avatarMap[filename]) return avatarMap[filename];
    if (CHARACTER_KEY_MAP[filename] && avatarMap[CHARACTER_KEY_MAP[filename]]) {
      return avatarMap[CHARACTER_KEY_MAP[filename]];
    }
  }

  return undefined;
};

/**
 * Fallback emoji matching for characters
 */
export const getMarvelFallbackEmoji = (name?: string, isBot = false): string => {
  if (!name) return isBot ? '🤖' : '🦸';
  const lower = name.toLowerCase();
  if (lower.includes('doom')) return '👑';
  if (lower.includes('loki')) return '🐍';
  if (lower.includes('thanos')) return '🧤';
  if (lower.includes('iron') || lower.includes('stark')) return '🦾';
  if (lower.includes('spider')) return '🕷️';
  if (lower.includes('thor')) return '⚡';
  if (lower.includes('hulk')) return '💚';
  if (lower.includes('cap') || lower.includes('america')) return '🛡️';
  if (lower.includes('deadpool')) return '⚔️';
  if (lower.includes('wolv')) return '🐺';
  if (lower.includes('strange')) return '✨';
  if (lower.includes('panther')) return '🐾';
  if (lower.includes('vision') || lower.includes('jarvis')) return '🤖';
  if (lower.includes('witch') || lower.includes('wanda')) return '🔮';
  if (lower.includes('groot')) return '🌳';
  if (lower.includes('rocket')) return '🦝';
  if (lower.includes('widow')) return '🕸️';
  if (lower.includes('hawkeye')) return '🎯';
  if (lower.includes('ant')) return '🐜';
  if (lower.includes('machine')) return '⚙️';
  if (lower.includes('marvel')) return '⭐';
  return isBot ? '🤖' : name.charAt(0).toUpperCase();
};
