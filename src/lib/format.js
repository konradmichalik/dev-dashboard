const TIERS = ['', 'k', 'M', 'B'];

/** 1234 -> "1.2k". Numbers below 1000 stay verbatim. (pure) */
export function compactNumber(n) {
  if (n == null || Number.isNaN(n)) return '–';
  const abs = Math.abs(n);
  if (abs < 1000) return String(n);
  const tier = Math.min(Math.floor(Math.log10(abs) / 3), TIERS.length - 1);
  const scaled = n / 1000 ** tier;
  const rounded = Math.abs(scaled) >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  return `${rounded}${TIERS[tier]}`;
}

const UNITS = [
  { limit: 60, unit: 'second', span: 1 },
  { limit: 3600, unit: 'minute', span: 60 },
  { limit: 86400, unit: 'hour', span: 3600 },
  { limit: 86400 * 7, unit: 'day', span: 86400 },
  { limit: 86400 * 30, unit: 'week', span: 86400 * 7 },
  { limit: 86400 * 365, unit: 'month', span: 86400 * 30 },
  { limit: Infinity, unit: 'year', span: 86400 * 365 },
];

/** Localized "vor 3 Tagen" relative time. `now` is injectable for testing. (pure) */
export function relativeTime(iso, now = new Date()) {
  if (!iso) return '–';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '–';
  const nowMs = now instanceof Date ? now.getTime() : now;
  const diffSec = (nowMs - then) / 1000;
  const abs = Math.abs(diffSec);
  const { unit, span } = UNITS.find((u) => abs < u.limit) ?? UNITS[UNITS.length - 1];
  const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'always' });
  return rtf.format(Math.round(-diffSec / span), unit);
}

/** Signed percentage like "+12%" / "−5%" (true minus sign). (pure) */
export function formatPercent(n) {
  if (n == null || Number.isNaN(n)) return '–';
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${Math.abs(Math.round(n))}%`;
}
