// src/components/dashboard/DashboardOverview.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import styles from './DashboardOverview.module.css';
import { AuthContext } from '../../AuthContext';
import { fetchBookings, fetchBookingsForUser } from '../../api'; // Import các hàm cần thiết

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { authToken, userData, loading: authLoading } = useContext(AuthContext); // Lấy authToken và userData từ AuthContext
  const [bookings, setBookings] = useState([]);
 
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  useEffect(() => {
    const fetchData = async () => {
        if (!authToken || !userData) {
            console.error("Token không hợp lệ hoặc chưa được lưu.");
            navigate('/dashboard-login'); // Điều hướng về trang login nếu không có token
            return;
        }

        try {
            let fetchedBookings = [];
            if (userData.Role === 'Nhân viên') {
                fetchedBookings = await fetchBookingsForUser(authToken, userData.UserId);
            } else {
                fetchedBookings = await fetchBookings(authToken);
            }

            if (fetchedBookings.length === 0) {
                console.warn("Không có booking nào được tìm thấy.");
            }

            setBookings(fetchedBookings);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [authToken, userData, navigate]);


  if (authLoading || loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  // Sample Data for Charts (Bạn có thể thay đổi theo dữ liệu thực tế)
  const barData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Doanh Thu (USD)',
        data: bookings.map((b, index) => b.amount), // Ví dụ: sử dụng số tiền từ các booking
        backgroundColor: '#1abc9c',
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        enabled: true,
        backgroundColor: '#34495e',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 6000,
        ticks: { stepSize: 1000 },
      },
    },
  };

  const pieData = {
    labels: ['Đã Thanh Toán', 'Chờ Thanh Toán', 'Đã Trả Phòng'],
    datasets: [
      {
        data: [
          bookings.filter(b => b.status === 'Đã Thanh Toán').length,
          bookings.filter(b => b.status === 'Chờ Thanh Toán').length,
          bookings.filter(b => b.status === 'Đã Trả Phòng').length,
        ],
        backgroundColor: ['#3498db', '#e74c3c', '#f39c12'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tổng Quan Bảng Điều Khiển</h1>
        <button className={styles.homeButton} onClick={() => navigate('/')}>Trang Chủ</button>
      </div>

      {/* Hiển thị thông tin người dùng */}
      <p>
  Xin chào, {userData.FullName}! Vai trò của bạn là: {userData.Role}.
  Đây là các thống kê về hoạt động gần đây.
</p>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Phòng Đang Đặt</h3>
          <p>{bookings.length}</p>
        </div>
        <div className={styles.card}>
          <h3>Phòng Đã Thanh Toán</h3>
          <p>{bookings.filter(b => b.status === 'Đã Thanh Toán').length}</p>
        </div>
        <div className={styles.card}>
          <h3>Tổng Doanh Thu Tháng</h3>
          <p>${bookings.reduce((acc, b) => acc + b.amount, 0)}</p>
        </div>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.chartContainer}>
          <h3>Doanh Thu Hàng Tháng</h3>
          <div style={{ height: '350px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className={styles.chartContainer}>
          <h3>Trạng Thái Đặt Phòng</h3>
          <div style={{ height: '350px', width: '350px' }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <h3>Chi Tiết Đặt Phòng Gần Đây</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Khách Hàng</th>
              <th>Ngày Đặt</th>
              <th>Trạng Thái</th>
              <th>Số Tiền (USD)</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 5).map((booking) => (
              <tr key={booking.BookingId}>
                <td>#{booking.BookingId}</td>
                <td>{booking.CustomerName}</td>
                <td>{new Date(booking.BookingDate).toLocaleDateString()}</td>
                <td>{booking.status}</td>
                <td>${booking.amount}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="5">Không có booking nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOverview;
