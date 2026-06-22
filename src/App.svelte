<script>
  import { onMount } from 'svelte';
  import { loadData, groupRepos, filterRepos } from './lib/data.js';
  import { relativeTime } from './lib/format.js';
  import RepoGroup from './components/RepoGroup.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';

  let status = $state('loading');
  let data = $state(null);
  let error = $state('');
  let query = $state('');

  const groups = $derived(data ? groupRepos(filterRepos(data.repos, query)) : []);

  onMount(async () => {
    try {
      data = await loadData(import.meta.env.BASE_URL);
      status = 'ready';
    } catch (e) {
      error = e.message;
      status = 'error';
    }
  });
</script>

<main>
  <header class="page-head">
    <div class="page-head__title">
      <h1>Dev Dashboard</h1>
      {#if data}
        <p class="updated">zuletzt aktualisiert {relativeTime(data.generatedAt)}</p>
      {/if}
    </div>
    <div class="page-head__actions">
      {#if status === 'ready'}
        <div class="search">
          <label class="visually-hidden" for="repo-search">Repositories durchsuchen</label>
          <input
            id="repo-search"
            type="search"
            placeholder="Suchen … (Name, Sprache, Gruppe)"
            bind:value={query}
            autocomplete="off"
          />
        </div>
      {/if}
      <ThemeToggle />
    </div>
  </header>

  {#if status === 'loading'}
    <p class="status">Lade Daten …</p>
  {:else if status === 'error'}
    <p class="status status--error" role="alert">Fehler: {error}</p>
  {:else if data.repos.length === 0}
    <p class="status">Keine Repositories konfiguriert.</p>
  {:else if groups.length === 0}
    <p class="status">Keine Treffer für „{query}“.</p>
  {:else}
    {#each groups as group (group.name)}
      <RepoGroup name={group.name} repos={group.repos} />
    {/each}
  {/if}
</main>
