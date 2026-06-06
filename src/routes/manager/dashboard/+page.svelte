<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast.js';
  import Badge from '$lib/components/Badge.svelte';

  export let data;
  export let form;

  $: requests = data.requests ?? [];
  $: metrics  = data.metrics ?? {};

  let filter = 'Pending';
  let remarksMap = {};
  let processing = {};

  $: filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  $: if (form?.success) {
    const msg = form.action === 'approve' ? 'Leave request approved.' : 'Leave request declined.';
    addToast(msg, 'success');
    invalidateAll();
  }
  $: if (form?.error) addToast(form.error, 'error');

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];
</script>

<svelte:head><title>Approval Hub — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">Approval Hub</h1>
  <p class="page-subtitle">Review and process employee leave requests</p>
</div>

<div class="page-body">

  <!-- Metrics -->
  <div class="metrics-grid">
    <div class="metric-card" style="cursor:pointer" on:click={() => filter='Pending'} on:keydown>
      <div class="metric-icon yellow">⏳</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.pending ?? 0}</div>
        <div class="metric-label">Pending</div>
      </div>
    </div>
    <div class="metric-card" style="cursor:pointer" on:click={() => filter='Approved'} on:keydown>
      <div class="metric-icon green">✅</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.approved ?? 0}</div>
        <div class="metric-label">Approved</div>
      </div>
    </div>
    <div class="metric-card" style="cursor:pointer" on:click={() => filter='Rejected'} on:keydown>
      <div class="metric-icon red">✕</div>
      <div class="metric-info">
        <div class="metric-value">{metrics.rejected ?? 0}</div>
        <div class="metric-label">Rejected</div>
      </div>
    </div>
    <div class="metric-card" style="cursor:pointer" on:click={() => filter='All'} on:keydown>
      <div class="metric-icon purple">📋</div>
      <div class="metric-info">
        <div class="metric-value">{requests.length}</div>
        <div class="metric-label">Total Requests</div>
      </div>
    </div>
  </div>

  <!-- Filter Tabs -->
  <div class="tabs">
    {#each FILTERS as f}
      <button class="tab-btn" class:active={filter === f} on:click={() => filter = f}>
        {f}
        {#if f !== 'All'}
          <span class="tab-count">{metrics[f.toLowerCase()] ?? 0}</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Leave Requests Table -->
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
              <th>Attachment</th>
              <th>Status</th>
              <th>Submitted</th>
              {#if filter === 'Pending' || filter === 'All'}
                <th>Actions</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each filtered as r}
              <tr>
                <td>
                  <div class="td-name">{r.employee_name}</div>
                  <div class="td-meta">{r.employee_code} · {r.department}</div>
                </td>
                <td>{r.leave_type}</td>
                <td>{r.duration_days} day{r.duration_days > 1 ? 's' : ''}</td>
                <td class="text-sm">{fmtDate(r.start_date)}<br/>{fmtDate(r.end_date)}</td>
                <td class="text-sm" style="max-width:160px" title={r.reason}>
                  {r.reason.length > 55 ? r.reason.slice(0, 55) + '…' : r.reason}
                </td>
                <td>
                  {#if r.attachment_url}
                    <span class="badge badge-approved">📎 Yes</span>
                  {:else}
                    <span class="text-gray text-xs">None</span>
                  {/if}
                </td>
                <td><Badge value={r.status} /></td>
                <td class="text-sm text-gray">{fmtDate(r.created_at)}</td>
                {#if filter === 'Pending' || filter === 'All'}
                  <td>
                    {#if r.status === 'Pending'}
                      <div class="action-cell">
                        <form method="POST" use:enhance={() => {
                          processing[r.id] = true;
                          return async ({ update }) => { await update(); processing[r.id] = false; };
                        }}>
                          <input type="hidden" name="request_id" value={r.id} />
                          <input type="hidden" name="remarks"    value={remarksMap[r.id] ?? ''} />
                          <div class="action-btns">
                            <button formaction="?/approve" class="btn btn-success btn-sm"
                              disabled={processing[r.id]}>
                              ✓ Approve
                            </button>
                            <button formaction="?/reject"  class="btn btn-danger btn-sm"
                              disabled={processing[r.id]}>
                              ✕ Decline
                            </button>
                          </div>
                        </form>
                        <input
                          type="text"
                          class="form-control remarks-input"
                          placeholder="Add remarks…"
                          bind:value={remarksMap[r.id]}
                        />
                      </div>
                    {:else}
                      <span class="text-gray text-xs">Processed</span>
                    {/if}
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>

</div>

<style>
  .tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 100px;
    background: var(--gray-200);
    font-size: 0.6875rem;
    font-weight: 700;
    margin-left: 6px;
  }

  .tab-btn.active .tab-count {
    background: var(--primary-light);
    color: var(--primary);
  }

  .action-cell { display: flex; flex-direction: column; gap: 6px; min-width: 180px; }
  .action-btns { display: flex; gap: 6px; }

  .remarks-input {
    font-size: 0.75rem;
    padding: 5px 8px;
    border-radius: 4px;
  }
</style>
