<script lang="ts">
  import { trackerStore, wsConnection } from "./stores.js";
  import TrackerCard from "./components/TrackerCard.svelte";
  import CreateTrackerForm from "./components/CreateTrackerForm.svelte";
  import ConnectionStatus from "./components/ConnectionStatus.svelte";

  // Subscribe to tracker updates
  wsConnection.onMessage((message: any) => {
    if (message.type === "TICK") {
      trackerStore.updateTracker(message.payload);
    } else if (
      message.type === "ERROR" &&
      message.payload.code === "TRACKER_REMOVED"
    ) {
      // Handle tracker removal
      const trackerId = message.payload.message.match(/Tracker ([^ ]+)/)?.[1];
      if (trackerId) {
        trackerStore.removeTracker(trackerId);
      }
    }
  });

  let trackers: any[] = [];

  trackerStore.subscribe((trackerMap) => {
    trackers = Array.from(trackerMap.values());
  });

  function handleCreateTracker(
    event: CustomEvent<{ symbol: string; threshold: number }>,
  ) {
    const { symbol, threshold } = event.detail;
    wsConnection.send({
      type: "CREATE_TRACKER",
      payload: { symbol, threshold },
    });
  }

  function handlePauseTracker(trackerId: string) {
    wsConnection.send({
      type: "PAUSE_TRACKER",
      payload: { trackerId },
    });
    trackerStore.pauseTracker(trackerId);
  }

  function handleResumeTracker(trackerId: string) {
    wsConnection.send({
      type: "RESUME_TRACKER",
      payload: { trackerId },
    });
    trackerStore.resumeTracker(trackerId);
  }

  function handleRemoveTracker(trackerId: string) {
    wsConnection.send({
      type: "REMOVE_TRACKER",
      payload: { trackerId },
    });
    trackerStore.removeTracker(trackerId);
  }
</script>

<main class="min-h-screen bg-slate-950 text-white">
  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-cyan-400">PulseTick</h1>
      <div class="flex items-center gap-4">
        <ConnectionStatus />
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Create Tracker Form -->
    <div class="mb-8">
      <CreateTrackerForm on:create={handleCreateTracker} />
    </div>

    <!-- Trackers Grid -->
    {#if trackers.length === 0}
      <div class="text-center py-16">
        <p class="text-slate-400 text-lg">
          No trackers yet. Create one to get started.
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each trackers as tracker (tracker.id)}
          <TrackerCard
            {tracker}
            onPause={() => handlePauseTracker(tracker.id)}
            onResume={() => handleResumeTracker(tracker.id)}
            onRemove={() => handleRemoveTracker(tracker.id)}
          />
        {/each}
      </div>
    {/if}
  </div>
</main>

<style global>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
  }
</style>
