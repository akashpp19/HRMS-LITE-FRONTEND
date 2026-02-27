import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

const SIDEBAR_COLLAPSED_W = 72;

export default function Layout() {
  const { t } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, transition: 'background 0.3s ease' }}>
      {/* Sidebar manages its own hover/expand state internally */}
      <Sidebar />

      <main
        style={{
          marginLeft: SIDEBAR_COLLAPSED_W,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sticky page header — shows page title, notifications, theme toggle, user */}
        <Header />

        {/* Page content */}
        <div style={{ padding: '28px 32px', flex: 1, maxWidth: 1440, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
