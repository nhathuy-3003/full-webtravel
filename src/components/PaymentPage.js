import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './PaymentPage.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserFriends } from 'react-icons/fa';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    hotelName = '',
    roomName = '',
    roomImage = '',
    price = 0,
    checkInDate: checkInDateStr = null,
    checkOutDate: checkOutDateStr = null,
    adults = 1,
    children = 0,
    hotelId = null,
    roomId = null,
    roomAmenities = [],
  } = location.state || {};

  const checkInDate = checkInDateStr ? new Date(checkInDateStr) : null;
  const checkOutDate = checkOutDateStr ? new Date(checkOutDateStr) : null;
  const orderDate = new Date();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    if (!fullName || !email || !phoneNumber) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ!');
      return false;
    }

    const phoneRegex = /^[0-9]{9,12}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Số điện thoại không hợp lệ!');
      return false;
    }

    return true;
  };

  const handleConfirmPayment = async () => {
    if (!validateInput()) return;

    setLoading(true);

    const payload = {
      HotelId: hotelId,
      RoomId: roomId,
      OrderDate: orderDate.toISOString().split('T')[0],
      DateIn: checkInDate ? checkInDate.toISOString().split('T')[0] : null,
      DateOut: checkOutDate ? checkOutDate.toISOString().split('T')[0] : null,
      BookingOrderType: 'Online',
      BookingPaymentMethod: 'vnpay', // Đặt phương thức thanh toán là 'vnpay'
      BookingTotalAmount: Number(price),
      CustomerName: fullName,
      CustomerPhone: phoneNumber,
      CustomerEmail: email,
      CustomerAddress: '',
    };

    try {
      console.log('Payload gửi đi:', payload);
      const response = await axios.post('http://127.0.0.1:8000/api/booking', payload);

      if (response.data.payment_url) {
        // Chuyển hướng tới URL thanh toán VNPay
        window.location.href = response.data.payment_url;
      } else {
        // Nếu không có URL thanh toán, thông báo thành công và chuyển hướng
        toast.success('Đặt phòng thành công!');
        console.log('Đặt phòng thành công:', response.data);

        navigate('/checkoutpage', {
          state: {
            hotelName,
            roomName,
            roomImage,
            price,
            checkInDate,
            checkOutDate,
            adults,
            children,
            hotelId,
            roomId,
            roomAmenities,
          },
        });
      }
    } catch (error) {
      console.error('Lỗi khi đặt phòng:', error);

      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          toast.error(`${field}: ${error.response.data.errors[field].join(', ')}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(`Lỗi từ API: ${error.response.data.message}`);
      } else {
        toast.error('Đã xảy ra lỗi khi xử lý đặt phòng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <ToastContainer />
      <div className={styles.paymentLeft}>
        <h2>Xác nhận và thanh toán</h2>

        <div className={styles.customerInfo}>
          <h3>Thông tin khách hàng</h3>
          <label>Họ và tên</label>
          <input
            type="text"
            placeholder="Như trong Hộ chiếu/CMND/CCCD"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Số điện thoại</label>
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className={styles.paymentMethod}>
          <h3>Phương thức thanh toán</h3>
          <div className={styles.paymentOptions}>
            {/* Chỉ giữ lại VNPay và áp dụng luôn lớp active */}
            <button
              className={`${styles.paymentButton} ${styles.active}`}
              disabled
            >
              VNPay
            </button>
          </div>
        </div>

        {loading ? (
          <p>Đang xử lý thanh toán...</p>
        ) : (
          <button className={styles.confirmBtn} onClick={handleConfirmPayment}>
            Xác nhận và thanh toán bằng VNPay
          </button>
        )}
      </div>
      <div className={styles.paymentRight}>
        <div className={styles.hotelSummary}>
          <img src={roomImage} alt={roomName} className={styles.hotelImage} />
          <div className={styles.hotelDetails}>
            <h4>{hotelName}</h4>
            <p>
              <strong>Số phòng:</strong> {roomName}
            </p>
          </div>
        </div>

        <div className={styles.tripInfo}>
          <div className={styles.tripDate}>
            <span>Nhận phòng</span>
            <div>
              {checkInDate
                ? `${checkInDate.toLocaleDateString('vi-VN')} - Từ 14:00`
                : 'Chưa chọn'}
            </div>
          </div>
          <div className={styles.tripDate}>
            <span>Trả phòng</span>
            <div>
              {checkOutDate
                ? `${checkOutDate.toLocaleDateString('vi-VN')} - Trước 12:00`
                : 'Chưa chọn'}
            </div>
          </div>
        </div>
        <div className={styles.roomDetails}>
          <p>
            <FaUserFriends /> {adults} Người lớn, {children} Trẻ em
          </p>
          <h4>Tiện nghi phòng:</h4>
          {roomAmenities.length > 0 ? (
            <ul className={styles.amenitiesList}>
              {roomAmenities.map((amenity, index) => (
                <li key={index}>
                  <img
                    src={`http://127.0.0.1:8000/storage/${amenity.AmenityIcon}`}
                    alt={amenity.AmenityName}
                    className={styles.amenityIcon}
                  />
                  {amenity.AmenityName}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có tiện nghi.</p>
          )}
        </div>
        <div className={styles.priceDetails}>
          <div className={styles.priceItem}>
            <span>Giá phòng</span>
            <span>{price.toLocaleString()} VND</span>
          </div>
          <div className={`${styles.priceItem} ${styles.total}`}>
            <span>Tổng cộng</span>
            <span>{price.toLocaleString()} VND</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
