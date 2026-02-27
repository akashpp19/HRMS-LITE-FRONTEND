import { createContext, useContext, useState } from 'react';

export const light = {
  // backgrounds
  pageBg: '#f4f6fb',
  cardBg: '#ffffff',
  cardBorder: '#edf0f7',
  cardShadow: '0 1px 4px rgba(0,0,0,0.05), 0 6px 24px rgba(0,0,0,0.04)',
  sectionHeadBg: '#f8fafc',
  // text
  h1: '#0f172a',
  h2: '#1e293b',
  sub: '#64748b',
  muted: '#94a3b8',
  label: '#64748b',
  bodyText: '#334155',
  // inputs / forms
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  inputText: '#0f172a',
  // table
  tableHeadBg: '#f8fafc',
  tableHeadText: '#64748b',
  tableRowHover: '#f5f3ff',
  tableDivider: '#f1f5f9',
  // misc
  divider: '#f1f5f9',
  badgeBg: '#f1f5f9',
  badgeText: '#475569',
  btnGhostBg: '#f1f5f9',
  btnGhostText: '#475569',
  btnGhostBorder: '#e2e8f0',
  // kpi accent colors
  kpi1Bg: '#ede9fe', kpi1Text: '#6d28d9',
  kpi2Bg: '#dbeafe', kpi2Text: '#1d4ed8',
  kpi3Bg: '#dcfce7', kpi3Text: '#15803d',
  kpi4Bg: '#fef9c3', kpi4Text: '#b45309',
  kpi5Bg: '#fee2e2', kpi5Text: '#dc2626',
  // modal
  modalBg: '#ffffff',
  overlayBg: 'rgba(15,13,31,0.45)',
};

export const dark = {
  pageBg: '#0f0d1f',
  cardBg: '#1a1730',
  cardBorder: '#2a2748',
  cardShadow: '0 2px 10px rgba(0,0,0,0.5), 0 6px 24px rgba(0,0,0,0.3)',
  sectionHeadBg: '#16132b',
  h1: '#ffffff',
  h2: '#e8e4ff',
  sub: '#c0b8e8',
  muted: '#9888cc',
  label: '#b8b0d8',
  bodyText: '#ddd8f8',
  inputBg: '#13102a',
  inputBorder: '#2a2748',
  inputText: '#ffffff',
  tableHeadBg: '#16132b',
  tableHeadText: '#b0a8d8',
  tableRowHover: '#1e1a38',
  tableDivider: '#211e3a',
  divider: '#211e3a',
  badgeBg: '#2a2748',
  badgeText: '#c0b8e8',
  btnGhostBg: '#211e3a',
  btnGhostText: '#c0b8e8',
  btnGhostBorder: '#2a2748',
  kpi1Bg: 'rgba(124,58,237,0.18)', kpi1Text: '#d4b8ff',
  kpi2Bg: 'rgba(59,130,246,0.18)', kpi2Text: '#bfdbfe',
  kpi3Bg: 'rgba(34,197,94,0.18)', kpi3Text: '#bbf7d0',
  kpi4Bg: 'rgba(234,179,8,0.18)', kpi4Text: '#fef08a',
  kpi5Bg: 'rgba(239,68,68,0.18)', kpi5Text: '#fecaca',
  modalBg: '#1a1730',
  overlayBg: 'rgba(0,0,0,0.65)',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(d => !d);
  const t = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
