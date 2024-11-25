// src/components/dashboard/DashboardLogin.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardLogin.module.css';
import { login } from '../../api'; // Hàm login từ api.js
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import style của react-toastify

// Import AuthContext
import { AuthContext } from '../../AuthContext';

const DashboardLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext); // Đổi tên để tránh xung đột với hàm login import từ api.js
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn chặn reload trang khi submit form
    try {
      const response = await login(username, password);

      if (response && response.token) {
        // Sử dụng hàm login từ AuthContext để lưu token và userData
        authLogin(response.token, response.user);

        // Thông báo đăng nhập thành công
        toast.success('Đăng nhập thành công! Đang chuyển hướng...');

        // Chuyển hướng tới trang dashboard sau khi đăng nhập thành công
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500); // Chờ 1.5s để người dùng đọc thông báo
      } else {
        setError('Thông tin đăng nhập không đúng.');
        toast.error('Thông tin đăng nhập không đúng.');
      }
    } catch (err) {
      // Kiểm tra lỗi từ API
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đăng nhập.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error during login:', err);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Đăng Nhập Dashboard</h2>

        {/* Hiển thị lỗi nếu có */}
        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              type="text"
              id="username"
              placeholder="Nhập tên đăng nhập"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            Đăng Nhập
          </button>
        </form>

        <button onClick={handleGoHome} className={styles.homeButton}>
          Về Trang Chủ
        </button>
      </div>
      {/* Thêm ToastContainer vào để hiển thị các thông báo */}
      <ToastContainer />
    </div>
  );
};

export default DashboardLogin;
