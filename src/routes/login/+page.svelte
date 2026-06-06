<script>
  import { enhance } from '$app/forms';
  export let form;

  let loading = false;
  let showPass = false;
</script>

<svelte:head><title>Sign In — HRPortal</title></svelte:head>

<div class="login-page">
  <!-- Left panel -->
  <div class="left-panel">
    <div class="left-content">
      <div class="logo-mark">HR</div>
      <h1 class="hero-title">Streamline your<br/>HR operations</h1>
      <p class="hero-sub">
        A unified platform for leave management, attendance tracking,
        and workforce oversight — all in one place.
      </p>
      <div class="feature-list">
        {#each ['Smart leave approval workflows', 'Real-time attendance tracking', 'Role-based access control', 'Instant status notifications'] as feat}
          <div class="feature-item">
            <span class="feat-check">✓</span>
            <span>{feat}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Right panel -->
  <div class="right-panel">
    <div class="form-card">
      <div class="form-header">
        <div class="mobile-logo">HR</div>
        <h2 class="form-title">Welcome Back</h2>
        <p class="form-desc">Sign in to your HR portal</p>
      </div>

      {#if form?.error}
        <div class="alert alert-error" role="alert">
          <span>⚠</span> {form.error}
        </div>
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            await update();
            loading = false;
          };
        }}
      >
        <div class="form-group">
          <label class="form-label" for="email">
            Email Address <span class="req">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            class="form-control"
            placeholder="you@company.com"
            value={form?.email ?? ''}
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">
            Password <span class="req">*</span>
          </label>
          <div class="pass-wrap">
            <input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              class="form-control"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="pass-toggle"
              on:click={() => (showPass = !showPass)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg" disabled={loading}>
          {#if loading}
            <span class="spinner"></span> Signing in…
          {:else}
            Sign In
          {/if}
        </button>
      </form>

      <div class="demo-hint">
        <p class="demo-label">Demo credentials</p>
        <div class="demo-accounts">
          <div class="demo-row"><span class="demo-role">HR Admin</span><code>admin@hrms.com</code></div>
          <div class="demo-row"><span class="demo-role">Manager</span><code>manager@hrms.com</code></div>
          <div class="demo-row"><span class="demo-role">Employee</span><code>jane@hrms.com</code></div>
        </div>
        <p class="demo-pw">All passwords end with <code>@1234</code> (Role@1234)</p>
      </div>
    </div>
  </div>
</div>

<style>
  .login-page {
    display: flex;
    min-height: 100vh;
  }

  /* Left */
  .left-panel {
    flex: 1;
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
  }

  .left-content { max-width: 440px; }

  .logo-mark {
    width: 52px;
    height: 52px;
    background: var(--primary);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 800;
    color: white;
    margin-bottom: 32px;
    letter-spacing: 0.03em;
  }

  .hero-title {
    font-size: 2.25rem;
    font-weight: 800;
    color: white;
    line-height: 1.2;
    margin-bottom: 16px;
  }

  .hero-sub {
    font-size: 1rem;
    color: rgb(255 255 255 / 0.55);
    line-height: 1.7;
    margin-bottom: 32px;
  }

  .feature-list { display: flex; flex-direction: column; gap: 12px; }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgb(255 255 255 / 0.7);
    font-size: 0.9375rem;
  }

  .feat-check {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgb(79 70 229 / 0.3);
    color: #818CF8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* Right */
  .right-panel {
    width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 32px;
    background: var(--gray-50);
  }

  .form-card {
    width: 100%;
    max-width: 400px;
  }

  .form-header { margin-bottom: 28px; }

  .mobile-logo {
    display: none;
    width: 42px;
    height: 42px;
    background: var(--primary);
    border-radius: 10px;
    color: white;
    font-size: 0.875rem;
    font-weight: 800;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .form-title {
    font-size: 1.625rem;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 6px;
  }

  .form-desc { font-size: 0.9375rem; color: var(--gray-500); }

  .req { color: var(--danger); }

  /* Password field */
  .pass-wrap { position: relative; }
  .pass-wrap .form-control { padding-right: 44px; }

  .pass-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    color: var(--gray-400);
    padding: 0;
  }

  /* Spinner */
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgb(255 255 255 / 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Demo hint */
  .demo-hint {
    margin-top: 28px;
    padding: 16px;
    background: var(--gray-100);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
  }

  .demo-label {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--gray-400);
    margin-bottom: 10px;
  }

  .demo-accounts { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }

  .demo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8125rem;
  }

  .demo-role {
    width: 70px;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 0.8125rem;
    background: white;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--gray-200);
    color: var(--primary);
  }

  .demo-pw { font-size: 0.75rem; color: var(--gray-400); }

  /* Responsive */
  @media (max-width: 860px) {
    .left-panel { display: none; }
    .right-panel { width: 100%; }
    .mobile-logo { display: flex; }
  }
</style>
