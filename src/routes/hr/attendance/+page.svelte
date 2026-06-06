<script>
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast.js';
  import Badge from '$lib/components/Badge.svelte';

  export let data;
  export let form;

  $: records = data.records ?? [];
  $: stats   = data.stats ?? {};
  $: date    = data.date;

  let editingId  = null;
  let editData   = {};

  $: if (form?.success) {
    addToast('Attendance record updated.', 'success');
    editingId = null;
    invalidateAll();
  }
  $: if (form?.error) addToast(form.error, 'error');

  function startEdit(r) {
    editingId = r.id;
    editData = {
      clock_in:  r.clock_in_time  ? new Date(r.clock_in_time).toISOString().slice(0,16)  : '',
      clock_out: r.clock_out_time ? new Date(r.clock_out_time).toISOString().slice(0,16) : '',
      status:    r.status,
      location:  r.location ?? ''
    };
  }

  function fmt(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function duration(i, o) {
    if (!i || !o) return '—';
    const mins = Math.round((new Date(o) - new Date(i)) / 60_000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  const STATUSES = ['Present', 'Late', 'Absent', 'Half Day'];
</script>

<svelte:head><title>Attendance Monitor — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">Attendance Monitoring</h1>
  <p class="page-subtitle">Audit and manage daily time records across all employees</p>
</div>

<div class="page-body">

  <!-- Date Selector + Stats -->
  <div class="att-header">
    <div class="date-picker-wrap">
      <label class="form-label" for="date-pick">View Date</label>
      <input
        id="date-pick"
        type="date"
        class="form-control date-input"
        value={date}
        max={new Date().toISOString().split('T')[0]}
        on:change={(e) => goto(`?date=${e.target.value}`)}
      />
    </div>

    <div class="att-stats">
      <div class="att-stat">
        <span class="att-stat-num green">{stats.present ?? 0}</span>
        <span class="att-stat-lbl">Present</span>
      </div>
      <div class="att-stat">
        <span class="att-stat-num yellow">{stats.late ?? 0}</span>
        <span class="att-stat-lbl">Late</span>
      </div>
      <div class="att-stat">
        <span class="att-stat-num red">{stats.absent ?? 0}</span>
        <span class="att-stat-lbl">Absent</span>
      </div>
      <div class="att-stat">
        <span class="att-stat-num blue">{stats.total ?? 0}</span>
        <span class="att-stat-lbl">Total</span>
      </div>
    </div>
  </div>

  <!-- Records Table -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">
        Daily Time Records —
        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </span>
      <span class="text-sm text-gray">{records.length} record{records.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="table-wrapper">
      {#if records.length === 0}
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>No attendance records for this date.</p>
        </div>
      {:else}
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each records as r}
              {#if editingId === r.id}
                <tr class="edit-row">
                  <td>
                    <div class="td-name">{r.employee_name}</div>
                    <div class="td-meta">{r.employee_code}</div>
                  </td>
                  <td colspan="5">
                    <form method="POST" action="?/updateRecord" class="edit-form"
                      use:enhance={() => ({ async update(res) { await res.update(); } })}>
                      <input type="hidden" name="record_id" value={r.id} />
                      <div class="ef-group">
                        <label class="form-label">Clock In</label>
                        <input type="datetime-local" name="clock_in" class="form-control" bind:value={editData.clock_in} />
                      </div>
                      <div class="ef-group">
                        <label class="form-label">Clock Out</label>
                        <input type="datetime-local" name="clock_out" class="form-control" bind:value={editData.clock_out} />
                      </div>
                      <div class="ef-group">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-control" bind:value={editData.status}>
                          {#each STATUSES as s}
                            <option value={s}>{s}</option>
                          {/each}
                        </select>
                      </div>
                      <div class="ef-group" style="flex:2">
                        <label class="form-label">Location</label>
                        <input type="text" name="location" class="form-control" bind:value={editData.location} />
                      </div>
                      <div class="ef-group" style="margin-top:auto">
                        <button type="submit" class="btn btn-success btn-sm">Save</button>
                        <button type="button" class="btn btn-ghost btn-sm" on:click={() => editingId = null}>Cancel</button>
                      </div>
                    </form>
                  </td>
                  <td></td>
                </tr>
              {:else}
                <tr>
                  <td>
                    <div class="td-name">{r.employee_name}</div>
                    <div class="td-meta">{r.employee_code} · {r.department ?? '—'}</div>
                  </td>
                  <td class="font-semibold">{fmt(r.clock_in_time)}</td>
                  <td class="font-semibold">{fmt(r.clock_out_time)}</td>
                  <td class="text-sm">{duration(r.clock_in_time, r.clock_out_time)}</td>
                  <td><Badge value={r.status} /></td>
                  <td class="text-sm text-gray">{r.location ?? '—'}</td>
                  <td>
                    <button class="btn btn-ghost btn-sm" on:click={() => startEdit(r)}>✎ Edit</button>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>

</div>

<style>
  .att-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .date-input { width: 180px; }

  .att-stats {
    display: flex;
    gap: 20px;
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 12px 24px;
    box-shadow: var(--shadow-sm);
  }

  .att-stat { text-align: center; }

  .att-stat-num {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 2px;
  }
  .att-stat-num.green  { color: var(--success); }
  .att-stat-num.yellow { color: var(--warning); }
  .att-stat-num.red    { color: var(--danger); }
  .att-stat-num.blue   { color: var(--info); }
  .att-stat-lbl { font-size: 0.75rem; color: var(--gray-400); font-weight: 500; }

  .edit-row { background: var(--primary-50) !important; }
  .edit-form { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-start; }
  .ef-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 120px; }
  .ef-group:last-child { flex-direction: row; align-items: flex-end; gap: 6px; }
</style>
