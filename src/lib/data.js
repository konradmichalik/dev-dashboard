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

/** Load the generated dashboard payload, base-path aware for GitHub Pages. */
export async function loadData(baseUrl = '/', fetchFn = fetch) {
  const res = await fetchFn(`${baseUrl}data.json`);
  if (!res.ok) throw new Error(`Konnte data.json nicht laden (${res.status})`);
  return res.json();
}
