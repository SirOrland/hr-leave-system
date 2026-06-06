<script>
  import { page } from '$app/stores';
  import '../app.css';
</script>

<div class="err-page">
  <div class="err-orb orb-a"></div>
  <div class="err-orb orb-b"></div>
  <div class="err-card">
    <div class="err-num gradient-text">{$page.status}</div>
    <h1 class="err-title">
      {$page.status === 404 ? 'Page not found' :
       $page.status === 403 ? 'Access denied' : 'Something went wrong'}
    </h1>
    <p class="err-msg">{$page.error?.message ?? 'An unexpected error occurred.'}</p>
    <a href="/" class="btn btn-primary">← Go Home</a>
  </div>
</div>

<style>
  .err-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F0F4FF;
    background-image:
      radial-gradient(ellipse at 20% 40%, rgba(99,102,241,0.09) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.07) 0%, transparent 55%);
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .err-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.18;
    pointer-events: none;
  }
  .orb-a { width: 350px; height: 350px; background: #6366F1; top: -100px; left: -80px; }
  .orb-b { width: 280px; height: 280px; background: #8B5CF6; bottom: -80px; right: -60px; }

  .err-card {
    position: relative;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 28px;
    padding: 52px 44px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(99,102,241,0.1), 0 4px 16px rgba(0,0,0,0.06);
    max-width: 420px;
    width: 100%;
  }

  .err-num {
    font-size: 6rem;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 16px;
    letter-spacing: -0.04em;
  }

  .err-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }

  .err-msg {
    font-size: 0.9375rem;
    color: #64748B;
    margin-bottom: 32px;
    line-height: 1.6;
  }
</style>
