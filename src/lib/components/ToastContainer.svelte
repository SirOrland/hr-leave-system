<script>
  import { toasts, removeToast } from '$lib/stores/toast.js';

  const CONFIG = {
    success: { icon: '✓', from: '#10B981', to: '#047857' },
    error:   { icon: '✕', from: '#EF4444', to: '#B91C1C' },
    info:    { icon: 'ℹ', from: '#3B82F6', to: '#1D4ED8' },
    warning: { icon: '⚠', from: '#F59E0B', to: '#D97706' }
  };
</script>

<div class="toast-portal" aria-live="polite">
  {#each $toasts as toast (toast.id)}
    {@const c = CONFIG[toast.type] ?? CONFIG.info}
    <div
      class="toast"
      style="--from: {c.from}; --to: {c.to}"
      role="alert"
    >
      <span class="toast-icon">{c.icon}</span>
      <span class="toast-msg">{toast.message}</span>
      <button class="toast-close" on:click={() => removeToast(toast.id)} aria-label="Dismiss">✕</button>
    </div>
  {/each}
</div>

<style>
  .toast-portal {
    position: fixed;
    bottom: 28px;
    right: 28px;
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
    gap: 12px;
    padding: 14px 18px;
    border-radius: 16px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 12px 32px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: 280px;
    max-width: 400px;
    background: linear-gradient(135deg, var(--from), var(--to));
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
  }

  .toast::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.07);
    pointer-events: none;
  }

  .toast-icon {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8125rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .toast-msg { flex: 1; line-height: 1.4; }

  .toast-close {
    background: rgba(255,255,255,0.15);
    border: none;
    color: white;
    opacity: 0.8;
    cursor: pointer;
    font-size: 0.75rem;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 150ms ease;
  }
  .toast-close:hover { opacity: 1; background: rgba(255,255,255,0.25); }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
