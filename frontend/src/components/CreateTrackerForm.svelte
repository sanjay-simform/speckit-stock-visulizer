<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let symbol = '';
  let threshold = 30;
  let error = '';

  function handleSubmit() {
    error = '';

    // Validate symbol
    if (!symbol || symbol.trim().length === 0) {
      error = 'Symbol cannot be empty';
      return;
    }

    // Validate threshold
    if (threshold < 0 || threshold > 100) {
      error = 'Threshold must be between 0 and 100';
      return;
    }

    dispatch('create', {
      symbol: symbol.toUpperCase(),
      threshold: parseInt(String(threshold)),
    });

    symbol = '';
    threshold = 30;
  }
</script>

<div class="bg-slate-900 border border-slate-800 rounded-lg p-6">
  <h2 class="text-lg font-semibold text-cyan-400 mb-4">Create New Tracker</h2>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="symbol" class="block text-sm font-medium text-slate-300 mb-2">
        Symbol Name
      </label>
      <input
        id="symbol"
        type="text"
        bind:value={symbol}
        placeholder="e.g., TATA, BTC, INFY"
        maxlength="10"
        class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
      />
    </div>

    <div>
      <label for="threshold" class="block text-sm font-medium text-slate-300 mb-2">
        Volatility Threshold: {threshold}%
      </label>
      <input
        id="threshold"
        type="range"
        bind:value={threshold}
        min="0"
        max="100"
        step="5"
        class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
      <div class="text-xs text-slate-400 mt-1">Lower = more stable, Higher = more volatile</div>
    </div>

    {#if error}
      <div class="text-red-400 text-sm">{error}</div>
    {/if}

    <button
      type="submit"
      class="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors"
    >
      Add Tracker
    </button>
  </form>
</div>
