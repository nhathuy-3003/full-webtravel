import React, { useState, useEffect, useCallback } from "react";
import styles from "./ManageUsers.module.css";
import {
  fetchUsers,
  updateUser,
  fetchAllHotels,
  deleteUser,
  fetchUserSetting,
} from "../../api";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import AddUser from "./AddUser"; // Import component thêm người dùng

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate(); // Để điều hướng

  // Di chuyển hàm loadData ra ngoài useEffect và sử dụng useCallback
  const loadData = useCallback(async () => {
    try {
      const user = await fetchUserSetting(); // Lấy thông tin người dùng

      if (user.Role !== "Quản lý") {
        navigate("/dashboard/not-authorized"); // Chuyển hướng nếu không phải "Quản lý"
        return;
      }

      const usersData = await fetchUsers();
      const allHotels = await fetchAllHotels();

      if (!Array.isArray(usersData)) {
        throw new Error("fetchUsers không trả về mảng hợp lệ.");
      }

      if (!Array.isArray(allHotels)) {
        throw new Error("fetchAllHotels không trả về mảng hợp lệ.");
      }

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
      toast.error("Lỗi khi tải dữ liệu.");
    }
  }, [navigate]);

  useEffect(() => {
    loadData(); // Gọi hàm loadData đã được định nghĩa bên ngoài
  }, [loadData]);

  // ... (Phần còn lại của thành phần không thay đổi)

  const handleEditClick = (user) => {
    setIsEditing(true);
    setCurrentUser({
      ...user,
      HotelId: user.HotelId || "",
      Password: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setCurrentUser({
      ...currentUser,
      [name]: name === "UserStatus" ? parseInt(value) : value,
    });
  };

  const handleSave = async () => {
    try {
      const updatePayload = {
        ...currentUser,
      };

      if (!currentUser.Password) {
        delete updatePayload.Password;
      }

      console.log("Update payload:", updatePayload);

      await updateUser(currentUser.UserId, updatePayload);

      await loadData(); // Reload users
      setIsEditing(false);
      toast.success("Cập nhật người dùng thành công.");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Lỗi khi cập nhật người dùng.");
    }
  };

  const handleDeleteClick = (userId) => {
    confirmAlert({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa người dùng này không?",
      buttons: [
        {
          label: "Có",
          onClick: () => handleDeleteUser(userId),
        },
        {
          label: "Không",
          onClick: () => {},
        },
      ],
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.UserId !== userId));
      toast.success("Xóa người dùng thành công.");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Lỗi khi xóa người dùng.");
    }
  };

  const handleAddUserClick = () => {
    setIsAdding(true);
  };

  return (
    <div className={styles.container}>
      <h1>Quản Lý Người Dùng</h1>
      <p>Xem, chỉnh sửa và quản lý người dùng đã đăng ký.</p>

      <button onClick={handleAddUserClick} className={styles.addButton}>
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
                  ? "Tất cả khách sạn"
                  : user.HotelName || "Không xác định"}
              </td>
              <td>{user.UserStatus === 1 ? "Đang làm việc" : "Nghỉ việc"}</td>
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

              <label>Trạng thái:</label>
              <select
                name="UserStatus"
                value={
                  currentUser.UserStatus === undefined
                    ? 1
                    : currentUser.UserStatus
                }
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
        <AddUser onClose={() => setIsAdding(false)} onUserAdded={loadData} />
      )}

      <ToastContainer />
    </div>
  );
};

export default ManageUsers;
