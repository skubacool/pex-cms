import names from '../data/province-names.json';

// Works out which province a project is in from the free-text Location the team already types
// (Thai and English). Addresses are messy, so the rules run from most to least trustworthy:
//   1. "จ.ระนอง" / "จังหวัดราชบุรี" markers       4. a province name anywhere in the English text
//   2. a lone province as the first segment ("นครปฐม, ประเทศไทย")   5. a long Thai province name anywhere
//   3. "Ranong Province" style English markers
// Short names (ตาก, เลย, น่าน ...) are only trusted in rules 1-3: they appear inside road names
// such as ถนนตากสิน, so a bare scan for them would put a pin in the wrong province.

interface Entry {
  id: string;
  en: string;
  th: string;
  thNames: string[];
  enNames: string[];
}

export interface Province {
  id: string;
  en: string;
  th: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const isThai = (s: string) => /[ก-๙]/.test(s);
const len = (s: string) => Array.from(s).length;

const ENTRIES: Entry[] = (
  names as { ne: string; en: string; th: string; aliases: string[] }[]
).map((n) => {
  const all = [n.th, n.en, n.ne, ...n.aliases];
  return {
    id: slug(n.en),
    en: n.en,
    th: n.th,
    thNames: Array.from(new Set(all.filter(isThai))).sort(
      (a, b) => len(b) - len(a)
    ),
    enNames: Array.from(
      new Set(all.filter((x) => !isThai(x)).map((x) => x.toLowerCase()))
    ).sort((a, b) => b.length - a.length),
  };
});

export const PROVINCES: Province[] = ENTRIES.map(({ id, en, th }) => ({
  id,
  en,
  th,
}));

const BY_ID = new Map(ENTRIES.map((e) => [e.id, e]));
export const provinceById = (id: string): Province | undefined => BY_ID.get(id);

const norm = (s: string) =>
  s.normalize('NFC').replace(/[​ ]/g, ' ').replace(/\s+/g, ' ').trim();

// Thai name -> entry, longest names first so "นครนครราชสีมา" wins over a shorter overlap.
const THAI_TABLE = ENTRIES.flatMap((e) =>
  e.thNames.map((n) => ({ n, e }))
).sort((a, b) => len(b.n) - len(a.n));

const stripPrefix = (s: string) =>
  s
    .replace(/^(?:จังหวัด|จ\.)\s*/, '')
    .replace(/[ฯ.]+$/, '')
    .trim();

const byThaiStart = (token: string): Entry | null => {
  const hit = THAI_TABLE.find(({ n }) => token.startsWith(n));
  return hit ? hit.e : null;
};

const byThaiExact = (token: string): Entry | null => {
  const t = stripPrefix(token);
  const hit = THAI_TABLE.find(({ n }) => stripPrefix(n) === t);
  return hit ? hit.e : null;
};

const detectThai = (raw: string): Entry | null => {
  const text = norm(raw);
  if (!text) return null;

  // 1. explicit marker: the last one wins (street names can contain a province word earlier on)
  const markers = Array.from(text.matchAll(/(?:จังหวัด|จ\.)\s*([ก-๙]+)/g));
  for (let i = markers.length - 1; i >= 0; i--) {
    const hit = byThaiStart(markers[i][1]);
    if (hit) return hit;
  }

  // 2. "นครปฐม, ประเทศไทย": a lone province in the first segment
  const first = text.split(',')[0];
  const exact = byThaiExact(first);
  if (exact) return exact;

  // 5. any long name in the text; the one that appears last (closest to the zip code) wins
  let best: { at: number; e: Entry } | null = null;
  for (const { n, e } of THAI_TABLE) {
    if (len(n) < 5) continue;
    const at = text.lastIndexOf(n);
    if (at >= 0 && (!best || at > best.at)) best = { at, e };
  }
  return best ? best.e : null;
};

const detectEnglish = (raw: string): Entry | null => {
  const text = ` ${norm(raw).toLowerCase()} `;
  if (!text.trim()) return null;
  let best: { at: number; len: number; e: Entry } | null = null;
  for (const e of ENTRIES) {
    for (const n of e.enNames) {
      // short names (Nan, Tak, Trat, Loei, Yala) must be followed by "province" to count
      const re =
        n.length <= 4
          ? new RegExp(`[^a-z]${n}\\s+province(?![a-z])`, 'g')
          : new RegExp(
              `[^a-z]${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`,
              'g'
            );
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        const at = m.index;
        if (!best || at > best.at || (at === best.at && n.length > best.len))
          best = { at, len: n.length, e };
      }
    }
  }
  return best ? best.e : null;
};

/** The province id for one project's Location, or null when none is recognised. */
export const detectProvinceId = (
  locationTh?: string | null,
  locationEn?: string | null
): string | null => {
  const th = locationTh ? detectThai(locationTh) : null;
  if (th) return th.id;
  const en = locationEn ? detectEnglish(locationEn) : null;
  if (en) return en.id;
  // last resort: the Thai text is blank/odd but English holds a Thai name, or vice versa
  const mixed = locationEn ? detectThai(locationEn) : null;
  return mixed ? mixed.id : null;
};

export interface LocationRow {
  location_th?: string | null;
  location_en?: string | null;
}

/** Distinct province ids across all projects (rows with no recognised province are skipped). */
export const detectProvinceIds = (rows: LocationRow[]): string[] => {
  const ids = new Set<string>();
  rows.forEach((r) => {
    const id = detectProvinceId(r.location_th, r.location_en);
    if (id) ids.add(id);
  });
  return Array.from(ids);
};
