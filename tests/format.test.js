import { describe, it, expect } from 'vitest';
import { compactNumber, relativeTime, formatPercent } from '../src/lib/format.js';

describe('compactNumber', () => {
  it('keeps numbers below 1000 verbatim', () => {
    expect(compactNumber(0)).toBe('0');
    expect(compactNumber(999)).toBe('999');
  });

  it('abbreviates thousands and millions', () => {
    expect(compactNumber(1234)).toBe('1.2k');
    expect(compactNumber(1000)).toBe('1k');
    expect(compactNumber(26919)).toBe('26.9k');
    expect(compactNumber(1_000_000)).toBe('1M');
  });

  it('handles missing values', () => {
    expect(compactNumber(null)).toBe('–');
    expect(compactNumber(NaN)).toBe('–');
  });
});

describe('relativeTime', () => {
  const now = new Date('2026-06-22T12:00:00Z');

  it('formats days in German', () => {
    expect(relativeTime('2026-06-20T12:00:00Z', now)).toBe('vor 2 Tagen');
  });

  it('formats hours', () => {
    expect(relativeTime('2026-06-22T09:00:00Z', now)).toBe('vor 3 Stunden');
  });

  it('handles missing/invalid input', () => {
    expect(relativeTime(null, now)).toBe('–');
    expect(relativeTime('not-a-date', now)).toBe('–');
  });
});

describe('formatPercent', () => {
  it('adds sign', () => {
    expect(formatPercent(12)).toBe('+12%');
    expect(formatPercent(-5)).toBe('−5%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('handles missing values', () => {
    expect(formatPercent(null)).toBe('–');
  });
});
