import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, FileText,
  Settings, LogOut, Bell,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', accent: '#a78bfa', rgb: '167,139,250' },
  { path: '/employees', icon: Users, label: 'Employees', accent: '#60a5fa', rgb: '96,165,250' },
  { path: '/attendance', icon: CalendarCheck, label: 'Attendance', accent: '#34d399', rgb: '52,211,153' },
  { path: '/leaves', icon: FileText, label: 'Leaves', accent: '#fbbf24', rgb: '251,191,36' },
  { path: '/settings', icon: Settings, label: 'Settings', accent: '#f472b6', rgb: '244,114,182' },
];

export default function Sidebar() {
  const location = useLocation();
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hovered, setHovered] = useState(null);

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: 'fixed', left: 0, top: 0, height: '100vh',
        width: isExpanded ? 260 : 72,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)', zIndex: 50,
        background: isDark ? 'linear-gradient(180deg,#1a1632 0%,#130f2b 55%,#0d0b1e 100%)' : '#ffffff',
        boxShadow: isExpanded
          ? isDark ? '8px 0 40px rgba(0,0,0,0.6), 4px 0 0 rgba(124,58,237,0.18)' : '8px 0 32px rgba(0,0,0,0.08), 1px 0 0 #e8e4f0'
          : isDark ? '4px 0 28px rgba(0,0,0,0.4)' : '4px 0 16px rgba(0,0,0,0.06), 1px 0 0 #e8e4f0',
        overflow: 'hidden',
      }}>

      {/* ── Logo ── */}
      <div style={{
        height: 68, flexShrink: 0,
        borderBottom: `1px solid ${isDark ? '#2a2748' : '#f0edf8'}`,
        display: 'flex', alignItems: 'center',
        padding: isExpanded ? '0 18px' : 0,
        justifyContent: isExpanded ? 'flex-start' : 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)',
          boxShadow: '0 4px 18px rgba(124,58,237,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="2" fill="white" opacity="0.95"/>
            <rect x="14" y="3" width="7" height="7" rx="2" fill="white" opacity="0.5"/>
            <rect x="3" y="14" width="7" height="7" rx="2" fill="white" opacity="0.5"/>
            <rect x="14" y="14" width="7" height="7" rx="2" fill="white" opacity="0.95"/>
          </svg>
        </div>
        {isExpanded && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#fff' : '#1e1b4b', letterSpacing: '-0.3px', lineHeight: 1 }}>HRMS Lite</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 10, color: '#9c84d4', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>Portal V2</span>
              <span style={{ fontSize: 9, fontWeight: 800, background: isDark ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.1)', color: isDark ? '#c4b5fd' : '#7c3aed', padding: '1px 6px', borderRadius: 5, textTransform: 'uppercase' }}>PRO</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Info card ── */}
      {isExpanded && (
        <div style={{
          margin: '14px 12px 2px',
          borderRadius: 14, padding: '14px 16px',
          background: isDark
            ? 'linear-gradient(135deg,rgba(124,58,237,0.38) 0%,rgba(91,33,182,0.22) 100%)'
            : 'linear-gradient(135deg,rgba(124,58,237,0.07) 0%,rgba(91,33,182,0.04) 100%)',
          border: `1px solid ${isDark ? 'rgba(124,58,237,0.28)' : 'rgba(124,58,237,0.15)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute',top:-20,right:-20,width:72,height:72,borderRadius:'50%',background: isDark ? 'rgba(168,85,247,0.14)' : 'rgba(168,85,247,0.07)' }}/>
          <div style={{ position:'absolute',bottom:-14,left:-10,width:48,height:48,borderRadius:'50%',background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.05)' }}/>
          <div style={{ position:'relative',display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background: isDark ? 'rgba(124,58,237,0.45)' : 'rgba(124,58,237,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Bell size={16} color={isDark ? '#c4b5fd' : '#7c3aed'} />
            </div>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color: isDark ? '#e9d5ff' : '#1e1b4b',lineHeight:1.2 }}>HR Dashboard</div>
              <div style={{ fontSize:10,color: isDark ? 'rgba(196,181,253,0.65)' : '#9c84d4',marginTop:2 }}>Manage · Track · Streamline</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section label ── */}
      {isExpanded && (
        <div style={{ padding:'10px 20px 2px',fontSize:10,fontWeight:700,color: isDark ? 'rgba(255,255,255,0.18)' : '#bbb5d0',textTransform:'uppercase',letterSpacing:'0.18em' }}>Menu</div>
      )}

      {/* ── Navigation ── */}
      <nav style={{ flex:1,overflowY:'auto',overflowX:'hidden',padding:isExpanded?'4px 10px':'8px 10px',scrollbarWidth:'none' }}>
        <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            const isHov = hovered === item.path && !isActive;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHovered(item.path)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display:'flex', alignItems:'center',
                  gap: isExpanded ? 10 : 0,
                  borderRadius:12, textDecoration:'none',
                  position:'relative', cursor:'pointer',
                  padding: isExpanded ? '10px 12px' : 0,
                  width: isExpanded ? 'auto' : 48,
                  height: isExpanded ? 'auto' : 48,
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  margin: isExpanded ? '0' : '0 auto',
                  fontSize:13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? (isDark ? '#fff' : '#7c3aed')
                    : isHov
                      ? (isDark ? 'rgba(255,255,255,0.88)' : '#4b3f8a')
                      : (isDark ? 'rgba(255,255,255,0.35)' : '#6b7280'),
                  background: isActive
                    ? (isDark ? `linear-gradient(135deg,rgba(124,58,237,0.55) 0%,rgba(91,33,182,0.3) 100%)` : 'rgba(124,58,237,0.08)')
                    : isHov ? (isDark ? 'rgba(255,255,255,0.065)' : 'rgba(124,58,237,0.04)') : 'transparent',
                  boxShadow: isActive
                    ? (isDark ? `0 4px 18px rgba(124,58,237,0.22), inset 3px 0 0 ${item.accent}` : `0 2px 10px rgba(124,58,237,0.08), inset 3px 0 0 ${item.accent}`)
                    : isHov ? (isDark ? 'inset 3px 0 0 rgba(255,255,255,0.12)' : 'inset 3px 0 0 rgba(124,58,237,0.2)') : 'none',
                  transition:'all 0.18s ease',
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  flexShrink:0, width:32, height:32, borderRadius:9,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: isActive ? `rgba(${item.rgb},0.15)` : isHov ? `rgba(${item.rgb},0.08)` : 'transparent',
                  transition:'all 0.18s',
                }}>
                  <Icon size={18} style={{
                    color: isActive ? item.accent : isHov ? `rgba(${item.rgb},0.9)` : (isDark ? 'rgba(255,255,255,0.28)' : '#9ca3af'),
                    transition:'color 0.18s',
                  }} />
                </div>

                {/* Label */}
                {isExpanded && (
                  <span style={{ flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
                    {item.label}
                  </span>
                )}

                {/* Active indicator dot */}
                {isActive && isExpanded && (
                  <span style={{
                    width:6, height:6, borderRadius:'50%',
                    background: item.accent,
                    boxShadow:`0 0 10px ${item.accent}`,
                    flexShrink:0,
                  }} />
                )}

                {/* Tooltip (collapsed) */}
                {!isExpanded && isHov && (
                  <div style={{
                    position:'absolute', left:58,
                    background: isDark ? '#1a1632' : '#fff',
                    color: isDark ? '#fff' : '#1e1b4b',
                    fontSize:12, fontWeight:600,
                    padding:'7px 14px', borderRadius:10,
                    whiteSpace:'nowrap',
                    border: isDark ? '1px solid rgba(124,58,237,0.35)' : '1px solid #e8e4f0',
                    boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex:9999, pointerEvents:'none',
                  }}>
                    {item.label}
                    <div style={{
                      position:'absolute', left:-5, top:'50%',
                      transform:'translateY(-50%) rotate(45deg)',
                      width:8, height:8,
                      background: isDark ? '#1a1632' : '#fff',
                      borderLeft: isDark ? '1px solid rgba(124,58,237,0.35)' : '1px solid #e8e4f0',
                      borderBottom: isDark ? '1px solid rgba(124,58,237,0.35)' : '1px solid #e8e4f0',
                    }} />
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Divider ── */}
      <div style={{ height:1, background: isDark ? '#2a2748' : '#f0edf8', margin:'0 14px' }} />

      {/* ── User profile ── */}
      <div style={{
        padding: isExpanded ? '12px 14px' : '12px 0',
        display:'flex', alignItems:'center',
        gap: isExpanded ? 10 : 0,
        justifyContent: isExpanded ? 'flex-start' : 'center',
      }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{
            width:38, height:38, borderRadius:12, flexShrink:0,
            background:'linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)',
            boxShadow:'0 3px 12px rgba(124,58,237,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>A</span>
          </div>
          <span style={{
            position:'absolute', top:-2, right:-2,
            width:10, height:10, borderRadius:'50%',
            background:'#10b981', border: isDark ? '2px solid #130f2b' : '2px solid #fff',
          }} />
        </div>
        {isExpanded && (
          <>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontSize:13,fontWeight:700,color: isDark ? 'rgba(255,255,255,0.88)' : '#1e293b',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>Admin User</div>
              <div style={{ fontSize:11,color: isDark ? 'rgba(255,255,255,0.22)' : '#94a3b8',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>admin@hrms.com</div>
            </div>
            <button
              style={{ width:32,height:32,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',flexShrink:0,transition:'background 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background= isDark ? 'rgba(255,255,255,0.07)' : 'rgba(239,68,68,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
            >
              <LogOut size={15} color={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
