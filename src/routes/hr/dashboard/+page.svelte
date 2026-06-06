<script>
  import Badge from '$lib/components/Badge.svelte';

  export let data;
  $: metrics   = data.metrics ?? {};
  $: activity  = data.recentActivity ?? [];
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

  const STATUS_COLORS = {
    Pending:  { bg: '#FFFBEB', ic: '#D97706' },
    Approved: { bg: '#ECFDF5', ic: '#059669' },
    Rejected: { bg: '#FEF2F2', ic: '#DC2626' }
  };
</script>

<svelte:head><title>HR Dashboard — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">HR <span class="gradient-text">Command</span> Dashboard</h1>
  <p class="page-subtitle">
    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
  </p>
</div>

<div class="page-body">

  <!-- Metrics -->
  <div class="metrics-grid">
    <div class="metric-card indigo">
      <div class="metric-icon">👥</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.totalEmployees}</div>
        <div class="metric-label">Active Employees</div>
      </div>
    </div>
    <div class="metric-card green">
      <div class="metric-icon">🏢</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.todayPresent}</div>
        <div class="metric-label">Present Today</div>
      </div>
    </div>
    <div class="metric-card yellow">
      <div class="metric-icon">⏳</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.pendingLeaves}</div>
        <div class="metric-label">Pending Approvals</div>
      </div>
    </div>
    <div class="metric-card purple">
      <div class="metric-icon">✅</div>
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
        <span class="live-indicator"><span class="pulse-dot"></span>Live</span>
      </div>
      <div class="activity-feed">
        {#if activity.length === 0}
          <div class="empty-state"><p>No recent activity.</p></div>
        {:else}
          {#each activity as a}
            {@const col = STATUS_COLORS[a.status] ?? STATUS_COLORS.Pending}
            <div class="activity-item">
              <div class="activity-icon" style="background:{col.bg}; color:{col.ic}">
                {a.status === 'Approved' ? '✓' : a.status === 'Rejected' ? '✕' : '⏳'}
              </div>
              <div class="activity-body">
                <p class="activity-text">
                  <strong>{a.actor}</strong> applied for <em>{a.detail}</em>
                </p>
                <div class="activity-meta">
                  <Badge value={a.status} />
                  <span class="activity-time">· {fmtRelative(a.ts)}</span>
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
          {#each deptStats as d, i}
            {@const max = Math.max(...deptStats.map(x => Number(x.count)))}
            {@const colors = ['#6366F1','#8B5CF6','#3B82F6','#10B981','#F59E0B']}
            <div class="dept-row">
              <div class="dept-name">{d.department ?? 'Unassigned'}</div>
              <div class="dept-bar-wrap">
                <div class="dept-bar"
                  style="width:{(Number(d.count)/max)*100}%; background:{colors[i % colors.length]}">
                </div>
              </div>
              <div class="dept-count">{d.count}</div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

  </div>

  <!-- Quick Actions -->
  <h3 class="section-title" style="margin-bottom:14px">Quick Actions</h3>
  <div class="quick-links">
    {#each [
      { href: '/manager/dashboard', icon: '✔', title: 'Leave Approvals',    sub: 'Review pending requests',      from: '#6366F1', to: '#8B5CF6' },
      { href: '/hr/attendance',     icon: '🕐', title: 'Attendance Monitor', sub: 'View daily time records',      from: '#10B981', to: '#047857' },
      { href: '/hr/settings',       icon: '⚙', title: 'System Settings',    sub: 'Users, depts & leave types',   from: '#F59E0B', to: '#D97706' }
    ] as q}
      <a href={q.href} class="quick-link">
        <div class="ql-icon" style="background:linear-gradient(135deg,{q.from},{q.to})">{q.icon}</div>
        <div class="ql-text">
          <div class="ql-title">{q.title}</div>
          <div class="ql-sub">{q.sub}</div>
        </div>
        <span class="ql-arrow">→</span>
      </a>
    {/each}
  </div>

</div>

<style>
  .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }

  /* Activity */
  .activity-feed { padding: 4px 0; }

  .activity-item {
    display: flex;
    gap: 13px;
    padding: 13px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.04);
  }
  .activity-item:last-child { border-bottom: none; }

  .activity-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .activity-body { flex: 1; }
  .activity-text { font-size: 0.875rem; color: var(--gray-700); margin-bottom: 5px; }
  .activity-meta { display: flex; align-items: center; gap: 6px; }
  .activity-time { font-size: 0.75rem; color: var(--gray-400); }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--success);
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: var(--success);
    border-radius: 50%;
    display: inline-block;
    animation: livepulse 1.5s infinite;
  }

  @keyframes livepulse {
    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
    70%  { box-shadow: 0 0 0 7px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
  }

  /* Dept bars */
  .dept-row { display: flex; align-items: center; gap: 12px; margin-bottom: 13px; }
  .dept-name { width: 110px; font-size: 0.8125rem; font-weight: 600; color: var(--gray-700); flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dept-bar-wrap { flex: 1; height: 8px; background: rgba(0,0,0,0.05); border-radius: 100px; overflow: hidden; }
  .dept-bar { height: 100%; border-radius: 100px; transition: width 0.6s ease; }
  .dept-count { width: 28px; text-align: right; font-size: 0.875rem; font-weight: 800; color: var(--gray-700); }

  /* Quick links */
  .quick-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  .quick-link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 22px;
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 20px;
    box-shadow: var(--shadow-md);
    text-decoration: none;
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .quick-link:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg), 0 0 0 1px rgba(99,102,241,0.15);
  }

  .ql-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  }

  .ql-text { flex: 1; }
  .ql-title { font-size: 0.9375rem; font-weight: 800; color: var(--gray-900); letter-spacing: -0.01em; }
  .ql-sub   { font-size: 0.8125rem; color: var(--gray-500); margin-top: 2px; }
  .ql-arrow { font-size: 1.125rem; color: var(--gray-300); transition: all 0.2s ease; }
  .quick-link:hover .ql-arrow { color: var(--primary); transform: translateX(4px); }

  @media (max-width: 900px) {
    .dash-grid   { grid-template-columns: 1fr; }
    .quick-links { grid-template-columns: 1fr; }
  }
</style>
