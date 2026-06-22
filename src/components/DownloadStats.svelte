<script>
  import { compactNumber } from '../lib/format.js';
  import { computeTrend } from '../lib/trend.js';
  import Sparkline from './Sparkline.svelte';
  import TrendBadge from './TrendBadge.svelte';

  let { label, total, monthly, months, note = null } = $props();

  const trend = $derived(computeTrend(months?.values));
</script>

<div class="dl">
  <div class="dl__nums">
    <span class="dl__total">{compactNumber(total)}<small>{label}</small></span>
    <span class="dl__sub">{compactNumber(monthly)} / Monat</span>
    {#if note}<span class="dl__sub dl__note">{note}</span>{/if}
    <TrendBadge {trend} />
  </div>
  {#if months?.values?.length}
    <Sparkline labels={months.labels} values={months.values} />
  {/if}
</div>
