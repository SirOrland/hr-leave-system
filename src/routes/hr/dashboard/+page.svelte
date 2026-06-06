<script>
  export let data;
  $: metrics  = data.metrics ?? {};
  $: activity = data.recentActivity ?? [];
  $: deptStats = data.deptStats ?? [];

  function fmtRelative(d) {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  const STATUS_ICON = { Pending: '⏳', Approved: '✅', Rejected: '✕' };
</script>

<svelte:head><title>HR Command Dashboard — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">HR Command Dashboard</h1>
  <p class="page-subtitle">Organization-wide overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
</div>

<div class="page-body">

  <!-- Key Metrics -->
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-icon blue">👥</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.totalEmployees}</div>
        <div class="metric-label">Active Employees</div>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon green">🏢</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.todayPresent}</div>
        <div class="metric-label">Present Today</div>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon yellow">⏳</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.pendingLeaves}</div>
        <div class="metric-label">Pending Approvals</div>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon purple">✅</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.approvedLeaves}</div>
        <div class="metric-label">Approved Leaves</div>
      </div>
    </div>
  </div>

  <div class="dash-grid">

    <!-- Activity Feed -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">📡 Recent Activity</span>
      </div>
      <div class="activity-list">
        {#if activity.length === 0}
          <div class="empty-state"><p>No activity yet.</p></div>
        {:else}
          {#each activity as a}
            <div class="activity-item">
              <div class="activity-icon">{STATUS_ICON[a.status] ?? '📄'}</div>
              <div class="activity-body">
                <div class="activity-text">
                  <strong>{a.actor}</strong> applied for <em>{a.detail}</em>
                </div>
                <div class="activity-meta">
                  <span class="badge badge-{a.status?.toLowerCase()}">{a.status}</span>
                  <span class="activity-time">{fmtRelative(a.ts)}</span>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Dept Breakdown -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🏗 Headcount by Department</span>
      </div>
      <div class="card-body">
        {#if deptStats.length === 0}
          <div class="empty-state"><p>No department data.</p></div>
        {:else}
          {#each deptStats as d}
            {@const max = Math.max(...deptStats.map(x => Number(x.count)))}
            <div class="dept-row">
              <div class="dept-name">{d.department ?? 'Unassigned'}</div>
              <div class="dept-bar-wrap">
                <div class="dept-bar" style="width: {(Number(d.count) / max) * 100}%"></div>
              </div>
              <div class="dept-count">{d.count}</div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

  </div>

  <!-- Quick Links -->
  <div class="quick-links">
    <a href="/manager/dashboard" class="quick-link">
      <div class="ql-icon" style="background:#EEF2FF;color:var(--primary)">✔</div>
      <div>
        <div class="ql-title">Leave Approvals</div>
        <div class="ql-sub">Review pending requests</div>
      </div>
    </a>
    <a href="/hr/attendance" class="quick-link">
      <div class="ql-icon" style="background:#ECFDF5;color:var(--success)">🕐</div>
      <div>
        <div class="ql-title">Attendance Monitor</div>
        <div class="ql-sub">View daily time records</div>
      </div>
    </a>
    <a href="/hr/settings" class="quick-link">
      <div class="ql-icon" style="background:#FFF7ED;color:#EA580C">⚙</div>
      <div>
        <div class="ql-title">System Settings</div>
        <div class="ql-sub">Users, departments, leave types</div>
      </div>
    </a>
  </div>

</div>

<style>
  .dash-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  /* Activity Feed */
  .activity-list { padding: 8px 0; }

  .activity-item {
    display: flex;
    gap: 12px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--gray-100);
  }
  .activity-item:last-child { border-bottom: none; }

  .activity-icon {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    background: var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .activity-body { flex: 1; }
  .activity-text { font-size: 0.875rem; color: var(--gray-700); margin-bottom: 4px; }
  .activity-meta { display: flex; align-items: center; gap: 8px; }
  .activity-time { font-size: 0.75rem; color: var(--gray-400); }

  /* Dept chart */
  .dept-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .dept-name { width: 120px; font-size: 0.8125rem; color: var(--gray-700); font-weight: 500; flex-shrink: 0; }
  .dept-bar-wrap { flex: 1; height: 8px; background: var(--gray-100); border-radius: 100px; overflow: hidden; }
  .dept-bar { height: 100%; background: var(--primary); border-radius: 100px; transition: width 0.5s ease; }
  .dept-count { width: 28px; text-align: right; font-size: 0.8125rem; font-weight: 700; color: var(--gray-700); }

  /* Quick links */
  .quick-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .quick-link {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all var(--transition);
    box-shadow: var(--shadow-sm);
  }

  .quick-link:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .ql-icon {
    width: 42px;
    height: 42px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  .ql-title { font-size: 0.9375rem; font-weight: 700; color: var(--gray-900); }
  .ql-sub   { font-size: 0.8125rem; color: var(--gray-500); }

  @media (max-width: 900px) {
    .dash-grid    { grid-template-columns: 1fr; }
    .quick-links  { grid-template-columns: 1fr; }
  }
</style>
