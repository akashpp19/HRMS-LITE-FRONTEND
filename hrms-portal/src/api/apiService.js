/**
 * HRMS Lite — Backend API service
 * Bridges between the FastAPI backend (snake_case, PascalCase statuses, numeric IDs)
 * and the frontend data model (camelCase, lowercase statuses, EMP-xxx string IDs).
 *
 * All functions return null when no API_URL is configured — callers fall back to localStorage.
 */

const getBase = () => {
  // 1. Build-time env var (set in Vercel / .env)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // 2. Runtime fallback from localStorage (legacy Settings page support)
  try {
    const saved = localStorage.getItem('hrms_settings');
    if (saved) {
      const s = JSON.parse(saved);
      if (s.apiUrl && s.apiUrl.trim()) return s.apiUrl.replace(/\/$/, '');
    }
  } catch {}
  return null;
};

// ── Normalizers ────────────────────────────────────────────────────────────────

/** Backend employee → frontend employee */
function normEmp(e) {
  const parts = (e.full_name || '').split(' ');
  return {
    id: e.employee_id,            // EMP001 style code
    _dbId: e.id,                  // numeric PK — needed for CRUD
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
    email: e.email || '',
    department: e.department || '',
    position: e.position || '',
    role: e.position || '',       // alias
    phone: e.phone || '',
    joinDate: e.created_at ? e.created_at.slice(0, 10) : '',
    status: 'active',
    totalPresentDays: e.total_present_days || 0,
  };
}

/** Frontend employee → backend create payload */
function denormEmpCreate(e) {
  return {
    employee_id: e.id || e.employee_id || `EMP${Date.now()}`,
    full_name: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
    email: e.email,
    department: e.department,
    position: e.position || e.role || null,
    phone: e.phone || null,
  };
}

/** Frontend employee → backend update payload */
function denormEmpUpdate(e) {
  return {
    full_name: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
    email: e.email,
    department: e.department,
    position: e.position || e.role || null,
    phone: e.phone || null,
  };
}

const STATUS_TO_BACKEND = { present: 'Present', absent: 'Absent', late: 'Late', 'half-day': 'Half Day' };
const STATUS_FROM_BACKEND = { Present: 'present', Absent: 'absent', Late: 'late', 'Half Day': 'half-day' };

/** Backend attendance → frontend attendance */
function normAtt(a) {
  return {
    id: a.id,
    _dbId: a.id,
    employeeId: a.employee_code,   // EMP001 code
    date: a.date,
    status: STATUS_FROM_BACKEND[a.status] || a.status.toLowerCase(),
    note: a.note || '',
    employeeName: a.employee_name,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const base = getBase();
  if (!base) return null;
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    signal: options.signal || AbortSignal.timeout(8000),
  });
  if (res.status === 204) return null;
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? JSON.parse(text) : null;
}

function buildUrl(path, params) {
  const base = getBase();
  if (!base) return null;
  const url = new URL(`${base}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) url.searchParams.set(k, v);
  });
  return url.toString();
}

// ── Public API ─────────────────────────────────────────────────────────────────

export const api = {

  /** Returns true/false — never throws */
  async healthCheck() {
    const base = getBase();
    if (!base) return false;
    try {
      const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(4000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Employees ──────────────────────────────────────────────────────────────────

  /** Returns normalized employee array or null if no API configured */
  async getEmployees({ search, department } = {}) {
    const url = buildUrl('/api/employees', { search: search || '', department: department || '' });
    if (!url) return null;
    const data = await apiFetch(url);
    return data ? data.map(normEmp) : null;
  },

  async getDepartments() {
    const base = getBase();
    if (!base) return null;
    return apiFetch('/api/employees/departments');
  },

  async createEmployee(emp) {
    const base = getBase();
    if (!base) return null;
    const data = await apiFetch('/api/employees', {
      method: 'POST',
      body: JSON.stringify(denormEmpCreate(emp)),
    });
    return data ? normEmp(data) : null;
  },

  async updateEmployee(dbId, emp) {
    const base = getBase();
    if (!base || !dbId) return null;
    const data = await apiFetch(`/api/employees/${dbId}`, {
      method: 'PUT',
      body: JSON.stringify(denormEmpUpdate(emp)),
    });
    return data ? normEmp(data) : null;
  },

  async deleteEmployee(dbId) {
    const base = getBase();
    if (!base || !dbId) return null;
    await apiFetch(`/api/employees/${dbId}`, { method: 'DELETE' });
    return true;
  },

  // Attendance ─────────────────────────────────────────────────────────────────

  /** params: { dateFrom, dateTo, employeeCode, status } */
  async getAttendance({ dateFrom, dateTo, employeeCode, status } = {}) {
    const url = buildUrl('/api/attendance', {
      date_from: dateFrom || '',
      date_to: dateTo || '',
      status: status && STATUS_TO_BACKEND[status] ? STATUS_TO_BACKEND[status] : (status || ''),
    });
    if (!url) return null;
    const data = await apiFetch(url);
    return data ? data.map(normAtt) : null;
  },

  async createAttendance(att, employees) {
    const base = getBase();
    if (!base) return null;
    const emp = employees.find(e => e.id === att.employeeId);
    const dbId = emp?._dbId;
    if (!dbId) return null;
    const data = await apiFetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: dbId,
        date: att.date,
        status: STATUS_TO_BACKEND[att.status] || att.status,
        note: att.note || null,
      }),
    });
    return data ? normAtt(data) : null;
  },

  async updateAttendance(dbId, att) {
    const base = getBase();
    if (!base || !dbId) return null;
    const data = await apiFetch(`/api/attendance/${dbId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: STATUS_TO_BACKEND[att.status] || att.status,
        note: att.note || null,
      }),
    });
    return data ? normAtt(data) : null;
  },

  async deleteAttendance(dbId) {
    const base = getBase();
    if (!base || !dbId) return null;
    await apiFetch(`/api/attendance/${dbId}`, { method: 'DELETE' });
    return true;
  },

  // Dashboard ──────────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const base = getBase();
    if (!base) return null;
    return apiFetch('/api/dashboard/stats');
  },
};
