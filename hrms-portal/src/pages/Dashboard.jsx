import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  subMonths, isWithinInterval, parseISO, isSameDay,
} from 'date-fns';

// ── helpers ───────────────────────────────────────────────────────────────────
function inRange(dateStr, from, to) {
  try {
    const d = parseISO(dateStr);
    return isWithinInterval(d, { start: parseISO(from), end: parseISO(to) });
  } catch { return false; }
}

const PERIODS = [
  { key: 'today',      label: 'Today' },
  { key: 'week',       label: 'This Week' },
  { key: 'month',      label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'custom',     label: 'Custom' },
];

function periodRange(period, customFrom, customTo) {
  const now = new Date();
  const fmt = d => format(d, 'yyyy-MM-dd');
  switch (period) {
    case 'today':      return { from: fmt(now), to: fmt(now) };
    case 'week':       return { from: fmt(startOfWeek(now, { weekStartsOn: 1 })), to: fmt(endOfWeek(now, { weekStartsOn: 1 })) };
    case 'month':      return { from: fmt(startOfMonth(now)), to: fmt(endOfMonth(now)) };
    case 'last-month': { const lm = subMonths(now, 1); return { from: fmt(startOfMonth(lm)), to: fmt(endOfMonth(lm)) }; }
    case 'custom':     return { from: customFrom || fmt(now), to: customTo || fmt(now) };
    default:           return { from: fmt(now), to: fmt(now) };
  }
}

// ── FilterChip ────────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove, t, accent = '#7c3aed' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: `rgba(124,58,237,0.12)`,
      border: `1px solid rgba(124,58,237,0.22)`,
      color: accent, fontSize: 12, fontWeight: 600,
      padding: '4px 10px 4px 12px', borderRadius: 99,
    }}>
      {label}
      <button onClick={onRemove} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: accent, lineHeight: 1, fontSize: 14, padding: 0,
        display: 'flex', alignItems: 'center',
      }}>×</button>
    </span>
  );
}

// ── KPICard ───────────────────────────────────────────────────────────────────
function KPICard({ emoji, bg, textColor, value, label, sub, t }) {
  return (
    <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 54, height: 54, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{emoji}</div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: t.h1, lineHeight: 1, marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.sub }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { employees, attendance, leaveRequests, getPresentDays, departments, dashboardStats, apiStatus, refreshDashboard } = useApp();

  // Refresh dashboard stats whenever the API connection is established
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (apiStatus === 'connected') refreshDashboard(); }, [apiStatus]);
  const { t, isDark } = useTheme();
  const card = { background: t.cardBg, borderRadius: 16, boxShadow: t.cardShadow, border: `1px solid ${t.cardBorder}` };

  const [period, setPeriod]       = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]   = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const { from, to } = useMemo(() => periodRange(period, customFrom, customTo), [period, customFrom, customTo]);

  const isToday = period === 'today';

  // Filtered attendance
  const periodRecords = useMemo(() => attendance.filter(a => inRange(a.date, from, to)), [attendance, from, to]);

  // Optional dept sub-filter
  const deptEmpIds = useMemo(() => {
    if (!deptFilter) return null;
    const ids = new Set(employees.filter(e => e.department === deptFilter).map(e => e.id));
    return ids;
  }, [deptFilter, employees]);

  const records = useMemo(() =>
    deptFilter ? periodRecords.filter(a => deptEmpIds?.has(a.employeeId)) : periodRecords,
    [periodRecords, deptFilter, deptEmpIds]);

  const presentCount = records.filter(a => a.status === 'present').length;
  const absentCount  = records.filter(a => a.status === 'absent').length;
  const lateCount    = records.filter(a => a.status === 'late').length;
  const halfCount    = records.filter(a => a.status === 'half-day').length;

  const denominator  = deptFilter ? (deptEmpIds?.size || 1) : (employees.length || 1);
  const attRate      = Math.round((presentCount / denominator) * 100);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  // Use live API stats when available and viewing today without a dept sub-filter
  const useApiStats = apiStatus === 'connected' && !!dashboardStats && isToday && !deptFilter;
  const kpiTotal   = useApiStats ? dashboardStats.total_employees   : employees.length;
  const kpiDepts   = useApiStats ? dashboardStats.total_departments : departments.length;
  const kpiPresent = useApiStats ? dashboardStats.present_today     : presentCount;
  const kpiAbsent  = useApiStats ? dashboardStats.absent_today      : absentCount;
  const kpiLate    = useApiStats ? dashboardStats.late_today        : lateCount;
  const kpiRate    = useApiStats ? Math.round(dashboardStats.attendance_rate_today) : attRate;

  const recentEmployees = useMemo(() =>
    [...employees].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate)).slice(0, 6),
    [employees]);

  // Filter chips
  const chips = [];
  if (period !== 'today') {
    const periodLabel = PERIODS.find(p => p.key === period)?.label || period;
    if (period === 'custom') {
      chips.push({ key: 'period', label: `${customFrom || '?'} → ${customTo || '?'}`, clear: () => setPeriod('today') });
    } else {
      chips.push({ key: 'period', label: periodLabel, clear: () => setPeriod('today') });
    }
  }
  if (deptFilter) chips.push({ key: 'dept', label: `Dept: ${deptFilter}`, clear: () => setDeptFilter('') });

  const periodLabel = period === 'today' ? 'Today' : (PERIODS.find(p => p.key === period)?.label ?? '');

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Period filter bar ── */}
      <div style={{ ...card, padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Period</span>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                padding: '7px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all .15s',
                background: period === p.key ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : t.badgeBg,
                color: period === p.key ? '#fff' : t.sub,
                boxShadow: period === p.key ? '0 3px 10px rgba(124,58,237,0.3)' : 'none',
              }}>{p.label}</button>
            ))}

            {period === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: `1.5px solid ${t.inputBorder}`, fontSize: 12, color: t.inputText, background: t.inputBg, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = t.inputBorder}
                />
                <span style={{ fontSize: 12, color: t.muted }}>→</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: `1.5px solid ${t.inputBorder}`, fontSize: 12, color: t.inputText, background: t.inputBg, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = t.inputBorder}
                />
              </div>
            )}
          </div>

          {/* Department filter */}
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${t.inputBorder}`, fontSize: 12, color: t.inputText, background: t.inputBg, outline: 'none', cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = t.inputBorder}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Filter chips */}
        {chips.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
            {chips.map(c => (
              <FilterChip key={c.key} label={c.label} onRemove={c.clear} t={t} />
            ))}
            <button onClick={() => { setPeriod('today'); setDeptFilter(''); setCustomFrom(''); setCustomTo(''); }}
              style={{ fontSize: 12, fontWeight: 600, color: t.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Welcome Banner ── */}
      <div style={{
        borderRadius: 20, padding: '32px 40px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(130deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)',
        color: '#fff',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -30, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -70, left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Welcome back, Admin 👋</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
              {isToday ? "Here's what's happening today" : `Showing data for: ${periodLabel}`}
            </p>
            <div style={{ maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                  {isToday ? "Today's attendance" : 'Period attendance'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{records.length} records</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }}>
                <div style={{ height: 8, borderRadius: 99, width: `${Math.min(kpiRate, 100)}%`, background: 'linear-gradient(90deg,#fbbf24,#f97316)', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '22px 36px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{Math.min(kpiRate, 999)}%</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 500 }}>Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20, marginBottom: 28 }}>
        <KPICard t={t} emoji="👥" bg="#ede9fe" value={kpiTotal}   label="Total Employees" sub={`${kpiDepts} departments`} />
        <KPICard t={t} emoji="✅" bg="#dcfce7" value={kpiPresent} label={isToday ? 'Present Today' : 'Present'} sub={`${kpiRate}% rate`} />
        <KPICard t={t} emoji="❌" bg="#fee2e2" value={kpiAbsent}  label={isToday ? 'Absent Today' : 'Absent'} />
        <KPICard t={t} emoji="⏰" bg="#fef9c3" value={kpiLate}    label={isToday ? 'Late Today' : 'Late'} sub={`${halfCount} half-day`} />
        <KPICard t={t} emoji="📋" bg="#fce7f3" value={pendingLeaves} label="Pending Leaves" />
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Recent Employees Table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.h1 }}>Recent Employees</div>
              <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>Latest additions to your team</div>
            </div>
            <Link to="/employees" style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentEmployees.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: t.muted, fontSize: 14 }}>No employees yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: t.tableHeadBg }}>
                  {['Employee', 'Department', 'Position', 'Present'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: t.tableHeadText, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEmployees.map(emp => (
                  <tr key={emp.id}
                    style={{ borderTop: `1px solid ${t.divider}`, cursor: 'default', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = t.tableRowHover}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: t.h1, whiteSpace: 'nowrap' }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: 11, color: t.muted }}>{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: t.sub, whiteSpace: 'nowrap' }}>{emp.department}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: t.sub, whiteSpace: 'nowrap' }}>{emp.position || emp.role}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: 12, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                        {getPresentDays(emp.id)} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div style={{ ...card, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.h1, marginBottom: 16 }}>Quick Actions</div>
            {[
              { to: '/employees', emoji: '👥', title: 'Manage Employees', sub: `${employees.length} employees`, bg: '#ede9fe' },
              { to: '/attendance', emoji: '📅', title: 'Mark Attendance', sub: 'Track daily check-in', bg: '#dcfce7' },
              { to: '/leaves', emoji: '📋', title: 'Leave Requests', sub: `${pendingLeaves} pending`, bg: '#fce7f3' },
              { to: '/settings', emoji: '⚙️', title: 'Settings', sub: 'Configure portal', bg: '#f1f5f9' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: item.bg, textDecoration: 'none', marginBottom: 8, transition: 'filter .15s' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                onMouseLeave={e => e.currentTarget.style.filter = ''}
              >
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{item.sub}</div>
                </div>
                <span style={{ color: '#7c3aed', fontWeight: 700 }}>→</span>
              </Link>
            ))}
          </div>

          {/* Period Summary */}
          <div style={{ ...card, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.h1, marginBottom: 4 }}>{periodLabel} Summary</div>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 14 }}>
              {from === to ? from : `${from} → ${to}`}
            </div>
            {[
              { label: 'Total Records', value: records.length, color: '#7c3aed' },
              { label: 'Present',       value: presentCount,    color: '#16a34a' },
              { label: 'Absent',        value: absentCount,     color: '#dc2626' },
              { label: 'Late',          value: lateCount,       color: '#d97706' },
              { label: 'Half Day',      value: halfCount,       color: '#0891b2' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${t.divider}` }}>
                <span style={{ fontSize: 13, color: t.sub }}>{s.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
