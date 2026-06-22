<script>
  let { labels = [], values = [] } = $props();

  const W = 120;
  const H = 40;
  const GAP = 2;

  let hovered = $state(null);

  const max = $derived(Math.max(1, ...values));
  const barWidth = $derived(values.length ? (W - GAP * (values.length - 1)) / values.length : 0);
  const total = $derived(values.reduce((sum, v) => sum + v, 0));
  const summary = $derived(
    `Monatliche Downloads der letzten ${values.length} Monate, insgesamt ${total}.`,
  );

  const monthName = (label) => {
    if (!label) return '';
    const [y, m] = label.split('-');
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
    return new Intl.DateTimeFormat('de', { month: 'short', year: 'numeric' }).format(date);
  };

  const colCenter = (i) => ((i * (barWidth + GAP) + barWidth / 2) / W) * 100;

  const onMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const frac = (event.clientX - box.left) / box.width;
    hovered = Math.min(values.length - 1, Math.max(0, Math.floor(frac * values.length)));
  };
</script>

{#if values.length}
  <div class="spark-wrap">
    <svg
      class="spark"
      viewBox="0 0 {W} {H}"
      role="img"
      aria-label={summary}
      preserveAspectRatio="none"
      onpointermove={onMove}
      onpointerleave={() => (hovered = null)}
    >
      {#each values as value, i (i)}
        <rect
          class="bar"
          class:bar--active={hovered === i}
          x={i * (barWidth + GAP)}
          y={H - (value / max) * H}
          width={barWidth}
          height={Math.max(1, (value / max) * H)}
          rx="1"
        />
      {/each}
    </svg>

    {#if hovered !== null}
      <div class="spark-tip" style="left: {colCenter(hovered)}%">
        <strong>{values[hovered].toLocaleString('de-DE')}</strong> Downloads
        <span class="spark-tip__month">{monthName(labels[hovered])}</span>
      </div>
    {/if}
  </div>
{/if}
