import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/common/Avatar';
import { format, parseISO } from 'date-fns';

const card = { background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0f172a', background: '#fff', boxSizing: 'border-box' };
const btnPrimary = { background: 'linear-gradient(135deg,#5b21b6,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };
const btnGhost = { background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const modalBox = { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' };

const statusConfig = {
  present:  { bg: '#dcfce7', color: '#15803d', label: 'Present',  dot: '#22c55e' },
  absent:   { bg: '#fee2e2', color: '#dc2626', label: 'Absent',   dot: '#ef4444' },
  late:     { bg: '#fef9c3', color: '#b45309', label: 'Late',     dot: '#eab308' },
  'half-day': { bg: '#dbeafe', color: '#1d4ed8', label: 'Half Day', dot: '#3b82f6' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { bg: '#f1f5f9', color: '#475569', label: status, dot: '#94a3b8' };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const Label = ({ children }) => <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</div>;

export default function Attendance() {
  const { employees, attendance, addAttendance, updateAttendance, deleteAttendance } = useApp();
  const { t } = useTheme();
  const card = { background: t.cardBg, borderRadius: 16, boxShadow: t.cardShadow, border: `1px solid ${t.cardBorder}` };
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${t.inputBorder}`, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: t.inputText, background: t.inputBg, boxSizing: 'border-box' };
  const btnGhost = { background: t.btnGhostBg, color: t.btnGhostText, border: `1.5px solid ${t.btnGhostBorder}`, borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
  const overlay = { position: 'fixed', inset: 0, background: t.overlayBg, backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
  const modalBox = { background: t.modalBg, borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' };

  const blankForm = { employeeId: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'present', checkIn: '09:00', checkOut: '18:00', note: '' };
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'delete'
  const [deleteId, setDeleteId] = useState(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [empFilter, setEmpFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayA = attendance.filter(a => a.date === today);

  const filtered = useMemo(() => attendance
    .filter(a =>
      (empFilter === 'all' || a.employeeId === empFilter) &&
      (statusFilter === 'all' || a.status === statusFilter) &&
      (!dateFrom || a.date >= dateFrom) &&
      (!dateTo || a.date <= dateTo)
    )
    .sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, empFilter, statusFilter, dateFrom, dateTo]);

  // Build filter chips
  const chips = [];
  if (dateFrom) chips.push({ key: 'from', label: `From: ${dateFrom}`, clear: () => setDateFrom('') });
  if (dateTo)   chips.push({ key: 'to',   label: `To: ${dateTo}`,     clear: () => setDateTo('') });
  if (empFilter !== 'all') {
    const emp = employees.find(e => e.id === empFilter);
    chips.push({ key: 'emp', label: `${emp ? emp.firstName + ' ' + emp.lastName : empFilter}`, clear: () => setEmpFilter('all') });
  }
  if (statusFilter !== 'all') chips.push({ key: 'status', label: `Status: ${statusConfig[statusFilter]?.label || statusFilter}`, clear: () => setStatusFilter('all') });
  const clearAll = () => { setDateFrom(''); setDateTo(''); setEmpFilter('all'); setStatusFilter('all'); };

  const empMap = {};
  employees.forEach(e => { empMap[e.id] = e; });

  const fc = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const focus = e => e.target.style.borderColor = '#7c3aed';
  const blur = e => e.target.style.borderColor = '#e2e8f0';

  const openAdd = () => { setForm(blankForm); setModal('add'); };
  const openEdit = rec => {
    setForm({ employeeId: rec.employeeId, date: rec.date, status: rec.status, checkIn: rec.checkIn || '09:00', checkOut: rec.checkOut || '18:00', note: rec.note || '' });
    setEditId(rec.id);
    setModal('edit');
  };
  const close = () => { setModal(null); setEditId(null); };

  const handleAdd = () => {
    if (!form.employeeId || !form.date) return;
    addAttendance({ ...form, id: `ATT${Date.now()}` });
    close();
  };
  const handleUpdate = () => {
    if (!form.employeeId || !form.date) return;
    updateAttendance(editId, form);
    close();
  };
  const handleDelete = () => { deleteAttendance(deleteId); setDeleteId(null); setModal(null); };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>


      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { emoji: '✅', label: 'Present Today', value: todayA.filter(a=>a.status==='present').length, bg: '#dcfce7', tc: '#15803d' },
          { emoji: '❌', label: 'Absent Today', value: todayA.filter(a=>a.status==='absent').length, bg: '#fee2e2', tc: '#dc2626' },
          { emoji: '⏰', label: 'Late Today', value: todayA.filter(a=>a.status==='late').length, bg: '#fef9c3', tc: '#b45309' },
          { emoji: '🌗', label: 'Half Day', value: todayA.filter(a=>a.status==='half-day').length, bg: '#dbeafe', tc: '#1d4ed8' },
          { emoji: '📊', label: 'Total Records', value: attendance.length, bg: '#ede9fe', tc: '#6d28d9' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.emoji}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.tc, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Button */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>📅 From</span>
            <input type="date" style={{ ...inputStyle, width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} onFocus={focus} onBlur={blur} />
            <span style={{ fontSize: 13, color: '#64748b' }}>→</span>
            <input type="date" style={{ ...inputStyle, width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} onFocus={focus} onBlur={blur} />
            <select style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} value={empFilter} onChange={e => setEmpFilter(e.target.value)} onFocus={focus} onBlur={blur}>
              <option value="all">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
            <select style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} onFocus={focus} onBlur={blur}>
              <option value="all">All Statuses</option>
              {Object.keys(statusConfig).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
            </select>
          </div>
          <button style={btnPrimary} onClick={openAdd}>＋ Mark Attendance</button>
        </div>

        {/* Filter chips */}
        {chips.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
            {chips.map(c => (
              <span key={c.key} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                color: '#7c3aed', fontSize: 12, fontWeight: 600,
                padding: '4px 10px 4px 12px', borderRadius: 99,
              }}>
                {c.label}
                <button onClick={c.clear} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7c3aed', lineHeight: 1, fontSize: 14, padding: 0, display: 'flex', alignItems: 'center' }}>×</button>
              </span>
            ))}
            <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: t.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>Clear all</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 4 }}>No attendance records</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Adjust filters or mark attendance</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                  {['Employee', 'Date', 'Status', 'Check In', 'Check Out', 'Note', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(rec => {
                  const emp = empMap[rec.employeeId];
                  return (
                    <tr key={rec.id}
                      style={{ borderBottom: '1px solid #f8fafc', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '13px 20px' }}>
                        {emp ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{emp.firstName} {emp.lastName}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>{emp.id}</div>
                            </div>
                          </div>
                        ) : <span style={{ fontSize: 13, color: '#94a3b8' }}>{rec.employeeId}</span>}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>
                        {format(parseISO(rec.date), 'MMM d, yyyy')}
                      </td>
                      <td style={{ padding: '13px 20px' }}><StatusBadge status={rec.status} /></td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: '#475569' }}>{rec.checkIn || '—'}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: '#475569' }}>{rec.checkOut || '—'}</td>
                      <td style={{ padding: '13px 20px', fontSize: 12, color: '#94a3b8', maxWidth: 160 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.note || '—'}</div>
                      </td>
                      <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(rec)} title="Edit"
                            style={{ background: 'transparent', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fffbeb'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >✏️</button>
                          <button onClick={() => { setDeleteId(rec.id); setModal('delete'); }} title="Delete"
                            style={{ background: 'transparent', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
              Showing {filtered.length} of {attendance.length} records
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={overlay} onClick={close}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{modal === 'add' ? '📅 Mark Attendance' : '✏️ Edit Record'}</h2>
              <button onClick={close} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Label>Employee *</Label>
              <select style={inputStyle} value={form.employeeId} onChange={e => fc('employeeId', e.target.value)} onFocus={focus} onBlur={blur}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <Label>Date *</Label>
                <input type="date" style={inputStyle} value={form.date} onChange={e => fc('date', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <Label>Status *</Label>
                <select style={inputStyle} value={form.status} onChange={e => fc('status', e.target.value)} onFocus={focus} onBlur={blur}>
                  {Object.entries(statusConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <Label>Check In</Label>
                <input type="time" style={inputStyle} value={form.checkIn} onChange={e => fc('checkIn', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <Label>Check Out</Label>
                <input type="time" style={inputStyle} value={form.checkOut} onChange={e => fc('checkOut', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Label>Note</Label>
              <textarea rows={2} style={{ ...inputStyle, resize: 'none' }} value={form.note} onChange={e => fc('note', e.target.value)} placeholder="Optional note…" onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button style={btnGhost} onClick={close}>Cancel</button>
              <button style={btnPrimary} onClick={modal === 'add' ? handleAdd : handleUpdate}>
                {modal === 'add' ? '✔ Mark' : '✔ Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div style={overlay} onClick={() => { setModal(null); setDeleteId(null); }}>
          <div style={{ ...modalBox, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Delete Record?</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>This attendance record will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={btnGhost} onClick={() => { setModal(null); setDeleteId(null); }}>Cancel</button>
              <button style={{ ...btnPrimary, background: '#ef4444' }} onClick={handleDelete}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
