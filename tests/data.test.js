import { describe, it, expect } from 'vitest';
import {
  groupRepos,
  filterRepos,
  sortRepos,
  totalDownloads,
  DEFAULT_GROUP,
} from '../src/lib/data.js';

describe('groupRepos', () => {
  it('groups by the group field, preserving first-seen order', () => {
    const groups = groupRepos([
      { name: 'a', group: 'TYPO3' },
      { name: 'b', group: 'PHP Tools' },
      { name: 'c', group: 'TYPO3' },
    ]);
    expect(groups.map((g) => g.name)).toEqual(['TYPO3', 'PHP Tools']);
    expect(groups[0].repos.map((r) => r.name)).toEqual(['a', 'c']);
  });

  it('falls back to a default group when none is set', () => {
    const groups = groupRepos([{ name: 'a' }]);
    expect(groups[0].name).toBe(DEFAULT_GROUP);
  });

  it('handles empty input', () => {
    expect(groupRepos([])).toEqual([]);
    expect(groupRepos()).toEqual([]);
  });
});

describe('filterRepos', () => {
  const repos = [
    { name: 'typo3-request-profiler', description: 'Profiling', language: 'PHP', group: 'TYPO3' },
    {
      name: 'video-killed-the-radio-star',
      description: 'Retro TV',
      language: 'Svelte',
      group: 'Apps',
    },
  ];

  it('returns everything for an empty query', () => {
    expect(filterRepos(repos, '')).toHaveLength(2);
    expect(filterRepos(repos)).toHaveLength(2);
  });

  it('matches name case-insensitively', () => {
    expect(filterRepos(repos, 'TYPO3').map((r) => r.name)).toEqual(['typo3-request-profiler']);
  });

  it('matches description, language and group', () => {
    expect(filterRepos(repos, 'retro')).toHaveLength(1);
    expect(filterRepos(repos, 'svelte')).toHaveLength(1);
    expect(filterRepos(repos, 'apps')).toHaveLength(1);
  });

  it('returns nothing when there is no match', () => {
    expect(filterRepos(repos, 'zzz')).toEqual([]);
  });
});

describe('totalDownloads', () => {
  it('sums downloads across all registries', () => {
    const repo = {
      packagist: { total: 100 },
      npm: { total: 50 },
      pypi: { total: 25 },
      ter: { downloads: 10 },
      homebrew: { total: 5 },
    };
    expect(totalDownloads(repo)).toBe(190);
  });

  it('treats missing registries as zero', () => {
    expect(totalDownloads({})).toBe(0);
  });
});

describe('sortRepos', () => {
  const repos = [
    { name: 'b', stars: 5, pushedAt: '2026-01-01', packagist: { total: 10 } },
    { name: 'a', stars: 20, pushedAt: '2026-03-01', packagist: { total: 100 } },
    { name: 'c', stars: 1, pushedAt: '2026-02-01', packagist: { total: 50 } },
  ];

  it('sorts by total downloads descending (default)', () => {
    expect(sortRepos(repos).map((r) => r.name)).toEqual(['a', 'c', 'b']);
  });

  it('sorts by stars descending', () => {
    expect(sortRepos(repos, 'stars').map((r) => r.name)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by last updated descending', () => {
    expect(sortRepos(repos, 'updated').map((r) => r.name)).toEqual(['a', 'c', 'b']);
  });

  it('sorts by name ascending', () => {
    expect(sortRepos(repos, 'name').map((r) => r.name)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input array', () => {
    const copy = [...repos];
    sortRepos(repos, 'name');
    expect(repos).toEqual(copy);
  });

  it('leaves order untouched for an unknown key', () => {
    expect(sortRepos(repos, 'bogus')).toBe(repos);
  });
});
