<script>
  export let value = '';
  export let type = 'status'; // 'status' | 'role'

  const statusMap = {
    Pending:  'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
    Present:  'badge-present',
    Late:     'badge-late',
    Absent:   'badge-absent',
    'Half Day': 'badge-late'
  };

  const roleMap = {
    employee: 'badge-role-employee',
    manager:  'badge-role-manager',
    hr_admin: 'badge-role-hr_admin'
  };

  $: cls = type === 'role' ? (roleMap[value] ?? 'badge-role-employee') : (statusMap[value] ?? 'badge-pending');
  $: label = type === 'role'
    ? { employee: 'Employee', manager: 'Manager', hr_admin: 'HR Admin' }[value] ?? value
    : value;
</script>

<span class="badge {cls}">
  <span class="dot"></span>
  {label}
</span>
