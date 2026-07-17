import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  internName: string;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. Synchronously initialize from your unified storage object on the very first frame
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('aegis_user') !== null;
  });
  
  const [internName, setInternName] = useState<string>(() => {
    const cachedUser = localStorage.getItem('aegis_user');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        return parsed.name || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  // 2. Clear state variables and completely flush storage
  const login = (name: string) => {
    setIsLoggedIn(true);
    setInternName(name);
  };

  // 3. Clear all custom cache keys in one atomic step to safely prevent logout freezes
  const logout = () => {
    setIsLoggedIn(false);
    setInternName('');
    localStorage.removeItem('aegis_user');
    localStorage.removeItem('aegis_userId');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, internName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}