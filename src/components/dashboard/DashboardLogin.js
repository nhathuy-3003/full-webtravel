import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardLogin.module.css";
import { login } from "../../api"; // Hàm login từ API
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../AuthContext";

const DashboardLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext); // Hàm login từ AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Quản lý"); // Vai trò mặc định là "Quản lý"
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Gửi vai trò cùng với thông tin đăng nhập
      const response = await login(username, password, role);

      if (response && response.token) {
        // Kiểm tra vai trò trả về từ API
        const userRole = response.user?.Role?.trim(); // Lấy vai trò từ API
        const selectedRole = role.trim(); // Vai trò được chọn từ giao diện

        if (!userRole) {
          toast.error("Không xác định được vai trò từ API.");
          console.error("Vai trò từ API:", response);
          return;
        }

        // So sánh vai trò giữa API và người dùng chọn
        if (userRole.toLowerCase() !== selectedRole.toLowerCase()) {
          toast.error(`Chỉ tài khoản có vai trò "${selectedRole}" mới được đăng nhập!`);
          return;
        }

        // Lưu thông tin người dùng và token
        authLogin(response.token, response.user);

        toast.success("Đăng nhập thành công! Đang chuyển hướng...");

        // Chuyển hướng tới Dashboard sau khi đăng nhập thành công
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.error("Thông tin đăng nhập không đúng.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Có lỗi xảy ra.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.roleButtons}>
        <button
          className={`${styles.roleButton} ${
            role === "Quản lý" ? styles.activeRole : ""
          }`}
          onClick={() => setRole("Quản lý")}
        >
          Đăng nhập với quyền Quản lý
        </button>
        <button
          className={`${styles.roleButton} ${
            role === "Nhân viên" ? styles.activeRole : ""
          }`}
          onClick={() => setRole("Nhân viên")}
        >
          Đăng nhập với quyền Nhân viên
        </button>
      </div>

      <div className={styles.loginBox}>
        <h2 className={styles.title}>
          Đăng Nhập {role === "Quản lý" ? "Quản lý" : "Nhân viên"}
        </h2>
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

        <ToastContainer />
      </div>
    </div>
  );
};

export default DashboardLogin;
