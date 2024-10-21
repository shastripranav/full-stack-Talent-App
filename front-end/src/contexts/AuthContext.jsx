import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [lastAssessment, setLastAssessment] = useState(localStorage.getItem('lastAssessment'));
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

  const login = (tokenValue, userData, lastAssessment) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastAssessment', JSON.stringify(lastAssessment));
    setToken(tokenValue);
    setUser(userData);
    setLastAssessment(lastAssessment);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastAssessment');
    setToken(null);
    setUser(null);
    setLastAssessment(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (updatedDetails) => {
    try {
      const response = await api.put('/user', updatedDetails, {
        headers: { 'x-auth-token': token }
      });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
