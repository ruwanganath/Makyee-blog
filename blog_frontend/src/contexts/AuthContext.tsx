import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isVerified: boolean;
  login: (userId: string, verified: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedUserId = localStorage.getItem('userId');
    return !!savedUserId;
  });
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    const savedVerified = localStorage.getItem('isVerified') === 'true';
    return savedVerified;
  });

  const login = (userId: string, verified: boolean) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('isVerified', verified.toString());
    setIsAuthenticated(true);
    setIsVerified(verified);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isVerified');
    localStorage.removeItem('username');    
    setIsAuthenticated(false);
    setIsVerified(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isVerified, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
