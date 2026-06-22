import { describe, it, expect } from 'vitest';
import { computeTrend } from '../src/lib/trend.js';

describe('computeTrend', () => {
  it('returns null for empty input', () => {
    expect(computeTrend([])).toBeNull();
    expect(computeTrend(undefined)).toBeNull();
  });

  it('flags a rising trend with percent', () => {
    expect(computeTrend([100, 150])).toMatchObject({ direction: 'up', percent: 50 });
  });

  it('flags a falling trend', () => {
    expect(computeTrend([200, 150])).toMatchObject({ direction: 'down', percent: -25 });
  });

  it('flags a flat trend', () => {
    expect(computeTrend([100, 100])).toMatchObject({ direction: 'flat', percent: 0 });
  });

  it('uses the last two months of a longer series', () => {
    expect(computeTrend([10, 20, 40, 80, 80])).toMatchObject({ direction: 'flat' });
  });

  it('cannot compute a percent when the previous month was zero', () => {
    expect(computeTrend([0, 42])).toMatchObject({ direction: 'up', percent: null });
  });

  it('treats a single data point as flat', () => {
    expect(computeTrend([7])).toMatchObject({ direction: 'flat', percent: null });
  });
});
