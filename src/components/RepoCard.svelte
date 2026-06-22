<script>
  import { compactNumber, relativeTime } from '../lib/format.js';
  import { computeTrend } from '../lib/trend.js';
  import Sparkline from './Sparkline.svelte';
  import TrendBadge from './TrendBadge.svelte';

  let { repo } = $props();

  const base = import.meta.env.BASE_URL;
  const trend = $derived(repo.packagist ? computeTrend(repo.packagist.months?.values) : null);
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
    <div class="dl">
      <div class="dl__nums">
        <span class="dl__total">
          {compactNumber(repo.packagist.total)}<small>Packagist</small>
        </span>
        <span class="dl__sub">{compactNumber(repo.packagist.monthly)} / Monat</span>
        {#if repo.ter}
          <span class="dl__sub dl__ter">
            TER {compactNumber(repo.ter.downloads)} · {repo.ter.versions} Versionen
          </span>
        {/if}
        <TrendBadge {trend} />
      </div>
      <Sparkline labels={repo.packagist.months.labels} values={repo.packagist.months.values} />
    </div>
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
