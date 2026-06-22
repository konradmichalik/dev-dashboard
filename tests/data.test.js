import { describe, it, expect } from 'vitest';
import { groupRepos, filterRepos, DEFAULT_GROUP } from '../src/lib/data.js';

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
