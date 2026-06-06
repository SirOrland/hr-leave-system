<script>
  import { page } from '$app/stores';

  export let user = {};

  $: role = user?.role ?? 'employee';
  $: currentPath = $page.url.pathname;

  const navByRole = {
    employee: [
      { href: '/employee/dashboard', icon: '⊞', label: 'Dashboard' }
    ],
    manager: [
      { href: '/manager/dashboard', icon: '⊞', label: 'Dashboard' },
      { href: '/employee/dashboard', icon: '👤', label: 'My Portal' }
    ],
    hr_admin: [
      { href: '/hr/dashboard',      icon: '⊞', label: 'Dashboard' },
      { href: '/hr/attendance',     icon: '🕐', label: 'Attendance' },
      { href: '/hr/settings',       icon: '⚙', label: 'Settings' },
      { href: '/manager/dashboard', icon: '✔', label: 'Approvals' }
    ]
  };

  $: navItems = navByRole[role] ?? navByRole.employee;

  function isActive(href) {
    return currentPath === href || currentPath.startsWith(href + '/');
  }

  const roleLabel = { employee: 'Employee', manager: 'Manager', hr_admin: 'HR Admin' };
  const roleGrad  = {
    employee: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
    manager:  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
    hr_admin: 'linear-gradient(135deg,#EC4899,#BE185D)'
  };
</script>

<aside class="sidebar">

  <!-- Brand -->
  <div class="brand">
    <div class="brand-icon">
      <span>HR</span>
    </div>
    <div>
      <div class="brand-name">HRPortal</div>
      <div class="brand-sub">Leave & Attendance</div>
    </div>
  </div>

  <!-- Role badge -->
  <div class="role-section">
    <span class="role-pill" style="background: {roleGrad[role]}">
      {roleLabel[role] ?? role}
    </span>
  </div>

  <!-- Navigation -->
  <nav class="nav">
    <p class="nav-section-label">MENU</p>
    {#each navItems as item}
      <a
        href={item.href}
        class="nav-item"
        class:active={isActive(item.href)}
        aria-current={isActive(item.href) ? 'page' : undefined}
      >
        <span class="nav-icon">{item.icon}</span>
        <span class="nav-label">{item.label}</span>
        {#if isActive(item.href)}
          <span class="nav-active-indicator"></span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Spacer -->
  <div style="flex:1"></div>

  <!-- User footer -->
  <div class="sidebar-footer">
    <div class="user-row">
      <div class="avatar-wrap">
        <div class="avatar">{(user?.name ?? 'U').charAt(0).toUpperCase()}</div>
        <span class="online-dot"></span>
      </div>
      <div class="user-meta">
        <div class="user-name">{user?.name ?? 'User'}</div>
        <div class="user-dept">{user?.department ?? user?.employee_code ?? ''}</div>
      </div>
    </div>
    <form method="POST" action="/logout">
      <button type="submit" class="sign-out-btn" title="Sign out">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </form>
  </div>

</aside>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--sidebar-width);
    background: linear-gradient(170deg, #0F172A 0%, #1E1B4B 60%, #0F172A 100%);
    display: flex;
    flex-direction: column;
    z-index: 100;
    overflow-y: auto;
    border-right: 1px solid rgba(255,255,255,0.04);
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 20px 18px;
  }

  .brand-icon {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(99,102,241,0.5);
  }

  .brand-icon span {
    font-size: 0.8125rem;
    font-weight: 900;
    color: white;
    letter-spacing: 0.05em;
  }

  .brand-name { font-size: 0.9375rem; font-weight: 800; color: white; letter-spacing: -0.01em; }
  .brand-sub  { font-size: 0.6875rem; color: rgba(255,255,255,0.35); margin-top: 1px; }

  /* Role badge */
  .role-section { padding: 0 20px 14px; }

  .role-pill {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 800;
    color: white;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  /* Divider */
  .nav::before {
    content: '';
    display: block;
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin-bottom: 10px;
  }

  /* Nav */
  .nav { padding: 0 12px; }

  .nav-section-label {
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: rgba(255,255,255,0.25);
    padding: 12px 10px 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: 9999px;
    color: rgba(255,255,255,0.55);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 3px;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    position: relative;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.9);
  }

  .nav-item.active {
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: white;
    font-weight: 700;
    box-shadow: 0 4px 18px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
  }

  .nav-icon {
    font-size: 1rem;
    width: 22px;
    text-align: center;
    flex-shrink: 0;
  }

  .nav-label { flex: 1; }

  .nav-active-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
    box-shadow: 0 0 6px rgba(255,255,255,0.6);
  }

  /* Footer */
  .sidebar-footer {
    padding: 14px 16px 18px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-row { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

  .avatar-wrap { position: relative; flex-shrink: 0; }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: white;
    font-size: 0.875rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.5);
  }

  .online-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 9px;
    height: 9px;
    background: #10B981;
    border-radius: 50%;
    border: 2px solid #0F172A;
    box-shadow: 0 0 6px rgba(16,185,129,0.6);
  }

  .user-meta { min-width: 0; }
  .user-name { font-size: 0.8125rem; font-weight: 700; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .user-dept { font-size: 0.6875rem; color: rgba(255,255,255,0.35); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .sign-out-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.4);
    transition: all 200ms ease;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .sign-out-btn:hover {
    background: rgba(239,68,68,0.2);
    color: #FCA5A5;
    border-color: rgba(239,68,68,0.3);
    box-shadow: 0 0 12px rgba(239,68,68,0.2);
  }
</style>
