export const DEFAULT_GROUP = 'Sonstige';

/** Bucket repos by their `group`, preserving first-seen group order. (pure) */
export function groupRepos(repos = []) {
  const order = [];
  const buckets = new Map();
  for (const repo of repos) {
    const group = repo.group || DEFAULT_GROUP;
    if (!buckets.has(group)) {
      buckets.set(group, []);
      order.push(group);
    }
    buckets.get(group).push(repo);
  }
  return order.map((name) => ({ name, repos: buckets.get(name) }));
}

/** Case-insensitive filter over name, description, language and group. (pure) */
export function filterRepos(repos = [], query = '') {
  const q = query.trim().toLowerCase();
  if (!q) return repos;
  return repos.filter((repo) =>
    [repo.name, repo.description, repo.language, repo.group]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q)),
  );
}

/** Sum of downloads across all registries for a repo. (pure) */
export function totalDownloads(repo) {
  return (
    (repo.packagist?.total ?? 0) +
    (repo.npm?.total ?? 0) +
    (repo.pypi?.total ?? 0) +
    (repo.ter?.downloads ?? 0) +
    (repo.homebrew?.total ?? 0)
  );
}

export const SORT_OPTIONS = [
  { key: 'downloads', label: 'Downloads' },
  { key: 'stars', label: 'Stars' },
  { key: 'updated', label: 'Zuletzt aktualisiert' },
  { key: 'name', label: 'Name' },
];

const SORTERS = {
  downloads: (a, b) => totalDownloads(b) - totalDownloads(a),
  stars: (a, b) => (b.stars ?? 0) - (a.stars ?? 0),
  updated: (a, b) => new Date(b.pushedAt ?? 0) - new Date(a.pushedAt ?? 0),
  name: (a, b) => a.name.localeCompare(b.name),
};

/** Sort repos by the given key (see SORT_OPTIONS); unknown keys leave order untouched. (pure) */
export function sortRepos(repos = [], sortBy = 'downloads') {
  const sorter = SORTERS[sortBy];
  return sorter ? [...repos].sort(sorter) : repos;
}

/** Load the generated dashboard payload, base-path aware for GitHub Pages. */
export async function loadData(baseUrl = '/', fetchFn = fetch) {
  const res = await fetchFn(`${baseUrl}data.json`);
  if (!res.ok) throw new Error(`Konnte data.json nicht laden (${res.status})`);
  return res.json();
}
