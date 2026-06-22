<script>
  import { formatPercent } from '../lib/format.js';

  let { trend } = $props();

  const ICON = { up: '↑', down: '↓', flat: '→' };
  const LABEL = { up: 'steigend', down: 'fallend', flat: 'stabil' };
</script>

{#if trend}
  <span class="trend trend--{trend.direction}">
    <span aria-hidden="true">{ICON[trend.direction]}</span>
    <span>{trend.percent == null ? '–' : formatPercent(trend.percent)}</span>
    <span class="visually-hidden">Download-Trend gegenüber Vormonat: {LABEL[trend.direction]}</span>
  </span>
{/if}
