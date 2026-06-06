<script>
  import { goto } from '$app/navigation';

  export let data;

  $: ({ year, month, days, summary } = data);
  $: user = data.user ?? {};

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function fmt(dt) {
    if (!dt) return '';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function minsForDay(r) {
    if (!r) return 0;
    let mins = 0;
    if (r.am_in  && r.am_out)  mins += (new Date(r.am_out)  - new Date(r.am_in))  / 60_000;
    if (r.pm_in  && r.pm_out)  mins += (new Date(r.pm_out)  - new Date(r.pm_in))  / 60_000;
    return mins;
  }

  function fmtMins(mins) {
    if (!mins || mins <= 0) return '';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}:${String(m).padStart(2, '0')}`;
  }

  function dayHours(r) { return fmtMins(minsForDay(r)); }

  function navigate(dir) {
    let m = month + dir, y = year;
    if (m < 1)  { m = 12; y--; }
    if (m > 12) { m = 1;  y++; }
    goto(`?year=${y}&month=${m}`);
  }

  const today = new Date().toISOString().split('T')[0];
  $: isCurrentMonth = year === new Date().getFullYear() && month === (new Date().getMonth() + 1);
</script>

<svelte:head><title>DTR — {MONTHS[month-1]} {year} — HRPortal</title></svelte:head>

<!-- ── Screen toolbar (hidden on print) ── -->
<div class="screen-only">
  <div class="page-header">
    <h1 class="page-title">Daily Time <span class="gradient-text">Record</span></h1>
    <p class="page-subtitle">Your official monthly attendance report</p>
  </div>

  <div class="dtr-toolbar">
    <!-- Month navigator -->
    <div class="month-nav">
      <button class="nav-arrow" on:click={() => navigate(-1)}>‹</button>
      <div class="month-label">
        <span class="month-name">{MONTHS[month-1]}</span>
        <span class="month-year">{year}</span>
      </div>
      <button class="nav-arrow" on:click={() => navigate(1)} disabled={isCurrentMonth}>›</button>
    </div>

    <!-- Summary pills -->
    <div class="sum-pills">
      <div class="sum-pill green">
        <span class="sum-n">{summary.present}</span>
        <span class="sum-l">Present</span>
      </div>
      <div class="sum-pill yellow">
        <span class="sum-n">{summary.late}</span>
        <span class="sum-l">Late</span>
      </div>
      <div class="sum-pill red">
        <span class="sum-n">{summary.absent}</span>
        <span class="sum-l">Absent</span>
      </div>
      <div class="sum-pill indigo">
        <span class="sum-n">{fmtMins(summary.totalMins) || '0:00'}</span>
        <span class="sum-l">Total Hours</span>
      </div>
    </div>

    <button class="btn btn-primary print-btn" on:click={() => window.print()}>
      🖨 Print / Save PDF
    </button>
  </div>
</div>

<!-- ── Printable DTR document ── -->
<div class="dtr-doc">

  <!-- Org header -->
  <div class="doc-header">
    <div class="doc-logo">HR</div>
    <div>
      <div class="doc-org">HRPortal Management System</div>
      <div class="doc-div">Human Resources Division</div>
    </div>
  </div>

  <div class="doc-title">DAILY TIME RECORD</div>

  <!-- Employee meta -->
  <div class="doc-meta">
    <div class="meta-row">
      <div class="meta-block">
        <span class="meta-lbl">Employee Name</span>
        <span class="meta-val">{user.name ?? '—'}</span>
      </div>
      <div class="meta-block">
        <span class="meta-lbl">Month of</span>
        <span class="meta-val">{MONTHS[month-1]} {year}</span>
      </div>
    </div>
    <div class="meta-row">
      <div class="meta-block">
        <span class="meta-lbl">Employee No.</span>
        <span class="meta-val">{user.employee_code ?? '—'}</span>
      </div>
      <div class="meta-block">
        <span class="meta-lbl">Department</span>
        <span class="meta-val">{user.department ?? '—'}</span>
      </div>
    </div>
  </div>

  <!-- Attendance table -->
  <table class="dtr-table">
    <thead>
      <tr>
        <th rowspan="2" class="th-day">Day</th>
        <th rowspan="2" class="th-dow">Day</th>
        <th colspan="2" class="th-period">A.M.</th>
        <th colspan="2" class="th-period">P.M.</th>
        <th rowspan="2" class="th-total">Total<br/>Hours</th>
        <th rowspan="2" class="th-rem">Remarks</th>
      </tr>
      <tr>
        <th class="th-sub">Time In</th>
        <th class="th-sub">Time Out</th>
        <th class="th-sub">Time In</th>
        <th class="th-sub">Time Out</th>
      </tr>
    </thead>
    <tbody>
      {#each days as d}
        {@const isToday = d.dateStr === today}
        <tr class:row-sun={d.isSunday} class:row-sat={d.isSaturday} class:row-today={isToday}>
          <td class="td-day">{d.day}</td>
          <td class="td-dow">{DAY_SHORT[d.dayOfWeek]}</td>

          {#if d.isSunday}
            <td colspan="4" class="td-rest">— Rest Day —</td>
            <td></td>
            <td></td>
          {:else}
            <td class="td-time tin">{fmt(d.record?.am_in)}</td>
            <td class="td-time tout">{fmt(d.record?.am_out)}</td>
            <td class="td-time tin">{fmt(d.record?.pm_in)}</td>
            <td class="td-time tout">{fmt(d.record?.pm_out)}</td>
            <td class="td-hrs">{dayHours(d.record)}</td>
            <td class="td-rem">
              {#if d.record?.status === 'Late'}
                <span class="rem rem-late">Late</span>
              {:else if d.record?.status === 'Absent'}
                <span class="rem rem-absent">Absent</span>
              {:else if d.record?.status === 'Half Day'}
                <span class="rem rem-half">½ Day</span>
              {:else if d.isSaturday && !d.record}
                <span class="rem rem-sat">Sat</span>
              {/if}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr class="row-totals">
        <td colspan="6" class="tot-label">Monthly Totals</td>
        <td class="tot-hrs">{fmtMins(summary.totalMins) || '0:00'}</td>
        <td class="tot-meta">P:{summary.present} L:{summary.late} A:{summary.absent}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Monthly Hours Summary Block -->
  <div class="hours-summary">
    <div class="hs-main">
      <div class="hs-big-label">Total Hours Worked</div>
      <div class="hs-big-value">{fmtMins(summary.totalMins) || '0:00'}</div>
      <div class="hs-big-sub">{summary.totalHours} decimal hours</div>
    </div>
    <div class="hs-divider"></div>
    <div class="hs-stats">
      <div class="hs-stat">
        <span class="hs-stat-n present">{summary.present}</span>
        <span class="hs-stat-l">Days Present</span>
      </div>
      <div class="hs-stat">
        <span class="hs-stat-n late">{summary.late}</span>
        <span class="hs-stat-l">Days Late</span>
      </div>
      <div class="hs-stat">
        <span class="hs-stat-n absent">{summary.absent}</span>
        <span class="hs-stat-l">Days Absent</span>
      </div>
      <div class="hs-stat">
        <span class="hs-stat-n total">{summary.present + summary.late}</span>
        <span class="hs-stat-l">Days Worked</span>
      </div>
    </div>
  </div>

  <!-- Certification text -->
  <div class="dtr-cert">
    I certify on my honor that the above is a true and correct report of the hours of work performed,
    record of which was made daily at the time of arrival and departure from office.
  </div>

  <!-- Signatures -->
  <div class="sig-grid">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">Employee Signature over Printed Name</div>
      <div class="sig-date">Date: ___________________________</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">HR / Supervisor Signature over Printed Name</div>
      <div class="sig-date">Date: ___________________________</div>
    </div>
  </div>

</div>

<style>
  /* ── Toolbar (screen only) ── */
  .screen-only { margin-bottom: 24px; }

  .dtr-toolbar {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 20px;
    padding: 16px 22px;
    box-shadow: var(--shadow-md);
  }

  .month-nav { display: flex; align-items: center; gap: 12px; }

  .nav-arrow {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px solid rgba(99,102,241,0.2);
    background: rgba(99,102,241,0.06);
    color: var(--primary); font-size: 1.25rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .18s ease; line-height: 1;
  }
  .nav-arrow:hover:not(:disabled) {
    background: var(--primary); color: white;
    border-color: var(--primary);
    box-shadow: 0 4px 14px rgba(99,102,241,.35);
  }
  .nav-arrow:disabled { opacity: .3; cursor: not-allowed; }

  .month-label { display: flex; flex-direction: column; align-items: center; min-width: 100px; }
  .month-name  { font-size: 1.0625rem; font-weight: 900; color: var(--gray-900); letter-spacing: -.02em; }
  .month-year  { font-size: .75rem; font-weight: 600; color: var(--gray-400); }

  .sum-pills { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; }

  .sum-pill {
    display: flex; flex-direction: column; align-items: center;
    padding: 7px 16px; border-radius: 12px; min-width: 62px;
  }
  .sum-pill.green  { background:rgba(16,185,129,.1);  border:1px solid rgba(16,185,129,.2);  }
  .sum-pill.yellow { background:rgba(245,158,11,.1);  border:1px solid rgba(245,158,11,.2);  }
  .sum-pill.red    { background:rgba(239,68,68,.1);   border:1px solid rgba(239,68,68,.2);   }
  .sum-pill.indigo { background:rgba(99,102,241,.1);  border:1px solid rgba(99,102,241,.2);  }

  .sum-n { font-size:1.125rem; font-weight:900; color:var(--gray-900); line-height:1; }
  .sum-l { font-size:.625rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--gray-400); margin-top:2px; }

  .print-btn { margin-left: auto; }

  /* ── DTR Document ── */
  .dtr-doc {
    background: white;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 20px;
    padding: 40px 44px;
    box-shadow: var(--shadow-lg);
    max-width: 860px;
    margin: 0 auto 48px;
  }

  /* Org header */
  .doc-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }

  .doc-logo {
    width: 50px; height: 50px;
    background: linear-gradient(135deg,#6366F1,#8B5CF6);
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: .875rem; font-weight: 900; color: white; flex-shrink: 0;
  }

  .doc-org  { font-size: .9375rem; font-weight: 800; color: #0F172A; }
  .doc-div  { font-size: .6875rem; color: #64748B; margin-top: 2px; }

  .doc-title {
    text-align: center;
    font-size: 1rem; font-weight: 900; letter-spacing: .14em; color: #1E1B4B;
    padding: 10px 0;
    border-top: 2.5px solid #6366F1;
    border-bottom: 2.5px solid #6366F1;
    margin: 14px 0 20px;
  }

  /* Meta */
  .doc-meta {
    display: flex; flex-direction: column; gap: 8px;
    background: #F8FAFF;
    border: 1px solid rgba(99,102,241,.1);
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 22px;
  }

  .meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; }
  .meta-block { display: flex; flex-direction: column; gap: 2px; }
  .meta-lbl { font-size: .625rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94A3B8; }
  .meta-val { font-size: .875rem; font-weight: 700; color: #0F172A; border-bottom: 1px solid #CBD5E1; padding-bottom: 3px; }

  /* Table */
  .dtr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: .8rem;
    margin-bottom: 22px;
  }

  .dtr-table th, .dtr-table td {
    border: 1px solid #CBD5E1;
    padding: 5px 7px;
    text-align: center;
    vertical-align: middle;
  }

  /* Head rows */
  .th-day, .th-dow, .th-period, .th-total, .th-rem {
    background: #1E1B4B; color: white;
    font-size: .6875rem; font-weight: 800; letter-spacing: .04em;
  }
  .th-sub {
    background: #EEF2FF; color: #4338CA;
    font-size: .625rem; font-weight: 700;
  }

  .th-day   { width: 34px; }
  .th-dow   { width: 34px; }
  .th-total { width: 66px; }
  .th-rem   { width: 74px; }

  /* Body cells */
  .td-day  { font-weight: 800; color: #374151; }
  .td-dow  { font-size: .6875rem; color: #6B7280; }
  .td-time { font-size: .75rem; font-weight: 600; }
  .td-time.tin  { color: #065F46; }
  .td-time.tout { color: #7C2D12; }
  .td-hrs  { font-weight: 800; color: #1E1B4B; }
  .td-rem  { }
  .td-rest { font-size: .6875rem; font-weight: 700; color: #EF4444; letter-spacing: .06em; }

  /* Row variants */
  .row-sun { background: #FFF7ED; }
  .row-sun .td-day, .row-sun .td-dow { color: #EF4444; }
  .row-sat .td-day, .row-sat .td-dow { color: #F59E0B; }
  .dtr-table tbody tr:hover:not(.row-sun):not(.row-sat) { background: #F8FAFF; }
  .row-today { background: #ECFDF5; outline: 2px solid #10B981; outline-offset: -2px; }

  /* Remark badges */
  .rem {
    font-size: .5625rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: .05em;
    padding: 2px 5px; border-radius: 4px;
  }
  .rem-late   { background:#FEF3C7; color:#92400E; }
  .rem-absent { background:#FEE2E2; color:#991B1B; }
  .rem-half   { background:#EDE9FE; color:#4C1D95; }
  .rem-sat    { background:#FEF9C3; color:#78350F; }

  /* Totals row */
  .row-totals td { background: #1E1B4B; color: white; font-weight: 800; }
  .tot-label { text-align: right; font-size: .6875rem; letter-spacing: .07em; text-transform: uppercase; }
  .tot-hrs   { color: #A5F3FC; }
  .tot-meta  { font-size: .625rem; color: rgba(255,255,255,.65); }

  /* Hours summary block */
  .hours-summary {
    display: flex;
    align-items: center;
    gap: 0;
    background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%);
    border-radius: 14px;
    padding: 22px 28px;
    margin-bottom: 20px;
    color: white;
  }

  .hs-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 160px;
    padding-right: 28px;
  }

  .hs-big-label {
    font-size: .625rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: rgba(255,255,255,.5);
    margin-bottom: 4px;
  }

  .hs-big-value {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: -.04em;
    color: #A5F3FC;
    line-height: 1;
  }

  .hs-big-sub {
    font-size: .6875rem;
    color: rgba(255,255,255,.4);
    margin-top: 4px;
  }

  .hs-divider {
    width: 1px;
    height: 60px;
    background: rgba(255,255,255,.15);
    margin: 0 28px;
    flex-shrink: 0;
  }

  .hs-stats {
    display: flex;
    gap: 32px;
    flex: 1;
    justify-content: center;
  }

  .hs-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .hs-stat-n {
    font-size: 1.75rem;
    font-weight: 900;
    letter-spacing: -.03em;
    line-height: 1;
  }
  .hs-stat-n.present { color: #6EE7B7; }
  .hs-stat-n.late    { color: #FCD34D; }
  .hs-stat-n.absent  { color: #FCA5A5; }
  .hs-stat-n.total   { color: white; }

  .hs-stat-l {
    font-size: .625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: rgba(255,255,255,.45);
  }

  /* Certification */
  .dtr-cert {
    font-size: .6875rem; color: #64748B; font-style: italic;
    text-align: center; line-height: 1.65;
    padding: 12px 16px;
    border: 1px dashed #CBD5E1; border-radius: 8px;
    margin-bottom: 28px;
  }

  /* Signatures */
  .sig-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
  }

  .sig-block { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .sig-line  { width: 100%; border-top: 1.5px solid #374151; margin-bottom: 5px; }
  .sig-name  { font-size: .6875rem; font-weight: 600; color: #374151; text-align: center; }
  .sig-date  { font-size: .625rem; color: #94A3B8; align-self: flex-start; margin-top: 10px; }

  /* ── Print ── */
  @media print {
    :global(.sidebar)       { display: none !important; }
    :global(.main-content)  { margin-left: 0 !important; padding: 0 !important; }
    :global(body)           { background: white !important; }

    .screen-only { display: none !important; }

    .dtr-doc {
      border: none; border-radius: 0;
      box-shadow: none; padding: 16px;
      max-width: 100%; margin: 0;
    }

    .dtr-table th, .dtr-table td { padding: 3px 5px; }
    .dtr-table { font-size: .68rem; }

    /* Keep dark summary block readable when printing */
    .hours-summary {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      border: 2px solid #312E81;
    }
  }
</style>
