<script>
  import { compactNumber, relativeTime } from '../lib/format.js';
  import DownloadStats from './DownloadStats.svelte';

  let { repo } = $props();

  const base = import.meta.env.BASE_URL;
  const terNote = $derived(
    repo.ter ? `TER ${compactNumber(repo.ter.downloads)} · ${repo.ter.versions} Versionen` : null,
  );
</script>

<article class="card">
  <header class="card__head">
    {#if repo.logo}
      <img class="card__logo" src={base + repo.logo} alt="" loading="lazy" width="40" height="40" />
    {:else}
      <div class="card__logo card__logo--ph" aria-hidden="true">
        {repo.name.charAt(0).toUpperCase()}
      </div>
    {/if}
    <div class="card__title">
      <h3>
        <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
      </h3>
      {#if repo.language}<span class="card__lang">{repo.language}</span>{/if}
    </div>
  </header>

  {#if repo.description}
    <p class="card__desc">{repo.description}</p>
  {/if}

  <div class="card__meta">
    <a class="badge" href={`${repo.url}/issues`} target="_blank" rel="noopener noreferrer">
      <span class="badge__n">{repo.openIssues}</span> Issues
    </a>
    <a class="badge" href={`${repo.url}/pulls`} target="_blank" rel="noopener noreferrer">
      <span class="badge__n">{repo.openPrs}</span> PRs
    </a>
    <span class="badge badge--muted" title="Stars">★ {repo.stars}</span>
  </div>
  <span class="card__updated">aktualisiert {relativeTime(repo.pushedAt)}</span>

  {#if repo.packagist}
    <DownloadStats
      label="Packagist"
      total={repo.packagist.total}
      monthly={repo.packagist.monthly}
      months={repo.packagist.months}
      note={terNote}
    />
  {/if}

  {#if repo.npm}
    <DownloadStats
      label="npm"
      total={repo.npm.total}
      monthly={repo.npm.monthly}
      months={repo.npm.months}
    />
  {/if}

  {#if repo.pypi}
    <DownloadStats
      label="PyPI"
      total={repo.pypi.total}
      monthly={repo.pypi.monthly}
      months={repo.pypi.months}
    />
  {/if}

  {#if repo.homebrew}
    <div class="dl dl--brew">
      <div class="dl__nums">
        <span class="dl__total">
          {compactNumber(repo.homebrew.total)}<small>🍺 Homebrew</small>
        </span>
        <span class="dl__sub">
          {compactNumber(repo.homebrew.install)} Installs · {repo.homebrew.releases} Releases
        </span>
      </div>
    </div>
  {/if}
</article>
