<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  export let form;

  let loading   = false;
  let showPass  = false;

  $: passwordReset = $page.url.searchParams.get('reset') === '1';
</script>

<svelte:head><title>Sign In — HRPortal</title></svelte:head>

<div class="login-page">

  <!-- Left panel -->
  <div class="left-panel">
    <!-- Floating orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="left-content">
      <div class="brand-mark">HR</div>
      <h1 class="hero-title">
        Streamline<br/>
        <span class="highlight">HR operations</span>
      </h1>
      <p class="hero-sub">
        A unified platform for leave management,<br/>
        attendance tracking, and workforce oversight.
      </p>

      <div class="features">
        {#each [
          ['✓','Smart leave approval workflows'],
          ['✓','Real-time attendance tracking'],
          ['✓','Role-based access control'],
          ['✓','Instant status notifications']
        ] as [icon, feat]}
          <div class="feature-item">
            <span class="feat-icon">{icon}</span>
            {feat}
          </div>
        {/each}
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat"><span class="stat-num">3</span><span class="stat-lbl">Roles</span></div>
        <div class="stat-div"></div>
        <div class="stat"><span class="stat-num">8</span><span class="stat-lbl">DB Tables</span></div>
        <div class="stat-div"></div>
        <div class="stat"><span class="stat-num">∞</span><span class="stat-lbl">Possibilities</span></div>
      </div>
    </div>
  </div>

  <!-- Right panel (glass card) -->
  <div class="right-panel">
    <div class="form-card">
      <!-- Header -->
      <div class="card-top">
        <div class="card-logo">HR</div>
        <h2 class="card-title">Welcome back</h2>
        <p class="card-sub">Sign in to your HR portal</p>
      </div>

      {#if passwordReset}
        <div class="alert alert-success">
          <span>✓</span> Password updated successfully. Sign in with your new password.
        </div>
      {/if}

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

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input
              id="password" name="password"
              type={showPass ? 'text' : 'password'}
              class="form-control pl-input"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="pass-toggle"
              on:click={() => (showPass = !showPass)}
              aria-label="Toggle password"
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg submit-btn" disabled={loading}>
          {#if loading}
            <span class="spinner"></span> Signing in…
          {:else}
            Sign In →
          {/if}
        </button>

        <a href="/forgot-password" class="btn btn-ghost w-full forgot-btn">
          Forgot password?
        </a>
      </form>


    </div>
  </div>

</div>

<style>
  .login-page {
    display: flex;
    min-height: 100vh;
  }

  /* ---- Left panel ---- */
  .left-panel {
    flex: 1;
    background: linear-gradient(145deg, #0F172A 0%, #1E1B4B 40%, #0F172A 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 56px;
    position: relative;
    overflow: hidden;
  }

  /* Ambient orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.25;
    animation: pulse 6s ease-in-out infinite;
  }

  .orb-1 { width: 400px; height: 400px; background: #6366F1; top: -120px; left: -80px; animation-delay: 0s; }
  .orb-2 { width: 300px; height: 300px; background: #8B5CF6; bottom: -80px; right: -60px; animation-delay: 2s; }
  .orb-3 { width: 200px; height: 200px; background: #3B82F6; top: 50%; left: 50%; animation-delay: 4s; }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.25; }
    50%       { transform: scale(1.1); opacity: 0.35; }
  }

  .left-content { max-width: 440px; position: relative; z-index: 1; }

  .brand-mark {
    width: 54px;
    height: 54px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 900;
    color: white;
    margin-bottom: 36px;
    letter-spacing: 0.05em;
    box-shadow: 0 8px 24px rgba(99,102,241,0.5);
  }

  .hero-title {
    font-size: 2.75rem;
    font-weight: 900;
    color: white;
    line-height: 1.15;
    margin-bottom: 18px;
    letter-spacing: -0.03em;
  }

  .highlight {
    background: linear-gradient(135deg, #818CF8, #C084FC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 1rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.7;
    margin-bottom: 32px;
  }

  .features { display: flex; flex-direction: column; gap: 13px; margin-bottom: 40px; }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255,255,255,0.65);
    font-size: 0.9375rem;
  }

  .feat-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(99,102,241,0.35);
    color: #818CF8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .stats-row {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px 24px;
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
  }

  .stat { text-align: center; }
  .stat-num { display: block; font-size: 1.5rem; font-weight: 900; color: white; letter-spacing: -0.02em; }
  .stat-lbl { display: block; font-size: 0.6875rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px; }
  .stat-div { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }

  /* ---- Right panel ---- */
  .right-panel {
    width: 520px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 36px;
    background: rgba(240,244,255,0.6);
    backdrop-filter: blur(30px);
  }

  .form-card {
    width: 100%;
    max-width: 420px;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 28px;
    padding: 36px;
    box-shadow: 0 20px 60px rgba(99,102,241,0.12), 0 4px 16px rgba(0,0,0,0.06);
  }

  .card-top { text-align: center; margin-bottom: 28px; }

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
    margin: 0 auto 16px;
    box-shadow: 0 6px 20px rgba(99,102,241,0.4);
  }

  .card-title {
    font-size: 1.625rem;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .card-sub { font-size: 0.9375rem; color: #64748B; }

  /* Input with icon */
  .input-wrap { position: relative; }

  .input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    font-size: 0.875rem;
    pointer-events: none;
    line-height: 1;
  }

  .pl-input { padding-left: 36px !important; }
  .pl-input:last-of-type { padding-right: 44px; }

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
    color: #94A3B8;
  }

  .forgot-btn {
    display: block;
    margin-top: 10px;
    border-radius: 12px;
    height: 44px;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #6366F1;
    text-align: center;
    text-decoration: none;
    line-height: 44px;
    border: 1.5px solid rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.04);
    transition: background 0.15s, border-color 0.15s;
  }
  .forgot-btn:hover {
    background: rgba(99,102,241,0.09);
    border-color: rgba(99,102,241,0.45);
  }

  .alert-success {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 10px;
    color: #166534;
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .submit-btn {
    margin-top: 4px;
    border-radius: 12px;
    height: 48px;
    font-size: 1rem;
    letter-spacing: 0.01em;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }


  /* Responsive */
  @media (max-width: 900px) {
    .left-panel { display: none; }
    .right-panel { width: 100%; }
  }
</style>
