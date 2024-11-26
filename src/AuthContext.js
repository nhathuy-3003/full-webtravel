// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { fetchUserSetting } from './api'; // Đảm bảo đường dẫn đúng

export const AuthContext = createContext();



const getToken = () => {
  return localStorage.getItem('authToken');
};


export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(getToken());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading

  const login = (token, user) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setUserData(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUserData(null);
  };


useEffect(() => {
  const fetchUserData = async () => {
    if (authToken) {
      try {
        const user = await fetchUserSetting(authToken);
        setUserData(user);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        // Bạn có thể quyết định có logout hay không
        // logout();
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  fetchUserData();
}, [authToken]);

  return (
    <AuthContext.Provider value={{ authToken, userData, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
