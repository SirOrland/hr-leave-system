<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;

  let loading   = false;
  let showPass  = false;
  let showConf  = false;
</script>

<svelte:head><title>Reset Password — HRPortal</title></svelte:head>

<div class="page">
  <div class="card">
    <div class="card-logo">HR</div>

    {#if data.invalid}
      <h1 class="title">Link expired</h1>
      <p class="subtitle">
        This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
      </p>
      <a href="/forgot-password" class="btn btn-primary w-full btn-lg submit-btn">
        Request a new link
      </a>

    {:else}
      <h1 class="title">Set new password</h1>
      <p class="subtitle">Hi {data.name}, choose a strong new password for your account.</p>

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
          <label class="form-label" for="password">New password</label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input
              id="password" name="password"
              type={showPass ? 'text' : 'password'}
              class="form-control pl-input"
              placeholder="Min. 8 characters"
              autocomplete="new-password"
              required minlength="8"
            />
            <button
              type="button" class="pass-toggle"
              on:click={() => (showPass = !showPass)}
              aria-label="Toggle password"
            >{showPass ? '🙈' : '👁'}</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="confirm">Confirm new password</label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input
              id="confirm" name="confirm"
              type={showConf ? 'text' : 'password'}
              class="form-control pl-input"
              placeholder="Repeat your new password"
              autocomplete="new-password"
              required minlength="8"
            />
            <button
              type="button" class="pass-toggle"
              on:click={() => (showConf = !showConf)}
              aria-label="Toggle confirm password"
            >{showConf ? '🙈' : '👁'}</button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg submit-btn" disabled={loading}>
          {#if loading}
            <span class="spinner"></span> Updating…
          {:else}
            Update Password
          {/if}
        </button>
      </form>
    {/if}

    <a href="/login" class="back-link">← Back to Sign In</a>
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

  .pl-input { padding-left: 36px !important; padding-right: 44px; }

  .pass-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #94A3B8;
  }

  .submit-btn {
    margin-top: 4px;
    border-radius: 12px;
    height: 48px;
    font-size: 1rem;
    text-align: center;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-link {
    display: block;
    text-align: center;
    margin-top: 20px;
    color: #6366F1;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
  }
  .back-link:hover { text-decoration: underline; }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
