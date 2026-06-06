<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast.js';
  import Badge from '$lib/components/Badge.svelte';

  export let data;
  export let form;

  $: users       = data.users ?? [];
  $: departments = data.departments ?? [];
  $: leaveTypes  = data.leaveTypes ?? [];

  let activeTab = 'users';
  let showNewUser  = false;
  let showNewDept  = false;
  let showNewLT    = false;
  let editingUser  = null;
  let editingLT    = null;

  $: if (form?.success) {
    const msgs = {
      createUser:    'User created successfully.',
      toggleUser:    'User status updated.',
      editUser:      'User updated.',
      createDept:    'Department created.',
      deleteDept:    'Department deleted.',
      createLeaveType: 'Leave type created.',
      editLeaveType:   'Leave type updated.',
      toggleLeaveType: 'Leave type status toggled.'
    };
    addToast(msgs[form.action] ?? 'Done!', 'success');
    showNewUser = false; showNewDept = false; showNewLT = false;
    editingUser = null; editingLT = null;
    if (form.tab) activeTab = form.tab;
    invalidateAll();
  }

  $: if (form?.userError)  addToast(form.userError, 'error');
  $: if (form?.deptError)  addToast(form.deptError, 'error');
  $: if (form?.ltError)    addToast(form.ltError,   'error');

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const ROLES = ['employee', 'manager', 'hr_admin'];
</script>

<svelte:head><title>Admin Settings — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">Admin Settings</h1>
  <p class="page-subtitle">Manage users, departments, and leave configurations</p>
</div>

<div class="page-body">

  <!-- Tabs -->
  <div class="tabs">
    {#each [['users','👥 User Management'],['departments','🏗 Departments'],['leaveTypes','📋 Leave Types']] as [id,label]}
      <button class="tab-btn" class:active={activeTab === id} on:click={() => activeTab = id}>
        {label}
      </button>
    {/each}
  </div>

  <!-- ==================== USER MANAGEMENT ==================== -->
  {#if activeTab === 'users'}
    <div class="card">
      <div class="card-header">
        <span class="card-title">Active System Accounts</span>
        <button class="btn btn-primary btn-sm" on:click={() => showNewUser = !showNewUser}>
          {showNewUser ? '✕ Cancel' : '+ New User'}
        </button>
      </div>

      {#if showNewUser}
        <div class="inline-form">
          <h3 class="if-title">Create New User</h3>
          <form method="POST" action="?/createUser" use:enhance={() => ({ async update(r) { await r.update(); } })}>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Full Name <span class="req">*</span></label>
                <input name="name" type="text" class="form-control" placeholder="Jane Smith" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email <span class="req">*</span></label>
                <input name="email" type="email" class="form-control" placeholder="jane@company.com" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Role <span class="req">*</span></label>
                <select name="role" class="form-control" required>
                  <option value="" disabled selected>Select role…</option>
                  {#each ROLES as r}
                    <option value={r}>{r === 'hr_admin' ? 'HR Admin' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  {/each}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Department</label>
                <select name="department" class="form-control">
                  <option value="">— None —</option>
                  {#each departments as d}
                    <option value={d.name}>{d.name}</option>
                  {/each}
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Temporary Password <span class="req">*</span></label>
              <input name="password" type="password" class="form-control" placeholder="Min. 8 characters" minlength="8" required />
            </div>
            <button type="submit" class="btn btn-primary">Create User</button>
          </form>
        </div>
      {/if}

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Code</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each users as u}
              {#if editingUser?.id === u.id}
                <tr class="edit-row">
                  <td colspan="7">
                    <form method="POST" action="?/editUser" class="edit-form" use:enhance={() => ({ async update(r) { await r.update(); } })}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <input name="name"       type="text"   class="form-control" value={u.name}       required />
                      <select name="role"      class="form-control" required>
                        {#each ROLES as r}
                          <option value={r} selected={u.role === r}>{r}</option>
                        {/each}
                      </select>
                      <select name="department" class="form-control">
                        <option value="">— None —</option>
                        {#each departments as d}
                          <option value={d.name} selected={u.department === d.name}>{d.name}</option>
                        {/each}
                      </select>
                      <button type="submit" class="btn btn-success btn-sm">Save</button>
                      <button type="button" class="btn btn-ghost btn-sm" on:click={() => editingUser = null}>Cancel</button>
                    </form>
                  </td>
                </tr>
              {:else}
                <tr>
                  <td>
                    <div class="td-name">{u.name}</div>
                    <div class="td-meta">{u.email}</div>
                  </td>
                  <td class="font-semibold text-sm">{u.employee_code}</td>
                  <td class="text-sm">{u.department ?? '—'}</td>
                  <td><Badge value={u.role} type="role" /></td>
                  <td>
                    <span class="badge {u.is_active ? 'badge-approved' : 'badge-rejected'}">
                      <span class="dot"></span>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td class="text-sm text-gray">{fmtDate(u.created_at)}</td>
                  <td>
                    <div class="row-actions">
                      <button class="btn btn-ghost btn-sm" on:click={() => editingUser = u}>Edit</button>
                      <form method="POST" action="?/toggleUser" use:enhance={() => ({ async update(r) { await r.update(); } })}>
                        <input type="hidden" name="user_id" value={u.id} />
                        <button type="submit" class="btn btn-sm {u.is_active ? 'btn-danger' : 'btn-success'}">
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- ==================== DEPARTMENTS ==================== -->
  {#if activeTab === 'departments'}
    <div class="card">
      <div class="card-header">
        <span class="card-title">Company Departments</span>
        <button class="btn btn-primary btn-sm" on:click={() => showNewDept = !showNewDept}>
          {showNewDept ? '✕ Cancel' : '+ Add Department'}
        </button>
      </div>

      {#if showNewDept}
        <div class="inline-form">
          <h3 class="if-title">New Department</h3>
          <form method="POST" action="?/createDept" use:enhance={() => ({ async update(r) { await r.update(); } })}>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Department Name <span class="req">*</span></label>
                <input name="name" type="text" class="form-control" placeholder="e.g. Engineering" required />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <input name="description" type="text" class="form-control" placeholder="Brief description" />
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Add Department</button>
          </form>
        </div>
      {/if}

      <div class="table-wrapper">
        {#if departments.length === 0}
          <div class="empty-state"><p>No departments yet.</p></div>
        {:else}
          <table>
            <thead>
              <tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {#each departments as d}
                <tr>
                  <td class="td-name">{d.name}</td>
                  <td class="text-sm text-gray">{d.description ?? '—'}</td>
                  <td>
                    <span class="badge {d.is_active ? 'badge-approved' : 'badge-rejected'}">
                      <span class="dot"></span>{d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <form method="POST" action="?/deleteDept" use:enhance={() => ({ async update(r) { await r.update(); } })}>
                      <input type="hidden" name="dept_id" value={d.id} />
                      <button type="submit" class="btn btn-danger btn-sm"
                        on:click|preventDefault={(e) => { if (confirm(`Delete "${d.name}"?`)) e.currentTarget.closest('form').submit(); }}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    </div>
  {/if}

  <!-- ==================== LEAVE TYPES ==================== -->
  {#if activeTab === 'leaveTypes'}
    <div class="card">
      <div class="card-header">
        <span class="card-title">Leave Type Configuration</span>
        <button class="btn btn-primary btn-sm" on:click={() => showNewLT = !showNewLT}>
          {showNewLT ? '✕ Cancel' : '+ Add Leave Type'}
        </button>
      </div>

      {#if showNewLT}
        <div class="inline-form">
          <h3 class="if-title">New Leave Type</h3>
          <form method="POST" action="?/createLeaveType" use:enhance={() => ({ async update(r) { await r.update(); } })}>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Name <span class="req">*</span></label>
                <input name="name" type="text" class="form-control" placeholder="e.g. Paternity Leave" required />
              </div>
              <div class="form-group">
                <label class="form-label">Max Days / Year <span class="req">*</span></label>
                <input name="max_days" type="number" class="form-control" placeholder="15" min="1" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input name="description" type="text" class="form-control" placeholder="Short description" />
            </div>
            <button type="submit" class="btn btn-primary">Create Leave Type</button>
          </form>
        </div>
      {/if}

      <div class="table-wrapper">
        {#if leaveTypes.length === 0}
          <div class="empty-state"><p>No leave types configured.</p></div>
        {:else}
          <table>
            <thead>
              <tr><th>Leave Type</th><th>Max Days/Year</th><th>Description</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {#each leaveTypes as lt}
                <tr>
                  <td class="td-name">{lt.name}</td>
                  <td>
                    {#if editingLT === lt.id}
                      <form method="POST" action="?/editLeaveType" style="display:flex;gap:6px"
                        use:enhance={() => ({ async update(r) { await r.update(); } })}>
                        <input type="hidden" name="lt_id" value={lt.id} />
                        <input name="max_days" type="number" class="form-control" style="width:80px" value={lt.max_allocation_days} min="1" required />
                        <button type="submit" class="btn btn-success btn-sm">✓</button>
                        <button type="button" class="btn btn-ghost btn-sm" on:click={() => editingLT = null}>✕</button>
                      </form>
                    {:else}
                      <span class="font-bold">{lt.max_allocation_days}</span>
                      <span class="text-gray text-xs"> days</span>
                    {/if}
                  </td>
                  <td class="text-sm text-gray">{lt.description ?? '—'}</td>
                  <td>
                    <span class="badge {lt.is_active ? 'badge-approved' : 'badge-rejected'}">
                      <span class="dot"></span>{lt.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button class="btn btn-ghost btn-sm" on:click={() => editingLT = lt.id}>Edit Days</button>
                      <form method="POST" action="?/toggleLeaveType" use:enhance={() => ({ async update(r) { await r.update(); } })}>
                        <input type="hidden" name="lt_id" value={lt.id} />
                        <button type="submit" class="btn btn-sm {lt.is_active ? 'btn-danger' : 'btn-success'}">
                          {lt.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    </div>
  {/if}

</div>

<style>
  .inline-form {
    padding: 20px 24px;
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
  }
  .if-title { font-size: 0.9375rem; font-weight: 700; color: var(--gray-800); margin-bottom: 14px; }
  .req { color: var(--danger); }
  .row-actions { display: flex; gap: 6px; }
  .edit-row td { padding: 12px 16px; background: var(--primary-50); }
  .edit-form { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .edit-form .form-control { flex: 1; min-width: 100px; }
</style>
