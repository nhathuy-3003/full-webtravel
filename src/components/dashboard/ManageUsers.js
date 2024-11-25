import React, { useState, useEffect } from "react";
import styles from "./ManageUsers.module.css";
import { fetchUsers, updateUser, fetchAllHotels, deleteUser } from "../../api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddUser from './AddUser'; // Import component thêm người dùng

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersData = await fetchUsers();
      const allHotels = await fetchAllHotels();

      const usersWithHotelName = usersData.map((user) => {
        const userHotel = allHotels.find(
          (hotel) => hotel.HotelId === user.HotelId
        );
        return {
          ...user,
          HotelName: userHotel ? userHotel.HotelName : null,
        };
      });

      setUsers(usersWithHotelName);
      setHotels(allHotels);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error('Lỗi khi tải dữ liệu.');
    }
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setCurrentUser({
      ...user,
      HotelId: user.HotelId || "",
      Password: "", // Add a new field for changing the password
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = {
      ...currentUser,
      [name]: name === 'UserStatus' ? parseInt(value) : value,
    };

    // Nếu vai trò là 'Quản lý', đặt HotelId thành null
    if (name === 'Role' && value === 'Quản lý') {
      updatedUser.HotelId = null;
    }

    setCurrentUser(updatedUser);
  };

  const handleSave = async () => {
    try {
      const updatePayload = {
        ...currentUser,
        HotelId: currentUser.Role === 'Quản lý' ? null : currentUser.HotelId,
      };

      if (!currentUser.Password) {
        delete updatePayload.Password; // Xóa mật khẩu nếu không thay đổi
      }

      await updateUser(currentUser.UserId, updatePayload);

      const updatedHotel = hotels.find(
        (hotel) => hotel.HotelId === parseInt(currentUser.HotelId, 10)
      );

      setUsers(
        users.map((user) =>
          user.UserId === currentUser.UserId
            ? {
                ...currentUser,
                HotelName:
                  currentUser.Role === 'Quản lý'
                    ? 'Tất cả khách sạn'
                    : updatedHotel
                    ? updatedHotel.HotelName
                    : 'Không xác định',
              }
            : user
        )
      );

      setIsEditing(false);
      toast.success('Cập nhật người dùng thành công.');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Lỗi khi cập nhật người dùng.');
    }
  };

  const handleDeleteClick = (userId) => {
    confirmAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa người dùng này không?',
      buttons: [
        {
          label: 'Có',
          onClick: () => handleDeleteUser(userId),
        },
        {
          label: 'Không',
          onClick: () => {},
        },
      ],
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.UserId !== userId));
      toast.success('Xóa người dùng thành công.');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa người dùng.');
    }
  };

  const handleAddUserClick = () => {
    setIsAdding(true);
  };

  return (
    <div className={styles.container}>
      <h1>Quản Lý Người Dùng</h1>
      <p>Xem, chỉnh sửa và quản lý người dùng đã đăng ký.</p>

      <button
        onClick={handleAddUserClick}
        className={styles.addButton}
      >
        Thêm Người Dùng
      </button>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID Người Dùng</th>
            <th>Tên Nhân Viên</th>
            <th>Username</th>
            <th>Khách Sạn</th>
            <th>Trạng Thái</th>
            <th>Vai Trò</th>
            <th>Ngày Tạo</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.UserId}>
              <td>{user.UserId}</td>
              <td>{user.FullName}</td>
              <td>{user.UserName}</td>
              <td>
                {user.HotelId === null || user.HotelId === 0
                  ? 'Tất cả khách sạn'
                  : user.HotelName || 'Không xác định'}
              </td>
              <td>{user.UserStatus === 1 ? 'Đang làm việc' : 'Nghỉ việc'}</td>
              <td>{user.Role}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleEditClick(user)}
                  className={styles.editButton}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteClick(user.UserId)}
                  className={styles.deleteButton}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditing && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Chỉnh sửa thông tin người dùng</h2>
              <button
                className={styles.modalClose}
                onClick={() => setIsEditing(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Các trường thông tin để chỉnh sửa */}
              <label>Tên nhân viên:</label>
              <input
                type="text"
                name="FullName"
                value={currentUser.FullName}
                onChange={handleInputChange}
              />

              <label>Username:</label>
              <input
                type="text"
                name="UserName"
                value={currentUser.UserName}
                onChange={handleInputChange}
              />

              <label>Vai trò:</label>
              <select
                name="Role"
                value={currentUser.Role || ""}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Chọn vai trò
                </option>
                <option value="Nhân viên">Nhân viên</option>
                <option value="Quản lý">Quản lý</option>
              </select>

              {currentUser.Role !== 'Quản lý' && (
                <>
                  <label>Khách sạn:</label>
                  <select
                    name="HotelId"
                    value={currentUser.HotelId || ""}
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
                value={currentUser.UserStatus === undefined ? 1 : currentUser.UserStatus}
                onChange={handleInputChange}
              >
                <option value={1}>Đang làm việc</option>
                <option value={0}>Nghỉ việc</option>
              </select>

              <label>Đổi mật khẩu (nếu có):</label>
              <input
                type="password"
                name="Password"
                placeholder="Nhập mật khẩu mới"
                value={currentUser.Password}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveButton} onClick={handleSave}>
                Lưu
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <AddUser
          onClose={() => setIsAdding(false)}
          onUserAdded={loadData}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default ManageUsers;
