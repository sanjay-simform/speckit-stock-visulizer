<script lang="ts">
  import { Chart, registerables } from "chart.js";
  import { onMount } from "svelte";
  import type { TrackerUI } from "../types.js";

  Chart.register(...registerables);

  export let tracker: TrackerUI;

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  onMount(() => {
    initChart();
    return () => {
      chart?.destroy();
    };
  });

  function initChart() {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = tracker.history.map((value, index) => ({
      x: index,
      y: value,
    }));

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((_, i) => i),
        datasets: [
          {
            label: tracker.symbol,
            data: data.map((d) => d.y),
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            tension: 0.3,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          filler: { propagate: true },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: "rgba(100, 116, 139, 0.2)" },
            ticks: { color: "rgb(148, 163, 184)" },
          },
          x: {
            display: false,
          },
        },
      },
    });
  }

  function updateChart() {
    if (!chart) return;

    const data = tracker.history;
    chart.data.labels = data.map((_, i) => i);
    chart.data.datasets[0].data = data;

    // Update color based on latest delta
    const latestDelta = tracker.currentValue - tracker.previousValue;
    const color = latestDelta >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
    const bgColor =
      latestDelta >= 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)";

    chart.data.datasets[0].borderColor = color;
    chart.data.datasets[0].backgroundColor = bgColor;

    chart.update("none");
  }

  $: if (chart && tracker) {
    updateChart();
  }
</script>

<div class="h-48 w-full">
  <canvas bind:this={canvas}></canvas>
</div>
