# Dev Dashboard

Ein schlankes, statisches Dashboard, das ausgewählte GitHub-Repos zeigt — mit offenen
**Issues & PRs**, letzter Aktualisierung, **Packagist-Downloads**, Download-**Trend** und
einem **Monats-Graphen** je Paket. Repos lassen sich **thematisch gruppieren** und mit
**Logos** versehen.

Vite + Svelte 5. Kein Backend: Ein Node-Script holt die Daten und schreibt eine statische
`public/data.json`; eine GitHub Action aktualisiert sie **stündlich** und deployt auf GitHub Pages.

## Konfiguration

Die kuratierte Repo-Liste liegt im **GitHub Secret `REPOS_CONFIG`** (JSON) — so bleibt das
Projekt forkbar, ohne die eigene Liste zu committen. Format siehe [`repos.example.json`](./repos.example.json):

```json
[
  { "repo": "owner/name", "group": "TYPO3", "logo": "https://…/logo.svg" },
  { "repo": "owner/app", "packagist": false }
]
```

- `repo` — `owner/name` (Pflicht)
- `group` — Gruppen-Überschrift (Default: `Sonstige`)
- `logo` — Bild-URL; fehlt → GitHub-Owner-Avatar. Logos werden beim Build **lokal gespeichert** (kein externer Request zur Laufzeit).
- `packagist` — Paketname; fehlt → wie `repo`; `false` → kein Download-Block.

## Entwicklung

```bash
npm install
cp repos.example.json repos.json            # lokale Config (gitignored)
GITHUB_TOKEN=$(gh auth token) npm run fetch  # erzeugt public/data.json + public/logos/
npm run dev                                  # http://localhost:5174
```

## Qualität

```bash
npm run lint && npm run check && npm test && npm run build
```

## Deployment (GitHub Pages)

1. Repo nach GitHub pushen, Pages-Source auf **GitHub Actions** stellen.
2. Secret setzen: `gh secret set REPOS_CONFIG < repos.json`
3. Die Action `Build & Deploy` läuft bei jedem Push, stündlich per Cron und manuell (`workflow_dispatch`).
