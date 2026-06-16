<script>
  import { enhance } from '$app/forms';
  export let form;

  let loading = false;
</script>

<svelte:head><title>Forgot Password — HRPortal</title></svelte:head>

<div class="page">
  <div class="card">
    <a href="/login" class="back-link">← Back to Sign In</a>

    <div class="card-logo">HR</div>
    <h1 class="title">Forgot your password?</h1>
    <p class="subtitle">
      Enter the email address linked to your account and we'll send you a reset link.
    </p>

    {#if form?.success}
      <div class="alert alert-success">
        <span>✓</span>
        If that email is registered, you'll receive a reset link shortly. Check your inbox (and spam folder).
      </div>
    {:else}
      {#if form?.error}
        <div class="alert alert-error">
          <span>⚠</span> {form.error}
        </div>
      {/if}

      <form method="POST" use:enhance={() => {
        loading = true;
        return async ({ update }) => { await update(); loading = false; };
      }}>
        <div class="form-group">
          <label class="form-label" for="email">Email address</label>
          <div class="input-wrap">
            <span class="input-icon">@</span>
            <input
              id="email" name="email" type="email"
              class="form-control pl-input"
              placeholder="you@company.com"
              value={form?.email ?? ''}
              autocomplete="email"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg submit-btn" disabled={loading}>
          {#if loading}
            <span class="spinner"></span> Sending…
          {:else}
            Send Reset Link
          {/if}
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #0F172A 0%, #1E1B4B 40%, #0F172A 100%);
    padding: 24px;
  }

  .card {
    width: 100%;
    max-width: 420px;
    background: rgba(255,255,255,0.95);
    border-radius: 28px;
    padding: 40px 36px;
    box-shadow: 0 20px 60px rgba(99,102,241,0.2), 0 4px 16px rgba(0,0,0,0.1);
  }

  .back-link {
    display: inline-block;
    color: #6366F1;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 28px;
  }
  .back-link:hover { text-decoration: underline; }

  .card-logo {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 900;
    color: white;
    margin: 0 auto 20px;
    box-shadow: 0 6px 20px rgba(99,102,241,0.4);
  }

  .title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0F172A;
    text-align: center;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }

  .subtitle {
    color: #64748B;
    text-align: center;
    font-size: 0.9375rem;
    line-height: 1.6;
    margin-bottom: 28px;
  }

  .alert-success {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 12px;
    color: #166534;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .alert-success span { font-size: 1.1rem; }

  .input-wrap { position: relative; }

  .input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    font-size: 0.875rem;
    pointer-events: none;
  }

  .pl-input { padding-left: 36px !important; }

  .submit-btn {
    margin-top: 4px;
    border-radius: 12px;
    height: 48px;
    font-size: 1rem;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    vertical-align: middle;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
