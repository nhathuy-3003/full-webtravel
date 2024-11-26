// src/components/dashboard/Settings.js

import React, { useState, useEffect, useContext } from 'react';
import styles from './Settings.module.css';
import { useNavigate } from 'react-router-dom';
import { updatePassword, fetchAllHotels } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from '../../AuthContext';

const Settings = () => {
  const { authToken, userData, logout, loading: authLoading } = useContext(AuthContext);
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    userStatus: 1,
    password: '',
    hotelName: '',
    currentPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) return;

      if (!authToken || !userData) {
        setError('Bạn chưa đăng nhập.');
        setLoading(false);
        return;
      }

      try {
        const allHotels = await fetchAllHotels(authToken);

        const hotelName =
          allHotels.find((hotel) => hotel.HotelId === userData.HotelId)?.HotelName || 'Không xác định';

        setUser({
          name: userData.FullName || '',
          email: userData.UserName || '',
          role: userData.Role || '',
          userStatus: userData.UserStatus || 1,
          hotelName: hotelName,
          currentPassword: '',
          password: '',
        });
        setLoading(false);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu người dùng.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authToken, userData, authLoading]);

  const handleLogout = () => {
    logout(); // Sử dụng hàm logout từ AuthContext
    navigate('/dashboard-login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken || !userData) {
      setError('Bạn chưa đăng nhập.');
      return;
    }

    // Thông tin cập nhật mật khẩu
    const updatedData = {
      currentPassword: user.currentPassword,
      newPassword: user.password,
      newPassword_confirmation: user.password,
    };

    try {
      const data = await updatePassword(authToken, updatedData.currentPassword, updatedData.newPassword);
      toast.success(data.message || 'Mật khẩu đã được thay đổi.');
      // Xóa các trường mật khẩu sau khi thay đổi thành công
      setUser({ ...user, currentPassword: '', password: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra.';
      console.error('Lỗi khi thay đổi mật khẩu:', error);
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  if (authLoading || loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Cài Đặt</h1>
      <p>Chỉnh sửa thông tin cá nhân của bạn tại đây.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Tên:
          <input
            type="text"
            name="name"
            value={user.name || ''}
            onChange={handleInputChange}
            className={styles.input}
            readOnly // Nếu bạn không cho phép chỉnh sửa tên
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={user.email || ''}
            onChange={handleInputChange}
            className={styles.input}
            readOnly
          />
        </label>

        <label>
          Vai trò:
          <input type="text" value={user.role || ''} className={styles.input} readOnly />
        </label>

        <label>
          Trạng thái:
          <input
            type="text"
            value={user.userStatus === 1 ? 'Đang làm việc' : 'Nghỉ việc'}
            className={styles.input}
            readOnly
          />
        </label>

        <label>
          Khách sạn đang làm việc:
          <input type="text" value={user.hotelName || ''} className={styles.input} readOnly />
        </label>

        <label>
          Mật khẩu cũ:
          <input
            type="password"
            name="currentPassword"
            placeholder="Nhập mật khẩu cũ"
            value={user.currentPassword || ''}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </label>

        <label>
          Mật khẩu mới:
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu mới"
            value={user.password || ''}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </label>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.saveButton}>
            Lưu Thay Đổi
          </button>
          <button type="button" onClick={handleLogout} className={styles.logoutButton}>
            Đăng Xuất
          </button>
          <button type="button" onClick={() => navigate('/')} className={styles.homeButton}>
            Trang Chủ
          </button>
        </div>
      </form>

      {/* Thêm ToastContainer */}
      <ToastContainer />
    </div>
  );
};

export default Settings;
