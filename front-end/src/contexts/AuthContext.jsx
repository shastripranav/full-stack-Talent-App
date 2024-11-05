import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUserDetails();
    }
  }, [token]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get('/user', {
        headers: { 'x-auth-token': token }
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      logout();
    }
  };

  const login = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUserData = async () => {
    if (refreshUserData.isLoading) {
      return;
    }
    
    try {
      refreshUserData.isLoading = true;
      await fetchUserDetails();
    } finally {
      refreshUserData.isLoading = false;
    }
  };
  refreshUserData.isLoading = false;

  const updateUser = async (updatedDetails) => {
    try {
      const response = await api.put('/user', updatedDetails, {
        headers: { 'x-auth-token': token }
      });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      fetchUserDetails();
      return response.data.user;
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser,fetchUserDetails, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
