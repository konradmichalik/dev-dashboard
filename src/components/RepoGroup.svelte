<script>
  import RepoCard from './RepoCard.svelte';

  let { name, repos } = $props();
</script>

<section class="group">
  <h2 class="group__title">
    {name}
    <span class="group__count">{repos.length}</span>
  </h2>
  <div class="group__grid">
    {#each repos as repo (repo.name)}
      <RepoCard {repo} />
    {/each}
  </div>
</section>
