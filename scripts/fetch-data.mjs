#!/usr/bin/env node
/**
 * fetch-data.mjs — build the dashboard payload public/data.json from a curated
 * repo list, by querying GitHub (issues/PRs/meta) and Packagist (downloads +
 * monthly stats), and self-hosting each project logo into public/logos/.
 *
 * Config source (first match wins):
 *   1. env REPOS_CONFIG  — JSON string (used in CI, kept in a GitHub Secret)
 *   2. ./repos.json      — local, gitignored, for dev runs
 * Format is documented in repos.example.json. Each entry:
 *   { "repo": "owner/name", "group"?: string, "logo"?: url, "packagist"?: "vendor/name" | false }
 *
 * GITHUB_TOKEN (optional locally, provided by Actions) lifts the rate limit and
 * is required for the search endpoint to be reliable.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO_DIR = join(ROOT, 'public', 'logos');
const OUT = join(ROOT, 'public', 'data.json');
const HOMEBREW_URL = 'https://konradmichalik.github.io/homebrew-tap/downloads.json';

const GH_TOKEN = process.env.GITHUB_TOKEN || '';
const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'dev-dashboard',
  ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
};

const CONTENT_TYPE_EXT = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

async function loadConfig() {
  if (process.env.REPOS_CONFIG) {
    try {
      return JSON.parse(process.env.REPOS_CONFIG);
    } catch (err) {
      throw new Error(`REPOS_CONFIG is not valid JSON: ${err.message}`);
    }
  }
  try {
    return JSON.parse(await readFile(join(ROOT, 'repos.json'), 'utf8'));
  } catch {
    throw new Error(
      'No config found. Set the REPOS_CONFIG env var or create ./repos.json (see repos.example.json).',
    );
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRYABLE = new Set([401, 403, 429, 500, 502, 503]);

async function fetchJson(url, headers = {}, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers });
    if (res.ok) return res.json();
    if (attempt >= attempts || !RETRYABLE.has(res.status)) {
      throw new Error(`${res.status} ${res.statusText} — ${url}`);
    }
    await sleep(600 * attempt); // back off transient rate limits
  }
}

async function githubRepo(owner, name) {
  const meta = await fetchJson(`https://api.github.com/repos/${owner}/${name}`, GH_HEADERS);
  const totalOpen = meta.open_issues_count ?? 0; // issues + PRs combined

  // The search endpoint splits PRs out, but is rate-limit sensitive. If it
  // fails we keep the repo and just show the combined count as issues.
  let openPrs = null;
  try {
    const q = encodeURIComponent(`repo:${owner}/${name} type:pr state:open`);
    const prs = await fetchJson(
      `https://api.github.com/search/issues?q=${q}&per_page=1`,
      GH_HEADERS,
    );
    openPrs = prs.total_count ?? 0;
  } catch (err) {
    console.warn(`  ⚠ PR count for ${owner}/${name}: ${err.message}`);
  }

  return {
    description: meta.description || '',
    language: meta.language || null,
    url: meta.html_url,
    stars: meta.stargazers_count ?? 0,
    pushedAt: meta.pushed_at,
    defaultBranch: meta.default_branch || 'main',
    openPrs: openPrs ?? 0,
    openIssues: openPrs === null ? totalOpen : Math.max(0, totalOpen - openPrs),
    avatar: meta.owner?.avatar_url || null,
  };
}

// Common in-repo logo locations, SVG preferred. TYPO3 extensions ship an
// Extension icon; other projects sometimes keep a logo under docs/art/assets.
const LOGO_CANDIDATES = [
  'Resources/Public/Icons/Extension.svg',
  'ext_icon.svg',
  'docs/logo.svg',
  'art/logo.svg',
  'assets/logo.svg',
  '.github/logo.svg',
  'logo.svg',
  'Resources/Public/Icons/Extension.png',
  'ext_icon.png',
  'ext_icon.gif',
];

/** Find a logo committed in the repo; returns a raw URL or null. */
async function detectRepoLogo(owner, name, branch) {
  for (const path of LOGO_CANDIDATES) {
    const url = `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${path}`;
    try {
      const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'dev-dashboard' } });
      if (res.ok) return url;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function monthsAgoISO(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

async function packagist(pkg) {
  const detail = await fetchJson(`https://packagist.org/packages/${pkg}.json`);
  const dl = detail.package?.downloads || {};
  const from = monthsAgoISO(12);
  const stats = await fetchJson(
    `https://packagist.org/packages/${pkg}/stats/all.json?average=monthly&from=${from}`,
  );
  const series = stats.values?.[pkg] ?? Object.values(stats.values || {})[0] ?? [];
  return {
    name: pkg,
    total: dl.total ?? 0,
    monthly: dl.monthly ?? 0,
    daily: dl.daily ?? 0,
    months: { labels: stats.labels ?? [], values: series },
  };
}

/** Homebrew tap download counts, keyed by "owner/repo". Empty map on failure. */
async function fetchHomebrew() {
  try {
    const data = await fetchJson(HOMEBREW_URL);
    return new Map(
      (data.packages || []).map((p) => [
        p.repo,
        {
          total: p.downloads_total ?? 0,
          install: p.downloads_install ?? 0,
          releases: p.releases ?? 0,
        },
      ]),
    );
  } catch (err) {
    console.warn(`⚠ homebrew downloads: ${err.message}`);
    return new Map();
  }
}

async function saveLogo(slug, source) {
  if (!source) return null;
  try {
    const res = await fetch(source, { headers: { 'User-Agent': 'dev-dashboard' } });
    if (!res.ok) throw new Error(`${res.status}`);
    const ext = CONTENT_TYPE_EXT[res.headers.get('content-type')?.split(';')[0]] || 'png';
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(join(LOGO_DIR, `${slug}.${ext}`), buf);
    return `logos/${slug}.${ext}`;
  } catch {
    return null;
  }
}

async function buildRepo(entry, homebrew) {
  const [owner, name] = entry.repo.split('/');
  if (!owner || !name) throw new Error(`Invalid repo "${entry.repo}" (expected owner/name)`);
  const slug = name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const gh = await githubRepo(owner, name);

  let pkg = null;
  if (entry.packagist !== false) {
    const pkgName = typeof entry.packagist === 'string' ? entry.packagist : entry.repo;
    try {
      pkg = await packagist(pkgName);
    } catch (err) {
      console.warn(`  ⚠ packagist ${pkgName}: ${err.message}`);
    }
  }

  const logoSource =
    entry.logo || (await detectRepoLogo(owner, name, gh.defaultBranch)) || gh.avatar;
  const logo = await saveLogo(slug, logoSource);

  return {
    name,
    owner,
    url: gh.url,
    description: gh.description,
    language: gh.language,
    group: entry.group || 'Sonstige',
    logo,
    pushedAt: gh.pushedAt,
    stars: gh.stars,
    openIssues: gh.openIssues,
    openPrs: gh.openPrs,
    packagist: pkg,
    homebrew: homebrew.get(entry.repo) || null,
  };
}

async function main() {
  const config = await loadConfig();
  if (!Array.isArray(config) || config.length === 0) {
    throw new Error('Config must be a non-empty JSON array.');
  }
  await rm(LOGO_DIR, { recursive: true, force: true });
  await mkdir(LOGO_DIR, { recursive: true });
  if (!GH_TOKEN) console.warn('⚠ No GITHUB_TOKEN set — using anonymous rate limits (60/h).');

  const homebrew = await fetchHomebrew();

  const repos = [];
  for (const entry of config) {
    try {
      console.log(`• ${entry.repo}`);
      repos.push(await buildRepo(entry, homebrew));
    } catch (err) {
      console.warn(`  ⚠ skipped ${entry.repo}: ${err.message}`);
    }
    await sleep(200);
  }

  const payload = { generatedAt: new Date().toISOString(), repos };
  await writeFile(OUT, JSON.stringify(payload, null, 2));
  console.log(`\n✓ Wrote ${repos.length}/${config.length} repos → public/data.json`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
