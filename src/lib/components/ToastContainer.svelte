<script>
  import { toasts, removeToast } from '$lib/stores/toast.js';

  const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
</script>

<div class="toast-portal" aria-live="polite">
  {#each $toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}" role="alert">
      <span class="toast-icon">{ICONS[toast.type] ?? '•'}</span>
      <span class="toast-msg">{toast.message}</span>
      <button class="toast-close" on:click={() => removeToast(toast.id)} aria-label="Dismiss">✕</button>
    </div>
  {/each}
</div>

<style>
  .toast-portal {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.15);
    animation: slideIn 0.25s ease;
    min-width: 260px;
    max-width: 380px;
  }

  .toast-success { background: #065F46; color: white; }
  .toast-error   { background: #991B1B; color: white; }
  .toast-info    { background: #1E40AF; color: white; }
  .toast-warning { background: #92400E; color: white; }

  .toast-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .toast-msg { flex: 1; }

  .toast-close {
    background: none;
    border: none;
    color: inherit;
    opacity: 0.7;
    cursor: pointer;
    font-size: 0.8125rem;
    padding: 2px;
  }
  .toast-close:hover { opacity: 1; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
</style>
