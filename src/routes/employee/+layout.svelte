<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  export let data;
</script>

<div class="app-shell">
  <Sidebar user={data.user} />
  <div class="main-content">
    <slot />
  </div>
</div>
