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
const modalBox = { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' };

const Label = ({ children }) => <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</div>;
const DeptBadge = ({ dept }) => <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>{dept}</span>;

export default function Employees() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee, getPresentDays } = useApp();
  const { t } = useTheme();
  const card = { background: t.cardBg, borderRadius: 16, boxShadow: t.cardShadow, border: `1px solid ${t.cardBorder}` };
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${t.inputBorder}`, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: t.inputText, background: t.inputBg, boxSizing: 'border-box' };
  const btnGhost = { background: t.btnGhostBg, color: t.btnGhostText, border: `1.5px solid ${t.btnGhostBorder}`, borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
  const overlay = { position: 'fixed', inset: 0, background: t.overlayBg, backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
  const modalBox = { background: t.modalBg, borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' };
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all'|'active'|'inactive'
  const [joinFrom, setJoinFrom] = useState('');
  const [joinTo, setJoinTo] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'view' | 'delete'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', department: '', position: '', joinDate: '' });
  const [selectedEmp, setSelectedEmp] = useState(null);

  const filtered = useMemo(() => employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    if (!name.includes(search.toLowerCase()) && !e.id?.toLowerCase().includes(search.toLowerCase()) && !e.email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter !== 'all' && e.department !== deptFilter) return false;
    if (statusFilter !== 'all' && (e.status || 'active') !== statusFilter) return false;
    if (joinFrom && e.joinDate && e.joinDate < joinFrom) return false;
    if (joinTo && e.joinDate && e.joinDate > joinTo) return false;
    return true;
  }), [employees, search, deptFilter, statusFilter, joinFrom, joinTo]);

  // Active filter chips
  const chips = [];
  if (search)              chips.push({ key:'search',     label: `"${search}"`,                   clear: () => setSearch('') });
  if (deptFilter !== 'all') chips.push({ key:'dept',      label: `Dept: ${deptFilter}`,             clear: () => setDeptFilter('all') });
  if (statusFilter !== 'all') chips.push({ key:'status', label: `Status: ${statusFilter}`,         clear: () => setStatusFilter('all') });
  if (joinFrom)            chips.push({ key:'joinFrom',   label: `Joined from ${joinFrom}`,        clear: () => setJoinFrom('') });
  if (joinTo)              chips.push({ key:'joinTo',     label: `Joined to ${joinTo}`,            clear: () => setJoinTo('') });

  const clearAll = () => { setSearch(''); setDeptFilter('all'); setStatusFilter('all'); setJoinFrom(''); setJoinTo(''); };

  const fc = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const openAdd = () => { setForm({ firstName: '', lastName: '', email: '', phone: '', department: '', position: '', joinDate: '' }); setModal('add'); };
  const openEdit = emp => { setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone, department: emp.department, position: emp.position, joinDate: emp.joinDate }); setSelectedEmp(emp); setModal('edit'); };
  const openView = emp => { setSelectedEmp(emp); setModal('view'); };
  const openDelete = emp => { setSelectedEmp(emp); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelectedEmp(null); };

  const handleAdd = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.department || !form.position || !form.joinDate) return;
    addEmployee({ ...form, id: `EMP${String(Date.now()).slice(-4)}` });
    closeModal();
  };
  const handleUpdate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.department || !form.position || !form.joinDate) return;
    updateEmployee(selectedEmp.id, form);
    closeModal();
  };
  const handleDelete = () => { deleteEmployee(selectedEmp.id); closeModal(); };

  const FormField = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>


      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { emoji: '👥', label: 'Total', value: employees.length, bg: '#ede9fe', tc: '#6d28d9' },
          { emoji: '🏢', label: 'Departments', value: departments.length, bg: '#dbeafe', tc: '#1d4ed8' },
          { emoji: '🔍', label: 'Filtered', value: filtered.length, bg: '#fef9c3', tc: '#b45309' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.emoji}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#94a3b8' }}>🔍</span>
            <input
              style={{ ...inputStyle, paddingLeft: 36 }}
              placeholder="Search employees…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = t.inputBorder}
            />
          </div>
          <select style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = t.inputBorder}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = t.inputBorder}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: t.muted, whiteSpace: 'nowrap' }}>Joined:</span>
            <input type="date" style={{ ...inputStyle, width: 'auto' }} value={joinFrom} onChange={e => setJoinFrom(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = t.inputBorder} />
            <span style={{ fontSize: 12, color: t.muted }}>→</span>
            <input type="date" style={{ ...inputStyle, width: 'auto' }} value={joinTo} onChange={e => setJoinTo(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = t.inputBorder} />
          </div>
          <button style={btnPrimary} onClick={openAdd}>＋ Add Employee</button>
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
            <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: t.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 4 }}>No employees found</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{search || deptFilter !== 'all' ? 'Try adjusting your filters' : 'Click "Add Employee" to get started'}</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                  {['Employee', 'Department', 'Contact', 'Present', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr key={emp.id}
                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar firstName={emp.firstName} lastName={emp.lastName} size="md" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{emp.id} · {emp.position}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}><DeptBadge dept={emp.department} /></td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 12, color: '#475569' }}>{emp.email}</div>
                      {emp.phone && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{emp.phone}</div>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 13, padding: '3px 12px', borderRadius: 99 }}>{getPresentDays(emp.id)}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>
                      {emp.joinDate ? format(parseISO(emp.joinDate), 'MMM d, yyyy') : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        {[
                          { label: '👁', title: 'View', color: '#3b82f6', bg: '#eff6ff', fn: () => openView(emp) },
                          { label: '✏️', title: 'Edit', color: '#d97706', bg: '#fffbeb', fn: () => openEdit(emp) },
                          { label: '🗑', title: 'Delete', color: '#ef4444', bg: '#fff1f2', fn: () => openDelete(emp) },
                        ].map(btn => (
                          <button key={btn.title} title={btn.title} onClick={btn.fn}
                            style={{ background: 'transparent', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = btn.bg; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >{btn.label}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
              Showing {filtered.length} of {employees.length} employees
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={overlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{modal === 'add' ? '➕ Add Employee' : '✏️ Edit Employee'}</h2>
              <button onClick={closeModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <FormField label="First Name *">
                <input style={inputStyle} value={form.firstName} onChange={e => fc('firstName', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </FormField>
              <FormField label="Last Name *">
                <input style={{ ...inputStyle, marginLeft: 12, width: 'calc(100% - 12px)' }} value={form.lastName} onChange={e => fc('lastName', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </FormField>
            </div>
            <FormField label="Email *">
              <input type="email" style={inputStyle} value={form.email} onChange={e => fc('email', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </FormField>
            <FormField label="Phone">
              <input style={inputStyle} value={form.phone} onChange={e => fc('phone', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <FormField label="Department *">
                <select style={inputStyle} value={form.department} onChange={e => fc('department', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Position *">
                <input style={{ ...inputStyle, marginLeft: 12, width: 'calc(100% - 12px)' }} value={form.position} onChange={e => fc('position', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </FormField>
            </div>
            <FormField label="Join Date *">
              <input type="date" style={inputStyle} value={form.joinDate} onChange={e => fc('joinDate', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </FormField>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={btnGhost} onClick={closeModal}>Cancel</button>
              <button style={btnPrimary} onClick={modal === 'add' ? handleAdd : handleUpdate}>
                {modal === 'add' ? '➕ Add Employee' : '✔ Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selectedEmp && (
        <div style={overlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar firstName={selectedEmp.firstName} lastName={selectedEmp.lastName} size="lg" />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{selectedEmp.firstName} {selectedEmp.lastName}</h2>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{selectedEmp.position} · {selectedEmp.id}</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Email', value: selectedEmp.email },
                { label: 'Phone', value: selectedEmp.phone || '—' },
                { label: 'Department', value: selectedEmp.department },
                { label: 'Position', value: selectedEmp.position },
                { label: 'Join Date', value: selectedEmp.joinDate ? format(parseISO(selectedEmp.joinDate), 'MMM d, yyyy') : '—' },
                { label: 'Present Days', value: getPresentDays(selectedEmp.id) },
              ].map(f => (
                <div key={f.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selectedEmp && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 420, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🗑️</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Delete Employee?</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
              Are you sure you want to delete <strong>{selectedEmp.firstName} {selectedEmp.lastName}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={btnGhost} onClick={closeModal}>Cancel</button>
              <button style={{ ...btnPrimary, background: '#ef4444' }} onClick={handleDelete}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
