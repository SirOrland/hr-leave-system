<script>
  import { onMount, onDestroy } from 'svelte';

  let timeStr = '';
  let dateStr = '';
  let interval;

  function tick() {
    const now = new Date();
    timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onMount(() => {
    tick();
    interval = setInterval(tick, 1000);
  });

  onDestroy(() => clearInterval(interval));
</script>

<div class="clock-wrap">
  <div class="clock-display">{timeStr}</div>
  <div class="clock-date">{dateStr}</div>
</div>

<style>
  .clock-wrap { user-select: none; }
</style>
