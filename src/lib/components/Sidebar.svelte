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
      { href: '/hr/dashboard',    icon: '⊞', label: 'Dashboard' },
      { href: '/hr/attendance',   icon: '🕐', label: 'Attendance' },
      { href: '/hr/settings',     icon: '⚙', label: 'Settings' },
      { href: '/manager/dashboard', icon: '✔', label: 'Approvals' }
    ]
  };

  $: navItems = navByRole[role] ?? navByRole.employee;

  function isActive(href) {
    return currentPath === href || currentPath.startsWith(href + '/');
  }

  const roleLabel = { employee: 'Employee', manager: 'Manager', hr_admin: 'HR Admin' };
  const roleColor = { employee: '#3B82F6', manager: '#8B5CF6', hr_admin: '#EC4899' };
</script>

<aside class="sidebar">
  <!-- Brand -->
  <div class="brand">
    <div class="brand-icon">HR</div>
    <div>
      <div class="brand-name">HRPortal</div>
      <div class="brand-sub">Leave & Attendance</div>
    </div>
  </div>

  <!-- Role badge -->
  <div class="role-section">
    <span class="role-pill" style="background: {roleColor[role]}22; color: {roleColor[role]}">
      {roleLabel[role] ?? role}
    </span>
  </div>

  <!-- Navigation -->
  <nav class="nav">
    <p class="nav-section-label">NAVIGATION</p>
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
          <span class="nav-active-dot"></span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- User footer -->
  <div class="sidebar-footer">
    <div class="user-info">
      <div class="avatar">{(user?.name ?? 'U').charAt(0).toUpperCase()}</div>
      <div class="user-meta">
        <div class="user-name">{user?.name ?? 'User'}</div>
        <div class="user-code">{user?.employee_code ?? ''}</div>
      </div>
    </div>
    <form method="POST" action="/logout">
      <button type="submit" class="sign-out-btn" title="Sign out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
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
    background: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    z-index: 100;
    overflow-y: auto;
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px 20px 16px;
    border-bottom: 1px solid rgb(255 255 255 / 0.07);
  }

  .brand-icon {
    width: 38px;
    height: 38px;
    background: var(--primary);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8125rem;
    font-weight: 800;
    color: white;
    letter-spacing: 0.03em;
    flex-shrink: 0;
  }

  .brand-name { font-size: 0.9375rem; font-weight: 700; color: white; }
  .brand-sub  { font-size: 0.6875rem; color: rgb(255 255 255 / 0.4); margin-top: 1px; }

  /* Role badge */
  .role-section { padding: 10px 20px 6px; }
  .role-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Nav */
  .nav { flex: 1; padding: 8px 12px; }

  .nav-section-label {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgb(255 255 255 / 0.3);
    padding: 10px 8px 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    color: rgb(255 255 255 / 0.6);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 2px;
    transition: all var(--transition);
    position: relative;
    text-decoration: none;
  }

  .nav-item:hover {
    background: rgb(255 255 255 / 0.07);
    color: white;
  }

  .nav-item.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
  }

  .nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-label { flex: 1; }

  .nav-active-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: white;
    opacity: 0.6;
  }

  /* Footer */
  .sidebar-footer {
    padding: 14px 16px;
    border-top: 1px solid rgb(255 255 255 / 0.07);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    font-size: 0.875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user-meta { min-width: 0; }
  .user-name { font-size: 0.8125rem; font-weight: 600; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .user-code { font-size: 0.6875rem; color: rgb(255 255 255 / 0.4); }

  .sign-out-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(255 255 255 / 0.5);
    transition: all var(--transition);
    flex-shrink: 0;
  }

  .sign-out-btn:hover {
    background: rgb(239 68 68 / 0.2);
    color: #FCA5A5;
  }
</style>
