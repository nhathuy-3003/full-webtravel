import React, { useState, useEffect, useContext } from 'react';
import {
  fetchBookings,
  fetchBookingsByHotelId,
  updateBookingById,
  deleteBookingById,
  fetchUserSetting,
} from '../../api';
import styles from './ManageBookings.module.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import LoadingPage from '../../hooks/LoadingPage'; // Import trang chờ
import { AuthContext } from '../../AuthContext'; // Đảm bảo đường dẫn đúng

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [role, setRole] = useState('');
  const [hotelId, setHotelId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authToken } = useContext(AuthContext);

  // Tải thông tin vai trò người dùng và danh sách đặt phòng
  useEffect(() => {
    const loadData = async () => {
        try {
            setLoading(true);

            const user = await fetchUserSetting(authToken); // Thêm authToken vào đây
            setRole(user.Role);
            setHotelId(user.HotelId || null);

            let data = [];
            if (user.Role === 'Quản lý') {
                data = await fetchBookings(authToken); // Thêm authToken vào đây
            } else if (user.Role === 'Nhân viên' && user.HotelId) {
                data = await fetchBookingsByHotelId(user.HotelId, authToken); // Thêm authToken vào đây
            } else {
                console.warn('Vai trò không xác định hoặc không có quyền.');
            }

            setBookings(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    loadData();
}, [authToken]);

  const handleStatusChange = (id, newStatus) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.BookingId === id ? { ...booking, BookingStatus: newStatus } : booking
      )
    );
  };

  const handleSaveStatus = async (id) => {
    try {
      const booking = bookings.find((b) => b.BookingId === id);
      if (!booking) return;

      const payload = { BookingStatus: booking.BookingStatus };
      console.log('Payload sent to the server:', payload);

      await updateBookingById(id, payload);

      alert('Cập nhật trạng thái thành công!');

      // Reload bookings
      let updatedBookings = [];
      if (role === 'Quản lý') {
        updatedBookings = await fetchBookings();
      } else if (role === 'Nhân viên' && hotelId) {
        updatedBookings = await fetchBookingsByHotelId(hotelId);
      }
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Failed to save booking status:', error);
      alert('Cập nhật trạng thái thất bại.');
    }
  };

  const handleDeleteBooking = (id) => {
    confirmAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa booking này không?',
      buttons: [
        {
          label: 'Có',
          onClick: async () => {
            try {
              await deleteBookingById(id);
              setBookings((prevBookings) =>
                prevBookings.filter((booking) => booking.BookingId !== id)
              );
              alert('Xóa booking thành công!');
            } catch (error) {
              console.error('Failed to delete booking:', error);
              alert('Xóa booking thất bại.');
            }
          },
        },
        {
          label: 'Không',
          onClick: () => {
            console.log('Xóa booking đã bị hủy.');
          },
        },
      ],
    });
  };

  const openModal = (booking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  if (loading) {
    return <LoadingPage />; // Hiển thị LoadingPage khi đang tải
  }

  return (
    <div className={styles.container}>
      <h1>Quản Lý Đặt Phòng</h1>
      <p>
        {role === 'Quản lý'
          ? 'Xem, chỉnh sửa và quản lý tất cả các đặt phòng khách sạn và homestay tại đây.'
          : 'Quản lý các đặt phòng thuộc khách sạn mà bạn được gán.'}
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Ngày Đặt</th>
            <th>Người Đặt</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.BookingId}>
              <td>{booking.BookingId}</td>
              <td>{booking.OrderDate}</td>
              <td>{booking.customer?.CustomerName || 'Không rõ'}</td>
              <td>
                <select
                  value={booking.BookingStatus}
                  onChange={(e) =>
                    handleStatusChange(booking.BookingId, e.target.value)
                  }
                  className={styles.statusSelect}
                >
                  <option value="Pending">Chờ</option>
                  <option value="Confirmed">Đã Thanh Toán</option>
                  <option value="Cancelled">Đã Hủy Phòng</option>
                </select>
              </td>
              <td className={styles.actionButtons}>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => openModal(booking)}
                >
                  Chi tiết
                </button>
                <button
                  className={`${styles.button} ${styles.dangerButton}`}
                  onClick={() => handleDeleteBooking(booking.BookingId)}
                >
                  Xóa
                </button>
                <button
                  className={`${styles.button} ${styles.saveButton}`}
                  onClick={() => handleSaveStatus(booking.BookingId)}
                >
                  Lưu
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Chi Tiết Đặt Phòng</h2>
            <p><strong>Booking ID:</strong> {selectedBooking.BookingId}</p>
            <p><strong>Ngày Đặt:</strong> {selectedBooking.OrderDate}</p>
            <p><strong>Người Đặt:</strong> {selectedBooking.customer?.CustomerName}</p>
            <p><strong>Số Điện Thoại:</strong> {selectedBooking.customer?.CustomerPhone}</p>
            <p><strong>Email:</strong> {selectedBooking.customer?.CustomerEmail}</p>
            <p>
  <strong>Khách Sạn:</strong>{' '}
  {selectedBooking.hotel?.HotelName || 'Không rõ'}
</p>

            <p>
              <strong>Phòng:</strong>{' '}
              {selectedBooking.room?.RoomName || `Mã Phòng: ${selectedBooking.RoomId}`}
            </p>
            <p><strong>Nhận Phòng:</strong> {selectedBooking.DateIn}</p>
            <p><strong>Trả Phòng:</strong> {selectedBooking.DateOut}</p>
            <p>
              <strong>Tổng Tiền:</strong>{' '}
              {parseFloat(selectedBooking.BookingTotalAmount).toLocaleString('vi-VN')} VND
            </p>
            <p><strong>Trạng Thái:</strong> {selectedBooking.BookingStatus}</p>
            <button className={styles.closeButton} onClick={closeModal}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
