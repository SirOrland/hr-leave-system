<script>
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast.js';
  import Badge from '$lib/components/Badge.svelte';

  export let data;
  export let form;

  $: records = data.records ?? [];
  $: stats   = data.stats   ?? {};
  $: date    = data.date;

  let editingId = null;
  let editData  = {};

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
  <h1 class="page-title">Attendance <span class="gradient-text">Monitor</span></h1>
  <p class="page-subtitle">Audit and manage daily time records across all employees</p>
</div>

<div class="page-body">

  <!-- Controls + Summary -->
  <div class="att-controls">
    <div class="date-wrap">
      <label class="form-label" for="dp" style="margin-bottom:6px">Select Date</label>
      <input
        id="dp"
        type="date"
        class="form-control"
        style="width:200px"
        value={date}
        max={new Date().toISOString().split('T')[0]}
        on:change={(e) => goto(`?date=${e.target.value}`)}
      />
    </div>

    <div class="stat-pills">
      {#each [
        ['Present', stats.present ?? 0, 'green',  '#10B981'],
        ['Late',    stats.late    ?? 0, 'yellow', '#F59E0B'],
        ['Absent',  stats.absent  ?? 0, 'red',    '#EF4444'],
        ['Total',   stats.total   ?? 0, 'indigo', '#6366F1']
      ] as [label, val, cls, color]}
        <div class="stat-pill" style="--color:{color}">
          <span class="stat-num">{val}</span>
          <span class="stat-lbl">{label}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Records Table -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">
        Records — {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
                    <div class="emp-cell">
                      <div class="emp-av">{r.employee_name.charAt(0)}</div>
                      <div>
                        <div class="td-name">{r.employee_name}</div>
                        <div class="td-meta">{r.employee_code}</div>
                      </div>
                    </div>
                  </td>
                  <td colspan="5">
                    <form method="POST" action="?/updateRecord" class="edit-form"
                      use:enhance={() => ({ async update(res) { await res.update(); } })}>
                      <input type="hidden" name="record_id" value={r.id} />
                      <div class="ef-field">
                        <label class="form-label" for="ci-{r.id}">Clock In</label>
                        <input id="ci-{r.id}" type="datetime-local" name="clock_in" class="form-control" bind:value={editData.clock_in} />
                      </div>
                      <div class="ef-field">
                        <label class="form-label" for="co-{r.id}">Clock Out</label>
                        <input id="co-{r.id}" type="datetime-local" name="clock_out" class="form-control" bind:value={editData.clock_out} />
                      </div>
                      <div class="ef-field">
                        <label class="form-label" for="st-{r.id}">Status</label>
                        <select id="st-{r.id}" name="status" class="form-control" bind:value={editData.status}>
                          {#each STATUSES as s}<option value={s}>{s}</option>{/each}
                        </select>
                      </div>
                      <div class="ef-field" style="flex:2">
                        <label class="form-label" for="lo-{r.id}">Location</label>
                        <input id="lo-{r.id}" type="text" name="location" class="form-control" bind:value={editData.location} />
                      </div>
                      <div class="ef-btns">
                        <button type="submit" class="btn btn-success btn-sm">✓ Save</button>
                        <button type="button" class="btn btn-ghost btn-sm" on:click={() => editingId = null}>Cancel</button>
                      </div>
                    </form>
                  </td>
                  <td></td>
                </tr>
              {:else}
                <tr>
                  <td>
                    <div class="emp-cell">
                      <div class="emp-av">{r.employee_name.charAt(0)}</div>
                      <div>
                        <div class="td-name">{r.employee_name}</div>
                        <div class="td-meta">{r.employee_code} · {r.department ?? '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="time-badge in">{fmt(r.clock_in_time)}</span>
                  </td>
                  <td>
                    <span class="time-badge out">{fmt(r.clock_out_time)}</span>
                  </td>
                  <td>
                    <span class="dur-badge">{duration(r.clock_in_time, r.clock_out_time)}</span>
                  </td>
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
  .att-controls {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .stat-pills {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .stat-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 22px;
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border-top: 3px solid var(--color);
    min-width: 80px;
  }

  .stat-num {
    font-size: 1.75rem;
    font-weight: 900;
    color: var(--color);
    line-height: 1;
    margin-bottom: 3px;
    letter-spacing: -0.02em;
  }

  .stat-lbl {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--gray-400);
  }

  /* Employee cell */
  .emp-cell { display: flex; align-items: center; gap: 10px; }

  .emp-av {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: white;
    font-size: 0.875rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* Time badges */
  .time-badge {
    font-size: 0.875rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 8px;
  }

  .time-badge.in  { background: rgba(16,185,129,0.1); color: #047857; }
  .time-badge.out { background: rgba(239,68,68,0.1);  color: #B91C1C; }

  .dur-badge {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--gray-600);
    background: rgba(0,0,0,0.04);
    padding: 3px 10px;
    border-radius: 8px;
  }

  /* Edit row */
  .edit-row td { background: rgba(99,102,241,0.03); }

  .edit-form {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-wrap: wrap;
    padding: 8px 0;
  }

  .ef-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 130px; }
  .ef-btns  { display: flex; gap: 6px; align-items: flex-end; padding-bottom: 1px; }
</style>
