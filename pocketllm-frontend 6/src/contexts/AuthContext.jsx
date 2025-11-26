import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = sessionStorage.getItem('authToken');
    const savedUser = sessionStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // DEMO MODE: Check if backend is available
    const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
    
    if (DEMO_MODE) {
      // Mock authentication for testing without backend
      const mockUsers = {
        'admin': { username: 'admin', role: 'admin', email: 'admin@pocketllm.local' },
        'user': { username: 'user', role: 'user', email: 'user@pocketllm.local' },
        'guest': { username: 'guest', role: 'user', email: 'guest@pocketllm.local' },
        'developer': { username: 'developer', role: 'user', email: 'dev@pocketllm.local' }
      };

      // Simple mock validation
      if (mockUsers[username] && password === username) {
        const userData = mockUsers[username];
        const mockToken = `mock_token_${username}_${Date.now()}`;
        
        sessionStorage.setItem('authToken', mockToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('✅ DEMO MODE: Logged in as', username);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Invalid credentials. Try: admin/admin or user/user' 
        };
      }
    }

    // PRODUCTION MODE: Use real backend
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      const { token, user: userData } = response.data;
      
      // Store in session storage
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Backend not available. Set VITE_DEMO_MODE=true to test without backend.' 
      };
    }
  };

  const logout = () => {
    // Clear storage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || user.role === 'ADMIN';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
