<div align="center">

# Dev Dashboard

</div>

A lean, static dashboard for selected GitHub repos — open issues & PRs, last update,
Packagist downloads, download trend and a per-package monthly graph.

> [!IMPORTANT]
> This package is intended for use in my personal projects only. It is not designed for general use.

## Configuration

The curated repo list lives in the **GitHub secret `REPOS_CONFIG`** (JSON) — so the
project stays forkable without committing your own list. See [`repos.example.json`](./repos.example.json) for the format:

```json
[
  { "repo": "owner/name", "group": "TYPO3", "logo": "https://…/logo.svg" },
  { "repo": "owner/app", "packagist": false }
]
```

## Development

```bash
npm install
cp repos.example.json repos.json            # local config (gitignored)
GITHUB_TOKEN=$(gh auth token) npm run fetch  # creates public/data.json + public/logos/
npm run dev                                  # http://localhost:5174
```

## Quality

```bash
npm run lint && npm run check && npm test && npm run build
```
