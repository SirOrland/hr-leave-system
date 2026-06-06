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

  let activeTab   = 'users';
  let showNewUser = false;
  let showNewDept = false;
  let showNewLT   = false;
  let editingUser = null;
  let editingLT   = null;

  $: if (form?.success) {
    const msgs = {
      createUser: 'User created successfully.',      toggleUser: 'User status updated.',
      editUser:   'User updated.',                   createDept: 'Department created.',
      deleteDept: 'Department deleted.',             createLeaveType: 'Leave type created.',
      editLeaveType: 'Leave type updated.',          toggleLeaveType: 'Leave type toggled.'
    };
    addToast(msgs[form.action] ?? 'Done!', 'success');
    showNewUser = false; showNewDept = false; showNewLT = false;
    editingUser = null; editingLT = null;
    if (form.tab) activeTab = form.tab;
    invalidateAll();
  }

  $: if (form?.userError) addToast(form.userError, 'error');
  $: if (form?.deptError) addToast(form.deptError, 'error');
  $: if (form?.ltError)   addToast(form.ltError,   'error');

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const ROLES = ['employee', 'manager', 'hr_admin'];
  const eh = () => ({ async update(r) { await r.update(); } });
</script>

<svelte:head><title>Admin Settings — HRPortal</title></svelte:head>

<div class="page-header">
  <h1 class="page-title">Admin <span class="gradient-text">Settings</span></h1>
  <p class="page-subtitle">Manage users, departments, and leave configurations</p>
</div>

<div class="page-body">

  <!-- Segment Tabs -->
  <div class="tabs">
    {#each [['users','👥 Users'],['departments','🏗 Departments'],['leaveTypes','📋 Leave Types']] as [id,label]}
      <button class="tab-btn" class:active={activeTab === id} on:click={() => activeTab = id}>
        {label}
        {#if id === 'users'}<span class="tab-cnt">{users.length}</span>{/if}
        {#if id === 'departments'}<span class="tab-cnt">{departments.length}</span>{/if}
        {#if id === 'leaveTypes'}<span class="tab-cnt">{leaveTypes.length}</span>{/if}
      </button>
    {/each}
  </div>

  <!-- ==================== USERS ==================== -->
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
          <div class="if-header">
            <div class="if-icon">👤</div>
            <div>
              <div class="if-title">Create New Account</div>
              <div class="if-sub">Fill in the details to onboard a new user</div>
            </div>
          </div>
          <form method="POST" action="?/createUser" use:enhance={eh}>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="u-name">Full Name <span class="req">*</span></label>
                <input id="u-name" name="name" type="text" class="form-control" placeholder="Jane Smith" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="u-email">Email <span class="req">*</span></label>
                <input id="u-email" name="email" type="email" class="form-control" placeholder="jane@company.com" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="u-role">Role <span class="req">*</span></label>
                <select id="u-role" name="role" class="form-control" required>
                  <option value="" disabled selected>Select role…</option>
                  {#each ROLES as r}
                    <option value={r}>{r === 'hr_admin' ? 'HR Admin' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  {/each}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="u-dept">Department</label>
                <select id="u-dept" name="department" class="form-control">
                  <option value="">— None —</option>
                  {#each departments as d}
                    <option value={d.name}>{d.name}</option>
                  {/each}
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="u-pass">Temporary Password <span class="req">*</span></label>
              <input id="u-pass" name="password" type="password" class="form-control" placeholder="Min. 8 characters" minlength="8" required />
            </div>
            <button type="submit" class="btn btn-primary">Create Account →</button>
          </form>
        </div>
      {/if}

      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Employee</th><th>Code</th><th>Department</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {#each users as u}
              {#if editingUser?.id === u.id}
                <tr class="edit-row">
                  <td colspan="7">
                    <form method="POST" action="?/editUser" class="edit-inline" use:enhance={eh}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <input name="name" type="text" class="form-control" value={u.name} required placeholder="Name" />
                      <select name="role" class="form-control" required>
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
                    <div class="emp-cell">
                      <div class="emp-av">{u.name.charAt(0)}</div>
                      <div>
                        <div class="td-name">{u.name}</div>
                        <div class="td-meta">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="code-tag">{u.employee_code}</span></td>
                  <td class="text-sm">{u.department ?? '—'}</td>
                  <td><Badge value={u.role} type="role" /></td>
                  <td>
                    <span class="badge {u.is_active ? 'badge-approved' : 'badge-rejected'}">
                      <span class="dot"></span>{u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td class="text-sm text-gray">{fmtDate(u.created_at)}</td>
                  <td>
                    <div class="row-acts">
                      <button class="btn btn-ghost btn-sm" on:click={() => editingUser = u}>✎ Edit</button>
                      <form method="POST" action="?/toggleUser" use:enhance={eh}>
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
          <form method="POST" action="?/createDept" use:enhance={eh}>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="d-name">Department Name <span class="req">*</span></label>
                <input id="d-name" name="name" type="text" class="form-control" placeholder="e.g. Engineering" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="d-desc">Description</label>
                <input id="d-desc" name="description" type="text" class="form-control" placeholder="Brief description" />
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Add Department →</button>
          </form>
        </div>
      {/if}

      <div class="dept-grid">
        {#if departments.length === 0}
          <div class="empty-state"><p>No departments yet.</p></div>
        {:else}
          {#each departments as d, i}
            {@const colors = ['#6366F1','#8B5CF6','#3B82F6','#10B981','#F59E0B','#EC4899']}
            <div class="dept-card">
              <div class="dept-icon" style="background:linear-gradient(135deg,{colors[i%colors.length]},{colors[(i+1)%colors.length]})">
                {d.name.charAt(0)}
              </div>
              <div class="dept-info">
                <div class="dept-card-name">{d.name}</div>
                <div class="dept-card-desc">{d.description ?? 'No description'}</div>
              </div>
              <form method="POST" action="?/deleteDept" use:enhance={eh}>
                <input type="hidden" name="dept_id" value={d.id} />
                <button type="submit" class="btn btn-ghost btn-sm dept-del"
                  on:click|preventDefault={(e) => { if (confirm(`Delete "${d.name}"?`)) e.currentTarget.closest('form').submit(); }}>
                  ✕
                </button>
              </form>
            </div>
          {/each}
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
          <form method="POST" action="?/createLeaveType" use:enhance={eh}>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="lt-name">Name <span class="req">*</span></label>
                <input id="lt-name" name="name" type="text" class="form-control" placeholder="e.g. Paternity Leave" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="lt-days">Max Days / Year <span class="req">*</span></label>
                <input id="lt-days" name="max_days" type="number" class="form-control" placeholder="15" min="1" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="lt-desc">Description</label>
              <input id="lt-desc" name="description" type="text" class="form-control" placeholder="Short description" />
            </div>
            <button type="submit" class="btn btn-primary">Create Leave Type →</button>
          </form>
        </div>
      {/if}

      <div class="lt-grid">
        {#each leaveTypes as lt, i}
          {@const colors = ['#6366F1','#10B981','#F59E0B','#EC4899','#3B82F6']}
          <div class="lt-card">
            <div class="lt-header">
              <div class="lt-dot" style="background:{colors[i%colors.length]}"></div>
              <div class="lt-name">{lt.name}</div>
              <span class="badge {lt.is_active ? 'badge-approved' : 'badge-rejected'}">
                <span class="dot"></span>{lt.is_active ? 'Active' : 'Off'}
              </span>
            </div>
            <div class="lt-body">
              {#if editingLT === lt.id}
                <form method="POST" action="?/editLeaveType" class="lt-edit" use:enhance={eh}>
                  <input type="hidden" name="lt_id" value={lt.id} />
                  <input name="max_days" type="number" class="form-control" style="width:90px" value={lt.max_allocation_days} min="1" required />
                  <button type="submit" class="btn btn-success btn-sm">✓ Save</button>
                  <button type="button" class="btn btn-ghost btn-sm" on:click={() => editingLT = null}>Cancel</button>
                </form>
              {:else}
                <div class="lt-alloc">
                  <span class="lt-num">{lt.max_allocation_days}</span>
                  <span class="lt-unit">days / year</span>
                </div>
              {/if}
              {#if lt.description}
                <p class="lt-desc">{lt.description}</p>
              {/if}
            </div>
            <div class="lt-actions">
              <button class="btn btn-ghost btn-sm" on:click={() => editingLT = lt.id}>✎ Edit Days</button>
              <form method="POST" action="?/toggleLeaveType" use:enhance={eh}>
                <input type="hidden" name="lt_id" value={lt.id} />
                <button type="submit" class="btn btn-sm {lt.is_active ? 'btn-danger' : 'btn-success'}">
                  {lt.is_active ? 'Disable' : 'Enable'}
                </button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

</div>

<style>
  /* Tabs */
  .tab-cnt {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 18px;
    padding: 0 5px;
    border-radius: 100px;
    font-size: 0.6875rem;
    font-weight: 800;
    margin-left: 6px;
    background: rgba(255,255,255,0.3);
  }
  .tab-btn:not(.active) .tab-cnt { background: rgba(0,0,0,0.07); color: var(--gray-400); }

  /* Inline form */
  .inline-form {
    padding: 24px;
    background: linear-gradient(135deg, rgba(99,102,241,0.03), rgba(139,92,246,0.03));
    border-bottom: 1px solid rgba(99,102,241,0.08);
  }

  .if-header { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
  .if-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.25rem; color: white; flex-shrink: 0;
  }
  .if-title { font-size: 0.9375rem; font-weight: 700; color: var(--gray-900); }
  .if-sub   { font-size: 0.8125rem; color: var(--gray-500); }

  .req { color: var(--danger); }

  /* User table */
  .emp-cell { display: flex; align-items: center; gap: 10px; }
  .emp-av {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border-radius: 50%;
    color: white; font-size: 0.875rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .code-tag {
    font-family: monospace;
    font-size: 0.8125rem;
    background: rgba(99,102,241,0.08);
    color: var(--primary);
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 700;
  }
  .row-acts { display: flex; gap: 6px; }

  .edit-row td { background: rgba(99,102,241,0.04); padding: 12px 16px; }
  .edit-inline { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .edit-inline .form-control { flex: 1; min-width: 110px; }

  /* Department grid */
  .dept-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
    padding: 20px 24px;
  }

  .dept-card {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 16px;
    background: rgba(99,102,241,0.03);
    border: 1px solid rgba(99,102,241,0.08);
    border-radius: 14px;
    transition: all 0.18s ease;
  }
  .dept-card:hover { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.15); }

  .dept-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    color: white;
    font-size: 1rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  }

  .dept-info { flex: 1; min-width: 0; }
  .dept-card-name { font-size: 0.875rem; font-weight: 700; color: var(--gray-900); }
  .dept-card-desc { font-size: 0.75rem; color: var(--gray-400); margin-top: 2px; }
  .dept-del { color: var(--danger); padding: 4px 8px; }

  /* Leave type grid */
  .lt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
    padding: 20px 24px;
  }

  .lt-card {
    padding: 18px;
    background: rgba(255,255,255,0.6);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 16px;
    transition: all 0.18s ease;
    box-shadow: var(--shadow-sm);
  }
  .lt-card:hover { box-shadow: var(--shadow-md); }

  .lt-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .lt-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .lt-name { flex: 1; font-size: 0.875rem; font-weight: 700; color: var(--gray-900); }

  .lt-body { margin-bottom: 14px; }
  .lt-alloc { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
  .lt-num  { font-size: 1.75rem; font-weight: 900; color: var(--primary); letter-spacing: -0.02em; }
  .lt-unit { font-size: 0.75rem; color: var(--gray-400); }
  .lt-desc { font-size: 0.75rem; color: var(--gray-400); }

  .lt-edit { display: flex; align-items: center; gap: 8px; }
  .lt-actions { display: flex; gap: 6px; }
</style>
