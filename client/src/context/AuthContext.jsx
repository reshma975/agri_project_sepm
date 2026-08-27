import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('farmsetu_token') || null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('farmsetu_token');
    } catch (e) {
      console.warn('Could not clear token from localStorage', e);
    }
    setToken(null);
    setUser(null);
  }, []);

  // Fetch current user details on mount if token exists
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.success && isMounted) {
            setUser(res.data.user);
          } else if (isMounted) {
            logout();
          }
        } catch (err) {
          console.warn('Session check failed or expired:', err.message);
          if (isMounted) {
            logout();
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  const login = async (identifier, password, role) => {
    try {
      const res = await apiClient.post('/auth/login', { identifier, password, role });
      if (res.data.success) {
        localStorage.setItem('farmsetu_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
        availableRoles: err.response?.data?.availableRoles,
        user: err.response?.data?.user,
        token: err.response?.data?.token
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await apiClient.post('/auth/register', formData);
      if (res.data.success) {
        localStorage.setItem('farmsetu_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please check details.',
        accountExists: err.response?.data?.accountExists,
        alreadyHasRole: err.response?.data?.alreadyHasRole
      };
    }
  };

  const addRole = async (formData) => {
    try {
      const res = await apiClient.post('/auth/add-role', formData);
      if (res.data.success) {
        localStorage.setItem('farmsetu_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Failed to add role' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add role. Please check details.',
        alreadyHasRole: err.response?.data?.alreadyHasRole
      };
    }
  };

  const checkIdentity = async (identifier) => {
    try {
      const res = await apiClient.post('/auth/check-identity', { identifier });
      return res.data;
    } catch (err) {
      return { success: false, exists: false };
    }
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await apiClient.post('/auth/switch-role', { targetRole });
      if (res.data.success) {
        localStorage.setItem('farmsetu_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Failed to switch role' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to switch role'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await apiClient.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message, user: res.data.user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await apiClient.put('/auth/change-password', { oldPassword, newPassword });
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to change password'
      };
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err.message);
    }
  };

  const userRoles = user?.roles && user.roles.length > 0
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        addRole,
        checkIdentity,
        switchRole,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
        isAuthenticated: !!user,
        activeRole: user?.role,
        roles: userRoles,
        hasMultipleRoles: userRoles.length > 1,
        isFarmer: user?.role === 'FARMER',
        isShopkeeper: user?.role === 'SHOPKEEPER',
        isOfficer: user?.role === 'OFFICER',
        hasFarmerRole: userRoles.includes('FARMER'),
        hasShopkeeperRole: userRoles.includes('SHOPKEEPER'),
        hasOfficerRole: userRoles.includes('OFFICER'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
