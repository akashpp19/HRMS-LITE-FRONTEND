import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('hrms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  /** Accept any non-empty username + password */
  const login = (username, password) => {
    if (!username.trim() || !password) {
      return { ok: false, error: 'Please enter both username and password.' };
    }
    const name = username.trim();
    const u = { username: name.toLowerCase(), role: 'User', name };
    sessionStorage.setItem('hrms_user', JSON.stringify(u));
    setUser(u);
    return { ok: true };
  };

  const logout = () => {
    sessionStorage.removeItem('hrms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
