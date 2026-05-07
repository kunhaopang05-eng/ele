import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  major: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, major: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('psa_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string, _: string) => {
    // Mock login
    const mockUser = { id: '1', name: '电力新人', email, major: '电气工程及其自动化' };
    setUser(mockUser);
    localStorage.setItem('psa_user', JSON.stringify(mockUser));
  };

  const register = async (name: string, email: string, major: string) => {
    const newUser = { id: Date.now().toString(), name, email, major };
    setUser(newUser);
    localStorage.setItem('psa_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('psa_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
