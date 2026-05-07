<script lang="ts">
  import Graph from './Graph.svelte';
  import type { TrackerUI } from '../types.js';

  export let tracker: TrackerUI;
  export let onPause: () => void;
  export let onResume: () => void;
  export let onRemove: () => void;

  $: delta = tracker.currentValue - tracker.previousValue;
  $: isUp = delta >= 0;
  $: colorClass = isUp ? 'text-green-400' : 'text-red-400';
  $: arrowIcon = isUp ? '▲' : '▼';
</script>

<div class="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors">
  <!-- Header -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex-1">
      <h3 class="text-lg font-bold text-white">{tracker.symbol}</h3>
      <p class="text-sm text-slate-400">Threshold: {tracker.threshold}%</p>
    </div>
    <div class="text-right">
      <div class={`text-2xl font-bold ${colorClass}`}>
        ${tracker.currentValue.toFixed(2)}
      </div>
      <div class={`text-sm font-semibold ${colorClass} flex items-center justify-end gap-1`}>
        {arrowIcon}
        {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
      </div>
    </div>
  </div>

  <!-- Graph -->
  <div class="mb-4 bg-slate-800 rounded-md p-2">
    <Graph {tracker} />
  </div>

  <!-- Controls -->
  <div class="flex gap-2">
    {#if tracker.paused}
      <button
        on:click={onResume}
        class="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
      >
        Resume
      </button>
    {:else}
      <button
        on:click={onPause}
        class="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors"
      >
        Pause
      </button>
    {/if}

    <button
      on:click={onRemove}
      class="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
    >
      Remove
    </button>
  </div>
</div>
