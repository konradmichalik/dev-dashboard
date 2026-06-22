/**
 * Download trend from a monthly series: last month vs. the one before.
 * Returns null for an empty series. percent is null when it cannot be
 * computed (single point or a zero previous month). (pure)
 */
export function computeTrend(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  if (values.length === 1) {
    return { direction: 'flat', percent: null, last: values[0], previous: null, delta: 0 };
  }
  const last = values[values.length - 1];
  const previous = values[values.length - 2];
  const delta = last - previous;
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const percent = previous === 0 ? null : Math.round((delta / previous) * 100);
  return { direction, percent, last, previous, delta };
}
