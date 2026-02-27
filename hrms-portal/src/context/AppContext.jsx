import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { api } from '../api/apiService';

const AppContext = createContext();

// generateId for local-only records
const generateId = () => 'EMP' + String(Math.floor(Math.random() * 9000) + 1000).padStart(3, '0');

const initialEmployees = [
  {
    id: 'EMP001',
    firstName: 'EMP 1',
    lastName: '',
    email: 'emp1@company.com',
    phone: '+1 555-0101',
    department: 'Engineering',
    role: 'Python Developer',
    joinDate: '2026-02-25',
    avatar: null,
    status: 'active',
  },
  {
    id: 'EMP002',
    firstName: 'EMP 2',
    lastName: '',
    email: 'emp2@company.com',
    phone: '+1 555-0102',
    department: 'Engineering',
    role: 'Frontend Developer',
    joinDate: '2026-01-15',
    avatar: null,
    status: 'active',
  },
  {
    id: 'EMP003',
    firstName: 'EMP 3',
    lastName: '',
    email: 'emp3@company.com',
    phone: '+1 555-0103',
    department: 'Design',
    role: 'UI/UX Designer',
    joinDate: '2025-11-20',
    avatar: null,
    status: 'active',
  },
  {
    id: 'EMP004',
    firstName: 'EMP 4',
    lastName: '',
    email: 'emp4@company.com',
    phone: '+1 555-0104',
    department: 'Marketing',
    role: 'Marketing Manager',
    joinDate: '2025-10-05',
    avatar: null,
    status: 'active',
  },
  {
    id: 'EMP005',
    firstName: 'EMP 5',
    lastName: '',
    email: 'emp5@company.com',
    phone: '+1 555-0105',
    department: 'HR',
    role: 'HR Specialist',
    joinDate: '2026-02-01',
    avatar: null,
    status: 'active',
  },
];

const initialAttendance = [
  { id: 1, employeeId: 'EMP001', date: '2026-02-26', status: 'present', note: '' },
  { id: 2, employeeId: 'EMP002', date: '2026-02-26', status: 'present', note: '' },
  { id: 3, employeeId: 'EMP003', date: '2026-02-26', status: 'absent', note: 'Sick leave' },
  { id: 4, employeeId: 'EMP004', date: '2026-02-26', status: 'late', note: 'Traffic delay' },
  { id: 5, employeeId: 'EMP005', date: '2026-02-26', status: 'present', note: '' },
  { id: 6, employeeId: 'EMP001', date: '2026-02-25', status: 'present', note: '' },
  { id: 7, employeeId: 'EMP002', date: '2026-02-25', status: 'present', note: '' },
  { id: 8, employeeId: 'EMP003', date: '2026-02-25', status: 'present', note: '' },
  { id: 9, employeeId: 'EMP004', date: '2026-02-25', status: 'present', note: '' },
  { id: 10, employeeId: 'EMP005', date: '2026-02-25', status: 'half-day', note: 'Left early' },
  { id: 11, employeeId: 'EMP001', date: '2026-02-27', status: 'present', note: '' },
  { id: 12, employeeId: 'EMP002', date: '2026-02-27', status: 'late', note: 'Overslept' },
  { id: 13, employeeId: 'EMP003', date: '2026-02-27', status: 'present', note: '' },
  { id: 14, employeeId: 'EMP005', date: '2026-02-27', status: 'present', note: '' },
];

const initialLeaveRequests = [
  { id: 1, employeeId: 'EMP003', leaveType: 'Sick Leave', startDate: '2026-02-26', endDate: '2026-02-26', reason: 'Not feeling well', status: 'approved' },
  { id: 2, employeeId: 'EMP001', leaveType: 'Casual Leave', startDate: '2026-03-01', endDate: '2026-03-02', reason: 'Family function', status: 'pending' },
  { id: 3, employeeId: 'EMP004', leaveType: 'Vacation', startDate: '2026-03-10', endDate: '2026-03-15', reason: 'Annual vacation', status: 'pending' },
];

const initialSettings = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  weekStart: 'Monday',
};

// Increment this whenever initialEmployees / initialAttendance seed data changes.
// It forces old localStorage to be wiped and replaced with fresh defaults.
const DATA_VERSION = '4';

// Run synchronously at module load — clears stale data before any useState reads localStorage
(() => {
  if (localStorage.getItem('hrms_data_version') !== DATA_VERSION) {
    localStorage.removeItem('hrms_employees');
    localStorage.removeItem('hrms_attendance');
    localStorage.removeItem('hrms_leaves');
    localStorage.setItem('hrms_data_version', DATA_VERSION);
  }
})();

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('hrms_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('hrms_attendance');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('hrms_leaves');
    if (!saved) return initialLeaveRequests;
    try {
      const parsed = JSON.parse(saved);
      // Migrate old fromDate/toDate/type format to startDate/endDate/leaveType
      if (parsed.length > 0 && (parsed[0].fromDate !== undefined || parsed[0].type !== undefined)) {
        return parsed.map(l => ({
          ...l,
          leaveType: l.leaveType || l.type || 'Other',
          startDate: l.startDate || l.fromDate || '',
          endDate: l.endDate || l.toDate || '',
        }));
      }
      return parsed;
    } catch { return initialLeaveRequests; }
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hrms_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'EMP 1 marked present today', time: '9:00 AM', read: false },
    { id: 2, message: 'Leave request from EMP 2', time: '8:30 AM', read: false },
    { id: 3, message: 'New employee EMP 5 joined', time: 'Yesterday', read: true },
  ]);

  // 'idle' | 'checking' | 'connected' | 'offline'
  const [apiStatus, setApiStatus] = useState('idle');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingEmps, setLoadingEmps] = useState(false);
  const [loadingAtts, setLoadingAtts] = useState(false);

  // ── Refresh helpers (re-fetch individual slices from API) ────────────────────
  const refreshEmployees = useCallback(async () => {
    setLoadingEmps(true);
    try { const emps = await api.getEmployees(); if (emps) setEmployees(emps); }
    catch(e) { console.warn('[HRMS] refreshEmployees:', e); }
    finally { setLoadingEmps(false); }
  }, []);

  const refreshAttendance = useCallback(async () => {
    setLoadingAtts(true);
    try { const atts = await api.getAttendance(); if (atts) setAttendance(atts); }
    catch(e) { console.warn('[HRMS] refreshAttendance:', e); }
    finally { setLoadingAtts(false); }
  }, []);

  const refreshDashboard = useCallback(async () => {
    try { const stats = await api.getDashboardStats(); if (stats) setDashboardStats(stats); }
    catch(e) { console.warn('[HRMS] refreshDashboard:', e); }
  }, []);

  // Try to connect to API and hydrate all data from it
  const syncFromApi = useCallback(async () => {
    setApiStatus('checking');
    const alive = await api.healthCheck();
    if (!alive) { setApiStatus('offline'); return; }
    setApiStatus('connected');
    try {
      setLoadingEmps(true); setLoadingAtts(true);
      const [emps, atts, stats] = await Promise.all([
        api.getEmployees(),
        api.getAttendance(),
        api.getDashboardStats(),
      ]);
      if (emps)  setEmployees(emps);
      if (atts)  setAttendance(atts);
      if (stats) setDashboardStats(stats);
    } catch (err) {
      console.warn('[HRMS] API sync failed:', err);
      setApiStatus('offline');
    } finally { setLoadingEmps(false); setLoadingAtts(false); }
  }, []);

  // Auto-sync on mount: fires whenever VITE_API_URL is set OR apiUrl is in local settings
  useEffect(() => {
    const hasEnvUrl = !!import.meta.env.VITE_API_URL;
    let hasSettingsUrl = false;
    try {
      const s = JSON.parse(localStorage.getItem('hrms_settings') || '{}');
      hasSettingsUrl = !!(s.apiUrl && s.apiUrl.trim());
    } catch {}
    if (hasEnvUrl || hasSettingsUrl) syncFromApi();
  }, [syncFromApi]);

  useEffect(() => {
    localStorage.setItem('hrms_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hrms_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('hrms_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('hrms_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('hrms_settings', JSON.stringify(settings));
  }, [settings]);

  const addEmployee = async (employee) => {
    const id = employee.id || generateId();
    const newEmployee = { ...employee, id, status: 'active' };
    if (apiStatus === 'connected') {
      try {
        const apiEmp = await api.createEmployee(newEmployee);
        if (apiEmp) {
          await Promise.all([refreshEmployees(), refreshDashboard()]);
          addNotification(`New employee ${id} added`);
          return apiEmp;
        }
      } catch(err) { console.warn('[HRMS] addEmployee:', err); }
    }
    setEmployees(prev => [...prev, newEmployee]);
    addNotification(`New employee ${id} added`);
    return newEmployee;
  };

  const deleteEmployee = async (id) => {
    const emp = employees.find(e => e.id === id);
    if (apiStatus === 'connected' && emp?._dbId) {
      try {
        await api.deleteEmployee(emp._dbId);
        await Promise.all([refreshEmployees(), refreshAttendance(), refreshDashboard()]);
        addNotification(`Employee ${id} removed`);
        return;
      } catch(err) { console.warn('[HRMS] deleteEmployee:', err); }
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
    setAttendance(prev => prev.filter(a => a.employeeId !== id));
    addNotification(`Employee ${id} removed`);
  };

  const updateEmployee = async (id, updates) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (apiStatus === 'connected') {
      const emp = employees.find(e => e.id === id);
      const merged = { ...emp, ...updates };
      if (merged._dbId) {
        try { await api.updateEmployee(merged._dbId, merged); await refreshEmployees(); }
        catch(err) { console.warn('[HRMS] updateEmployee:', err); }
      }
    }
  };

  const markAttendance = async (record) => {
    const existing = attendance.find(
      a => a.employeeId === record.employeeId && a.date === record.date
    );
    if (existing) {
      setAttendance(prev => prev.map(a => a.id === existing.id ? { ...a, ...record } : a));
      if (apiStatus === 'connected' && existing._dbId) {
        try {
          await api.updateAttendance(existing._dbId, record);
          await Promise.all([refreshAttendance(), refreshDashboard()]);
        } catch(err) { console.warn('[HRMS] updateAttendance:', err); }
      }
    } else {
      const newRecord = { ...record, id: Date.now() };
      setAttendance(prev => [...prev, newRecord]);
      if (apiStatus === 'connected') {
        try {
          const apiRec = await api.createAttendance(record, employees);
          if (apiRec) await Promise.all([refreshAttendance(), refreshDashboard()]);
        } catch(err) { console.warn('[HRMS] createAttendance:', err); }
      }
    }
  };

  const deleteAttendance = async (id) => {
    const rec = attendance.find(a => a.id === id);
    setAttendance(prev => prev.filter(a => a.id !== id));
    if (apiStatus === 'connected' && rec?._dbId) {
      try {
        await api.deleteAttendance(rec._dbId);
        await Promise.all([refreshAttendance(), refreshDashboard()]);
      } catch(err) { console.warn('[HRMS] deleteAttendance:', err); }
    }
  };

  const updateAttendance = async (id, updates) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (apiStatus === 'connected') {
      const rec = attendance.find(a => a.id === id);
      const merged = { ...rec, ...updates };
      if (merged._dbId) {
        try {
          await api.updateAttendance(merged._dbId, merged);
          await Promise.all([refreshAttendance(), refreshDashboard()]);
        } catch(err) { console.warn('[HRMS] updateAttendance:', err); }
      }
    }
  };

  const addLeaveRequest = (request) => {
    const newRequest = { ...request, id: Date.now(), status: 'pending' };
    setLeaveRequests(prev => [...prev, newRequest]);
    const emp = employees.find(e => e.id === request.employeeId);
    if (emp) addNotification(`Leave request from ${emp.firstName} ${emp.lastName}`);
  };

  const updateLeaveRequest = (id, updates) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLeaveRequest = (id) => {
    setLeaveRequests(prev => prev.filter(l => l.id !== id));
  };

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const exportData = () => {
    const data = { employees, attendance, leaveRequests, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrms-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.employees) setEmployees(data.employees);
          if (data.attendance) setAttendance(data.attendance);
          if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
          if (data.settings) setSettings(data.settings);
          resolve();
        } catch {
          reject(new Error('Invalid backup file'));
        }
      };
      reader.readAsText(file);
    });
  };

  const resetData = () => {
    setEmployees(initialEmployees);
    setAttendance(initialAttendance);
    setLeaveRequests(initialLeaveRequests);
    setSettings(initialSettings);
    localStorage.removeItem('hrms_employees');
    localStorage.removeItem('hrms_attendance');
    localStorage.removeItem('hrms_leaves');
    localStorage.removeItem('hrms_settings');
  };

  const addNotification = (message) => {
    setNotifications(prev => [
      { id: Date.now(), message, time: format(new Date(), 'h:mm a'), read: false },
      ...prev,
    ]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getEmployeeById = (id) => employees.find(e => e.id === id);

  const getAttendanceForEmployee = (employeeId) =>
    attendance.filter(a => a.employeeId === employeeId);

  const getAttendanceByDate = (date) =>
    attendance.filter(a => a.date === date);

  const getPresentDays = (employeeId) =>
    attendance.filter(a => a.employeeId === employeeId && a.status === 'present').length;

  const departments = [...new Set(employees.map(e => e.department))];

  const value = {
    employees,
    attendance,
    leaveRequests,
    notifications,
    departments,
    settings,
    apiStatus,
    dashboardStats,
    loadingEmps,
    loadingAtts,
    syncFromApi,
    refreshEmployees,
    refreshAttendance,
    refreshDashboard,
    addEmployee,
    deleteEmployee,
    updateEmployee,
    markAttendance,
    addAttendance: markAttendance,
    deleteAttendance,
    updateAttendance,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    updateSettings,
    exportData,
    importData,
    resetData,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    getEmployeeById,
    getAttendanceForEmployee,
    getAttendanceByDate,
    getPresentDays,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
