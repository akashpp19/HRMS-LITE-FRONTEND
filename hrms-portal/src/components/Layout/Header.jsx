import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X, CheckCheck, Sun, Moon, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const PAGE_META = {
  '/':           { title: 'Dashboard',         sub: 'Welcome back, Admin — here\'s what\'s happening today' },
  '/employees':  { title: 'Employees',          sub: 'Manage your team members and their information'         },
  '/attendance': { title: 'Attendance',         sub: 'Track daily attendance and working hours'               },
  '/leaves':     { title: 'Leave Management',   sub: 'Review and manage employee leave requests'              },
  '/settings':   { title: 'Settings',           sub: 'Configure your HRMS portal preferences and data'        },
};

export default function Header({ sidebarW = 72 }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { isDark, toggleTheme, t } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const dropRef = useRef(null);

  const meta = PAGE_META[location.pathname] || { title: 'HRMS', sub: '' };
  const unread = notifications.filter(n => !n.read).length;
  const today = format(new Date(), 'EEE, MMM d yyyy');
  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: isDark
        ? 'rgba(26,23,48,0.92)'
        : 'rgba(244,246,251,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${t.divider}`,
      padding: '0 32px',
      height: 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      transition: 'background 0.3s ease',
    }}>
      {/* Left — Page title */}
      <div style={{ minWidth: 0 }}>
        <h1 style={{
          fontSize: 20,
          fontWeight: 800,
          color: t.h1,
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: '-0.3px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {meta.title}
        </h1>
        <p style={{
          fontSize: 12,
          color: t.muted,
          margin: 0,
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {meta.sub}
        </p>
      </div>

      {/* Right — actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        {/* Date pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 10,
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: t.cardShadow,
        }}>
          <Calendar size={14} style={{ color: t.muted }} />
          <span style={{ fontSize: 12, color: t.sub, fontWeight: 500, whiteSpace: 'nowrap' }}>{today}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: `1px solid ${t.cardBorder}`,
            background: t.cardBg,
            boxShadow: t.cardShadow,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#2a2748' : '#ede9fe'; }}
          onMouseLeave={e => { e.currentTarget.style.background = t.cardBg; }}
        >
          {isDark
            ? <Sun size={16} style={{ color: '#fbbf24' }} />
            : <Moon size={16} style={{ color: '#7c3aed' }} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={dropRef}>
          <button
            onClick={() => setShowNotif(v => !v)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: `1px solid ${t.cardBorder}`,
              background: t.cardBg,
              boxShadow: t.cardShadow,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#2a2748' : '#ede9fe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.cardBg; }}
          >
            <Bell size={16} style={{ color: t.sub }} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: 'linear-gradient(135deg,#ef4444,#f97316)',
                color: '#fff', fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${t.pageBg}`,
              }}>
                {unread}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <div style={{
              position: 'absolute', top: 46, right: 0,
              width: 320,
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 16,
              boxShadow: `0 16px 48px rgba(0,0,0,${isDark ? 0.5 : 0.15})`,
              zIndex: 9999,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${t.divider}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.h1 }}>Notifications</span>
                  {unread > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#5b21b6,#7c3aed)', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>{unread} new</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {unread > 0 && (
                    <button onClick={markAllNotificationsRead} title="Mark all read"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.muted, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                      <CheckCheck size={13} /> All read
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.muted }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 18px', textAlign: 'center', color: t.muted, fontSize: 13 }}>No notifications</div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    style={{
                      padding: '12px 18px',
                      borderBottom: `1px solid ${t.divider}`,
                      cursor: 'pointer',
                      background: n.read ? 'transparent' : isDark ? 'rgba(124,58,237,0.1)' : '#faf5ff',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#211e3a' : '#f1f5f9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : isDark ? 'rgba(124,58,237,0.1)' : '#faf5ff'; }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? t.muted : '#7c3aed', flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: t.bodyText, lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar + Logout */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '5px 6px 5px 5px',
          borderRadius: 12,
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: t.cardShadow,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg,#5b21b6,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{initials}</span>
          </div>
          <div style={{ paddingRight: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.h2, lineHeight: 1.2 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 10, color: t.muted }}>{user?.role || 'Guest'}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.muted, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.muted; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
