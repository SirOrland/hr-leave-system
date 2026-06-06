<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast.js';
  import Badge from '$lib/components/Badge.svelte';

  export let data;
  export let form;

  $: requests = data.requests ?? [];
  $: metrics  = data.metrics  ?? {};

  let filter = 'Pending';
  let remarksMap = {};
  let processing = {};

  $: filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  $: if (form?.success) {
    addToast(form.action === 'approve' ? 'Leave request approved.' : 'Leave request declined.', 'success');
    invalidateAll();
  }
  $: if (form?.error) addToast(form.error, 'error');

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];
  const METRIC_STYLES = ['yellow', 'green', 'red', 'purple'];
  const METRIC_ICONS  = ['⏳', '✅', '✕', '📋'];
</script>

<svelte:head><title>Approval Hub — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">Approval <span class="gradient-text">Hub</span></h1>
  <p class="page-subtitle">Review and process employee leave requests</p>
</div>

<div class="page-body">

  <!-- Metric Cards -->
  <div class="metrics-grid">
    {#each [
      ['Pending',  metrics.pending  ?? 0],
      ['Approved', metrics.approved ?? 0],
      ['Rejected', metrics.rejected ?? 0],
      ['Total',    requests.length  ]
    ] as [label, val], i}
      <button
        class="metric-card {METRIC_STYLES[i]}"
        class:ring={filter === label}
        on:click={() => filter = label === 'Total' ? 'All' : label}
      >
        <div class="metric-icon">{METRIC_ICONS[i]}</div>
        <div class="metric-info">
          <div class="metric-value">{val}</div>
          <div class="metric-label">{label} Requests</div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Filter Tabs -->
  <div class="tabs">
    {#each FILTERS as f}
      <button class="tab-btn" class:active={filter === f} on:click={() => filter = f}>
        {f}
        {#if f !== 'All'}
          <span class="tab-cnt">{metrics[f.toLowerCase()] ?? 0}</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Requests Table -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">Leave Requests — {filter}</span>
      <span class="text-sm text-gray">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="table-wrapper">
      {#if filtered.length === 0}
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>No {filter.toLowerCase()} requests.</p>
        </div>
      {:else}
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Docs</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as r}
              <tr>
                <td>
                  <div class="emp-row">
                    <div class="emp-avatar">{r.employee_name.charAt(0)}</div>
                    <div>
                      <div class="td-name">{r.employee_name}</div>
                      <div class="td-meta">{r.employee_code} · {r.department}</div>
                    </div>
                  </div>
                </td>
                <td class="text-sm font-semibold">{r.leave_type}</td>
                <td>
                  <span class="dur-pill">{r.duration_days}d</span>
                </td>
                <td class="text-sm">
                  {fmtDate(r.start_date)}<br/>
                  <span class="text-gray">→ {fmtDate(r.end_date)}</span>
                </td>
                <td class="text-sm" style="max-width:150px" title={r.reason}>
                  {r.reason.length > 48 ? r.reason.slice(0,48)+'…' : r.reason}
                </td>
                <td>
                  {#if r.attachment_url}
                    <span class="badge badge-approved">📎</span>
                  {:else}
                    <span class="text-gray text-xs">—</span>
                  {/if}
                </td>
                <td><Badge value={r.status} /></td>
                <td class="text-sm text-gray">{fmtDate(r.created_at)}</td>
                <td>
                  {#if r.status === 'Pending'}
                    <div class="action-wrap">
                      <form method="POST" use:enhance={() => {
                        processing[r.id] = true;
                        return async ({ update }) => { await update(); processing[r.id] = false; };
                      }}>
                        <input type="hidden" name="request_id" value={r.id} />
                        <input type="hidden" name="remarks"    value={remarksMap[r.id] ?? ''} />
                        <div class="action-btns">
                          <button formaction="?/approve" class="btn btn-success btn-sm"
                            disabled={processing[r.id]}>✓</button>
                          <button formaction="?/reject"  class="btn btn-danger btn-sm"
                            disabled={processing[r.id]}>✕</button>
                        </div>
                      </form>
                      <input type="text" class="form-control remarks-input"
                        placeholder="Remarks…"
                        bind:value={remarksMap[r.id]} />
                    </div>
                  {:else}
                    <span class="text-gray text-xs">Processed</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>

</div>

<style>
  .metric-card { border: none; cursor: pointer; text-align: left; }
  .metric-card.ring { box-shadow: 0 0 0 3px white, 0 0 0 5px rgba(255,255,255,0.5), 0 8px 24px rgba(0,0,0,0.2) !important; }

  .tab-cnt {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 100px;
    background: rgba(255,255,255,0.3);
    font-size: 0.6875rem;
    font-weight: 800;
    margin-left: 6px;
  }

  .tab-btn.active .tab-cnt { background: rgba(255,255,255,0.35); }
  .tab-btn:not(.active) .tab-cnt { background: rgba(0,0,0,0.08); color: var(--gray-500); }

  .emp-row { display: flex; align-items: center; gap: 10px; }

  .emp-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: white;
    font-size: 0.8125rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .dur-pill {
    background: rgba(99,102,241,0.1);
    color: var(--primary);
    font-size: 0.75rem;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 100px;
    border: 1px solid rgba(99,102,241,0.15);
  }

  .action-wrap { display: flex; flex-direction: column; gap: 6px; min-width: 160px; }
  .action-btns { display: flex; gap: 6px; }

  .remarks-input { font-size: 0.75rem; padding: 5px 10px; border-radius: 8px; }
</style>
