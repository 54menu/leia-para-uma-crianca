// ============================================
// LEIA PARA UMA CRIANÇA — Storage Module
// ============================================

const STORAGE_KEY = 'leia-para-uma-crianca';

const defaultData = {
  favorites: [],
  history: [],
  lastStory: null,
  readingPositions: {},
  theme: 'dark',
  fontSize: 21,
  lineHeight: 1.8,
  volume: 40,
  preferredTrack: 0,
  repeat: true,
  autoPlayAfterInteraction: false
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ...defaultData };
    const result = { ...defaultData, ...data };
    for (const key of ['favorites', 'history']) if (!Array.isArray(result[key])) result[key] = [];
    if (!result.readingPositions || typeof result.readingPositions !== 'object' || Array.isArray(result.readingPositions)) result.readingPositions = {};
    if (!['dark', 'light'].includes(result.theme)) result.theme = defaultData.theme;
    for (const key of ['fontSize', 'lineHeight', 'volume', 'preferredTrack']) {
      if (!Number.isFinite(Number(result[key]))) result[key] = defaultData[key];
    }
    result.fontSize = Math.max(14, Math.min(32, Number(result.fontSize)));
    result.lineHeight = Math.max(1.2, Math.min(2.6, Number(result.lineHeight)));
    result.volume = Math.max(0, Math.min(100, Number(result.volume)));
    result.preferredTrack = Math.max(0, Math.min(4, Math.floor(Number(result.preferredTrack))));
    if (typeof result.repeat !== 'boolean') result.repeat = true;
    return result;
  } catch {
    return { ...defaultData };
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

function get(key) {
  const data = load();
  return data[key] ?? defaultData[key];
}

function set(key, value) {
  const data = load();
  data[key] = value;
  save(data);
}

function reset() {
  save({ ...defaultData });
}

export { load, save, get, set, reset, defaultData };

