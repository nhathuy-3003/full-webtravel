import React, { useState, useEffect } from 'react';
import styles from './AddUser.module.css';
import { createUser, fetchAllHotels } from '../../api';
import { toast } from 'react-toastify';

const AddUser = ({ onClose, onUserAdded }) => {
  const [newUser, setNewUser] = useState({
    FullName: '',
    UserName: '',
    Password: '',
    HotelId: '',
    Role: '',
    UserStatus: 1,
  });
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const allHotels = await fetchAllHotels();
        setHotels(allHotels);
      } catch (error) {
        console.error('Error loading hotels:', error);
      }
    };

    loadHotels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = {
      ...newUser,
      [name]: name === 'UserStatus' ? parseInt(value) : value,
    };

    // Nếu vai trò là 'Quản lý', đặt HotelId thành null
    if (name === 'Role' && value === 'Quản lý') {
      updatedUser.HotelId = null;
    }

    setNewUser(updatedUser);
  };

  const handleSave = async () => {
    try {
      const userData = {
        ...newUser,
        HotelId: newUser.Role === 'Quản lý' ? null : newUser.HotelId,
      };

      await createUser(userData);
      toast.success('Thêm người dùng thành công.');
      onUserAdded(); // Gọi hàm để cập nhật danh sách người dùng
      onClose(); // Đóng modal
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Lỗi khi thêm người dùng.');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Thêm Người Dùng Mới</h2>
          <button
            className={styles.modalClose}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <label>Tên nhân viên:</label>
          <input
            type="text"
            name="FullName"
            value={newUser.FullName}
            onChange={handleInputChange}
          />

          <label>Username:</label>
          <input
            type="text"
            name="UserName"
            value={newUser.UserName}
            onChange={handleInputChange}
          />

          <label>Mật khẩu:</label>
          <input
            type="password"
            name="Password"
            value={newUser.Password}
            onChange={handleInputChange}
          />

          <label>Vai trò:</label>
          <select
            name="Role"
            value={newUser.Role}
            onChange={handleInputChange}
          >
            <option value="" disabled>
              Chọn vai trò
            </option>
            <option value="Nhân viên">Nhân viên</option>
            <option value="Quản lý">Quản lý</option>
          </select>

          {newUser.Role !== 'Quản lý' && (
            <>
              <label>Khách sạn:</label>
              <select
                name="HotelId"
                value={newUser.HotelId || ""}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Chọn khách sạn
                </option>
                {hotels.map((hotel) => (
                  <option key={hotel.HotelId} value={hotel.HotelId}>
                    {hotel.HotelName}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Trạng thái:</label>
          <select
            name="UserStatus"
            value={newUser.UserStatus}
            onChange={handleInputChange}
          >
            <option value={1}>Đang làm việc</option>
            <option value={0}>Nghỉ việc</option>
          </select>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.saveButton} onClick={handleSave}>
            Lưu
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
