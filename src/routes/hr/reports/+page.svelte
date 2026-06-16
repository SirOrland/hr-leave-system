<script>
  export let data;
  $: ({ departments, counts } = data);

  const today     = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const yearStart  = `${new Date().getFullYear()}-01-01`;

  // Employee filters
  let empDept   = '';
  let empStatus = '';

  // Attendance filters
  let attFrom = monthStart;
  let attTo   = today;
  let attDept = '';

  // Leave filters
  let lvFrom   = yearStart;
  let lvTo     = today;
  let lvStatus = '';
  let lvDept   = '';

  function buildUrl(base, params) {
    const q = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return q ? `${base}?${q}` : base;
  }
</script>

<svelte:head><title>Reports — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">Reports & <span class="gradient-text">Exports</span></h1>
  <p class="page-subtitle">Download employee, attendance, and leave data as CSV spreadsheets</p>
</div>

<!-- Quick stats -->
<div class="stat-row">
  <div class="stat-card">
    <span class="stat-icon">👥</span>
    <div>
      <div class="stat-n">{counts.employees}</div>
      <div class="stat-l">Active Employees</div>
    </div>
  </div>
  <div class="stat-card">
    <span class="stat-icon">🕐</span>
    <div>
      <div class="stat-n">{counts.attendance_today}</div>
      <div class="stat-l">Clocked In Today</div>
    </div>
  </div>
  <div class="stat-card">
    <span class="stat-icon">📝</span>
    <div>
      <div class="stat-n">{counts.total_leaves}</div>
      <div class="stat-l">Total Leave Requests</div>
    </div>
  </div>
  <div class="stat-card amber">
    <span class="stat-icon">⏳</span>
    <div>
      <div class="stat-n">{counts.pending_leaves}</div>
      <div class="stat-l">Pending Approvals</div>
    </div>
  </div>
</div>

<!-- Report cards -->
<div class="report-grid">

  <!-- ── Employee Report ── -->
  <div class="report-card">
    <div class="rc-header">
      <div class="rc-icon" style="background:linear-gradient(135deg,#6366F1,#8B5CF6)">👥</div>
      <div>
        <div class="rc-title">Employee List</div>
        <div class="rc-sub">All employee records with role, department & status</div>
      </div>
    </div>

    <div class="rc-body">
      <div class="filter-group">
        <label class="filter-label">Department</label>
        <select class="filter-select" bind:value={empDept}>
          <option value="">All departments</option>
          {#each departments as d}
            <option value={d}>{d}</option>
          {/each}
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select class="filter-select" bind:value={empStatus}>
          <option value="">All</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>
    </div>

    <div class="rc-footer">
      <div class="rc-columns">
        Columns: Code · Name · Email · Role · Department · Status · Date Joined
      </div>
      <a
        class="btn btn-primary download-btn"
        href={buildUrl('/hr/reports/export/employees', { department: empDept, status: empStatus })}
        download
      >
        ⬇ Download CSV
      </a>
    </div>
  </div>

  <!-- ── Attendance Report ── -->
  <div class="report-card">
    <div class="rc-header">
      <div class="rc-icon" style="background:linear-gradient(135deg,#0EA5E9,#0284C7)">🕐</div>
      <div>
        <div class="rc-title">Attendance Report</div>
        <div class="rc-sub">Daily time records with AM/PM in-out for a date range</div>
      </div>
    </div>

    <div class="rc-body">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">From</label>
          <input type="date" class="filter-input" bind:value={attFrom} max={today} />
        </div>
        <div class="filter-group">
          <label class="filter-label">To</label>
          <input type="date" class="filter-input" bind:value={attTo} max={today} />
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Department</label>
        <select class="filter-select" bind:value={attDept}>
          <option value="">All departments</option>
          {#each departments as d}
            <option value={d}>{d}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="rc-footer">
      <div class="rc-columns">
        Columns: Date · Code · Name · Department · AM In · AM Out · PM In · PM Out · Hours · Status · Location
      </div>
      <a
        class="btn btn-primary download-btn"
        href={buildUrl('/hr/reports/export/attendance', { from: attFrom, to: attTo, department: attDept })}
        download
      >
        ⬇ Download CSV
      </a>
    </div>
  </div>

  <!-- ── Leave Request Report ── -->
  <div class="report-card">
    <div class="rc-header">
      <div class="rc-icon" style="background:linear-gradient(135deg,#10B981,#059669)">📝</div>
      <div>
        <div class="rc-title">Leave Requests</div>
        <div class="rc-sub">Filed leave requests with type, duration, and approval status</div>
      </div>
    </div>

    <div class="rc-body">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">From</label>
          <input type="date" class="filter-input" bind:value={lvFrom} max={today} />
        </div>
        <div class="filter-group">
          <label class="filter-label">To</label>
          <input type="date" class="filter-input" bind:value={lvTo} max={today} />
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select class="filter-select" bind:value={lvStatus}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Department</label>
          <select class="filter-select" bind:value={lvDept}>
            <option value="">All departments</option>
            {#each departments as d}
              <option value={d}>{d}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <div class="rc-footer">
      <div class="rc-columns">
        Columns: ID · Code · Name · Department · Leave Type · Start · End · Days · Reason · Status · Date Filed
      </div>
      <a
        class="btn btn-primary download-btn"
        href={buildUrl('/hr/reports/export/leaves', { from: lvFrom, to: lvTo, status: lvStatus, department: lvDept })}
        download
      >
        ⬇ Download CSV
      </a>
    </div>
  </div>

</div>

<style>
  .page-header { margin-bottom: 28px; }

  /* Stat row */
  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 16px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: var(--shadow-sm);
  }
  .stat-card.amber { border-color: rgba(245,158,11,.2); background: rgba(255,251,235,.85); }

  .stat-icon { font-size: 1.5rem; }

  .stat-n {
    font-size: 1.75rem;
    font-weight: 900;
    color: var(--gray-900);
    letter-spacing: -.03em;
    line-height: 1;
  }

  .stat-l {
    font-size: .6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--gray-400);
    margin-top: 3px;
  }

  /* Report grid */
  .report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }

  .report-card {
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 20px;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rc-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 22px 22px 18px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .rc-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  }

  .rc-title { font-size: 1rem; font-weight: 800; color: var(--gray-900); }
  .rc-sub   { font-size: .8125rem; color: var(--gray-500); margin-top: 2px; line-height: 1.4; }

  .rc-body {
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .filter-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .filter-label {
    font-size: .6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--gray-500);
  }

  .filter-select, .filter-input {
    height: 36px;
    border: 1.5px solid rgba(0,0,0,0.1);
    border-radius: 9px;
    padding: 0 10px;
    font-size: .875rem;
    color: var(--gray-900);
    background: white;
    outline: none;
    transition: border-color .15s;
    width: 100%;
  }
  .filter-select:focus, .filter-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99,102,241,.1);
  }

  .rc-footer {
    padding: 14px 22px 20px;
    border-top: 1px solid rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rc-columns {
    font-size: .6875rem;
    color: var(--gray-400);
    line-height: 1.5;
  }

  .download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    border-radius: 11px;
    font-size: .9rem;
    font-weight: 700;
    text-decoration: none;
    gap: 6px;
  }

  @media (max-width: 900px) {
    .stat-row { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 600px) {
    .stat-row { grid-template-columns: 1fr 1fr; }
    .report-grid { grid-template-columns: 1fr; }
  }
</style>
