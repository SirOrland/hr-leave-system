<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast.js';
  import Clock from '$lib/components/Clock.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import { onMount, onDestroy } from 'svelte';

  export let data;
  export let form;

  $: user       = data.user;
  $: metrics    = data.metrics;
  $: balances   = data.balances;
  $: requests   = data.requests;
  $: today      = data.todayAttendance;
  $: leaveTypes = data.leaveTypes;

  let clockLoading  = false;
  let leaveLoading  = false;
  let leaveErrors   = {};
  let fileLabel     = '';
  let location      = 'Office — Main Campus';
  let pollingInterval;

  onMount(() => {
    pollingInterval = setInterval(async () => {
      const res = await fetch('/api/notifications').catch(() => null);
      if (!res?.ok) return;
      const { changed } = await res.json();
      if (changed) {
        await invalidateAll();
        addToast('Your leave request status was updated!', 'info');
      }
    }, 15_000);
  });
  onDestroy(() => clearInterval(pollingInterval));

  $: if (form?.success) {
    const msgs = {
      clockIn:    `Clocked in — status: ${form.status ?? 'Present'}`,
      clockOut:   'Clocked out successfully.',
      applyLeave: 'Leave application submitted!'
    };
    addToast(msgs[form.action] ?? 'Done!', 'success');
    invalidateAll();
  }
  $: if (form?.error)  addToast(form.error, 'error');
  $: if (form?.errors) leaveErrors = form.errors;

  function handleFile(e) {
    const f = e.target.files[0];
    fileLabel = f ? `${f.name} (${(f.size / 1024).toFixed(1)} KB)` : '';
  }

  function greet() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  function fmt(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<svelte:head><title>Dashboard — HRPortal</title></svelte:head>

<!-- Page Header -->
<div class="page-header">
  <div class="ph-left">
    <h1 class="page-title">{greet()}, <span class="gradient-text">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋</h1>
    <p class="page-subtitle">{user?.department ?? 'Department'} · {user?.employee_code ?? ''}</p>
  </div>
  <div class="ph-right">
    {#if today?.status}
      <Badge value={today.status} />
    {:else}
      <span class="badge badge-absent"><span class="dot"></span>Not Clocked In</span>
    {/if}
  </div>
</div>

<div class="page-body">

  <!-- Metric Cards -->
  <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr)">
    <div class="metric-card blue">
      <div class="metric-icon">📅</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.totalRemaining}</div>
        <div class="metric-label">Days Remaining</div>
      </div>
    </div>
    <div class="metric-card green">
      <div class="metric-icon">✅</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.totalTaken}</div>
        <div class="metric-label">Days Taken</div>
      </div>
    </div>
    <div class="metric-card yellow">
      <div class="metric-icon">⏳</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.pendingCount}</div>
        <div class="metric-label">Pending Requests</div>
      </div>
    </div>
  </div>

  <div class="two-col">

    <!-- LEFT -->
    <div class="col-left">

      <!-- Attendance Card -->
      <div class="card section">
        <div class="card-header">
          <span class="card-title">🕐 Time & Attendance</span>
        </div>
        <div class="card-body">
          <Clock />

          {#if today}
            <div class="att-grid">
              <div class="att-item">
                <span class="att-lbl">Clock In</span>
                <span class="att-val success">{fmt(today.clock_in_time)}</span>
              </div>
              <div class="att-item">
                <span class="att-lbl">Clock Out</span>
                <span class="att-val">{fmt(today.clock_out_time)}</span>
              </div>
              <div class="att-item" style="grid-column:1/-1">
                <span class="att-lbl">Location</span>
                <span class="att-val">{today.location ?? '—'}</span>
              </div>
            </div>
          {/if}

          <form method="POST" use:enhance={() => {
            clockLoading = true;
            return async ({ update }) => { await update({ reset: false }); clockLoading = false; };
          }}>
            <input type="hidden" name="location" value={location} />
            <div class="clock-actions">
              <button formaction="?/clockIn"  class="btn-clock-in"
                disabled={clockLoading || !!today?.clock_in_time}>
                {today?.clock_in_time ? '✓ Clocked In' : '⏵ Clock In'}
              </button>
              <button formaction="?/clockOut" class="btn-clock-out"
                disabled={clockLoading || !today?.clock_in_time || !!today?.clock_out_time}>
                {today?.clock_out_time ? '✓ Done' : '⏹ Clock Out'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Leave Balances -->
      <div class="card section">
        <div class="card-header">
          <span class="card-title">📊 Leave Balances</span>
          <span class="text-xs text-gray">{new Date().getFullYear()}</span>
        </div>
        <div class="card-body">
          {#if balances.length === 0}
            <div class="empty-state"><p>No balances found. Contact HR.</p></div>
          {:else}
            {#each balances as b}
              <div class="balance-item">
                <div class="balance-header">
                  <span class="balance-name">{b.name}</span>
                  <span class="balance-fraction">
                    <strong class="balance-used">{b.used_days}</strong>
                    <span class="text-gray"> / {b.allocated_days} days</span>
                  </span>
                </div>
                <div class="balance-bar">
                  <div class="balance-fill {Number(b.used_days)/Number(b.allocated_days) > 0.75 ? 'warn' : ''}"
                    style="width:{Math.min(100,(b.used_days/b.allocated_days)*100)}%">
                  </div>
                </div>
                <div class="balance-remaining">
                  <span class="remaining-num">{b.remaining_days}</span>
                  <span class="remaining-lbl"> days remaining</span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

    </div>

    <!-- RIGHT: Apply Leave Form -->
    <div class="col-right">
      <div class="card" style="height:fit-content">
        <div class="card-header">
          <span class="card-title">📝 Apply for Leave</span>
        </div>
        <div class="card-body">

          {#if form?.errors?.general}
            <div class="alert alert-error">{form.errors.general}</div>
          {/if}

          <form method="POST" action="?/applyLeave" enctype="multipart/form-data"
            use:enhance={() => {
              leaveLoading = true;
              leaveErrors  = {};
              return async ({ update }) => { await update(); leaveLoading = false; };
            }}
          >
            <div class="form-group">
              <label class="form-label" for="lt">Leave Type <span class="req">*</span></label>
              <select id="lt" name="leave_type_id" class="form-control"
                class:input-err={leaveErrors.leave_type_id}>
                <option value="" disabled selected>Select leave type…</option>
                {#each leaveTypes as lt}
                  <option value={lt.id}>{lt.name}</option>
                {/each}
              </select>
              {#if leaveErrors.leave_type_id}
                <p class="form-error">{leaveErrors.leave_type_id}</p>
              {/if}
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="sd">Start Date <span class="req">*</span></label>
                <input id="sd" name="start_date" type="date" class="form-control"
                  class:input-err={leaveErrors.start_date}
                  min={new Date().toISOString().split('T')[0]} />
                {#if leaveErrors.start_date}<p class="form-error">{leaveErrors.start_date}</p>{/if}
              </div>
              <div class="form-group">
                <label class="form-label" for="ed">End Date <span class="req">*</span></label>
                <input id="ed" name="end_date" type="date" class="form-control"
                  class:input-err={leaveErrors.end_date}
                  min={new Date().toISOString().split('T')[0]} />
                {#if leaveErrors.end_date}<p class="form-error">{leaveErrors.end_date}</p>{/if}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reason">Reason <span class="req">*</span></label>
              <textarea id="reason" name="reason" class="form-control"
                class:input-err={leaveErrors.reason}
                placeholder="Briefly describe the reason for your leave…"
                rows="3"></textarea>
              {#if leaveErrors.reason}<p class="form-error">{leaveErrors.reason}</p>{/if}
            </div>

            <div class="form-group">
              <label class="form-label">Attachment <span class="text-xs text-gray">(optional)</span></label>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="file-upload" on:click={() => document.getElementById('att').click()}>
                <input id="att" name="attachment" type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  on:change={handleFile} />
                <div class="file-upload-icon">📎</div>
                <div class="file-upload-text">Click to browse or drag & drop</div>
                <div class="file-upload-hint">PDF, DOC, DOCX, JPG, PNG, WEBP — max 5 MB</div>
                {#if fileLabel}<div class="file-selected">✓ {fileLabel}</div>{/if}
              </div>
              {#if leaveErrors.attachment}<p class="form-error">{leaveErrors.attachment}</p>{/if}
            </div>

            <button type="submit" class="btn btn-primary w-full" style="border-radius:12px;height:46px"
              disabled={leaveLoading}>
              {#if leaveLoading}
                <span class="spinner-sm"></span> Submitting…
              {:else}
                Submit Application →
              {/if}
            </button>
          </form>
        </div>
      </div>
    </div>

  </div>

  <!-- Recent Requests Table -->
  <div class="card section">
    <div class="card-header">
      <span class="card-title">📋 Recent Leave Requests</span>
    </div>
    <div class="table-wrapper">
      {#if requests.length === 0}
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>No leave requests yet. Use the form above to apply.</p>
        </div>
      {:else}
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Duration</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Attachment</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {#each requests as r}
              <tr>
                <td class="td-name">{r.leave_type}</td>
                <td><span class="dur-badge">{r.duration_days}d</span></td>
                <td class="text-sm">{fmtDate(r.start_date)}<br/><span class="text-gray">→ {fmtDate(r.end_date)}</span></td>
                <td class="text-sm" style="max-width:180px" title={r.reason}>
                  {r.reason.length > 50 ? r.reason.slice(0,50)+'…' : r.reason}
                </td>
                <td>
                  {#if r.attachment_url}
                    <span class="badge badge-approved">📎 Yes</span>
                  {:else}
                    <span class="text-gray text-xs">—</span>
                  {/if}
                </td>
                <td><Badge value={r.status} /></td>
                <td class="text-sm text-gray">{fmtDate(r.created_at)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>

</div>

<style>
  .ph-left  { flex: 1; }
  .ph-right { display: flex; align-items: center; }
  .page-header { display: flex; align-items: center; justify-content: space-between; }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 28px;
  }

  .col-left, .col-right { display: flex; flex-direction: column; gap: 20px; }

  /* Attendance */
  .att-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 18px;
    margin-bottom: 4px;
  }

  .att-item {
    background: rgba(99,102,241,0.04);
    border: 1px solid rgba(99,102,241,0.08);
    border-radius: 10px;
    padding: 10px 13px;
  }

  .att-lbl { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray-400); margin-bottom: 3px; }
  .att-val { display: block; font-size: 0.9375rem; font-weight: 700; color: var(--gray-800); }
  .att-val.success { color: var(--success); }

  /* Leave balances */
  .balance-item { margin-bottom: 18px; }
  .balance-item:last-child { margin-bottom: 0; }

  .balance-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .balance-name   { font-size: 0.875rem; font-weight: 700; color: var(--gray-800); }
  .balance-fraction { font-size: 0.8125rem; }
  .balance-used   { color: var(--primary); }

  .balance-bar  { height: 7px; background: rgba(0,0,0,0.06); border-radius: 100px; overflow: hidden; margin-bottom: 5px; }
  .balance-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--violet)); border-radius: 100px; transition: width 0.5s ease; }
  .balance-fill.warn { background: linear-gradient(90deg, var(--warning), var(--danger)); }

  .balance-remaining { font-size: 0.75rem; color: var(--gray-400); }
  .remaining-num     { font-weight: 800; color: var(--success); font-size: 0.875rem; }

  /* Duration badge in table */
  .dur-badge {
    background: var(--primary-light);
    color: var(--primary);
    font-size: 0.75rem;
    font-weight: 800;
    padding: 3px 9px;
    border-radius: 100px;
  }

  .req { color: var(--danger); }
  .input-err { border-color: var(--danger) !important; }

  .spinner-sm {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 920px) {
    .two-col { grid-template-columns: 1fr; }
  }
</style>
