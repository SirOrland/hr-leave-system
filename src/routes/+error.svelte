<script>
  import { page } from '$app/stores';
  import '../app.css';
</script>

<div class="error-page">
  <div class="error-card">
    <div class="error-code">{$page.status}</div>
    <h1 class="error-title">
      {$page.status === 404 ? 'Page Not Found' :
       $page.status === 403 ? 'Access Denied' : 'Something went wrong'}
    </h1>
    <p class="error-msg">{$page.error?.message ?? 'An unexpected error occurred.'}</p>
    <a href="/" class="btn btn-primary">Go Home</a>
  </div>
</div>

<style>
  .error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gray-50);
    padding: 24px;
  }

  .error-card {
    background: white;
    border-radius: var(--radius-xl);
    padding: 48px 40px;
    text-align: center;
    box-shadow: var(--shadow-xl);
    max-width: 420px;
    width: 100%;
    border: 1px solid var(--gray-200);
  }

  .error-code {
    font-size: 5rem;
    font-weight: 900;
    color: var(--primary);
    line-height: 1;
    margin-bottom: 12px;
    opacity: 0.15;
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 10px;
  }

  .error-msg {
    font-size: 0.9375rem;
    color: var(--gray-500);
    margin-bottom: 28px;
  }
</style>
