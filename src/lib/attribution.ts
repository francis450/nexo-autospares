// Ad attribution that survives WhatsApp: captured when a visitor lands from an ad, then echoed
// as a short "Ref:" code in every prefilled WhatsApp message so the counter can log the source.

const PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'ttclid',
] as const;

type Touch = Partial<Record<(typeof PARAMS)[number], string>> & { landedAt: string; path: string };

export interface Attribution {
  first: Touch;
  last: Touch;
}

const STORAGE_KEY = 'nexo_attribution';

const SOURCE_CODES: Record<string, string> = {
  facebook: 'FB',
  fb: 'FB',
  instagram: 'IG',
  ig: 'IG',
  tiktok: 'TT',
  google: 'GG',
  whatsapp: 'WA',
  youtube: 'YT',
};

export function getAttribution(): Attribution | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/** Call once on page load. Keeps the first ad touch and overwrites the last one. */
export function captureAttribution(): void {
  const params = new URLSearchParams(window.location.search);
  const touch: Touch = { landedAt: new Date().toISOString(), path: window.location.pathname };
  let found = false;
  for (const key of PARAMS) {
    const value = params.get(key);
    if (value) {
      touch[key] = value.slice(0, 100);
      found = true;
    }
  }
  if (!found) return;

  const previous = getAttribution();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ first: previous?.first ?? touch, last: touch }));
  } catch {
    // Storage blocked (private mode): the ref code is simply omitted.
  }
}

/** e.g. "FB-HARRIERLENS-0925" (source, campaign, landing date). Null for organic visitors. */
export function getRefCode(): string | null {
  const last = getAttribution()?.last;
  if (!last) return null;

  const rawSource = last.utm_source?.toLowerCase() ?? '';
  const source =
    SOURCE_CODES[rawSource] ??
    (rawSource.replace(/[^a-z0-9]/g, '').slice(0, 4).toUpperCase() ||
      (last.fbclid ? 'FB' : last.gclid ? 'GG' : last.ttclid ? 'TT' : 'AD'));
  const campaign = last.utm_campaign?.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 12);
  const landed = new Date(last.landedAt);
  const mmdd = `${String(landed.getMonth() + 1).padStart(2, '0')}${String(landed.getDate()).padStart(2, '0')}`;

  return [source, campaign, mmdd].filter(Boolean).join('-');
}
