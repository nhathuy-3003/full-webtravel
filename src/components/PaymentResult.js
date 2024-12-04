import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Thêm axios để gọi API backend
import styles from './PaymentResult.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing');

  useEffect(() => {
    const handlePaymentResult = async () => {
      const query = new URLSearchParams(location.search);
      const vnp_ResponseCode = query.get('vnp_ResponseCode');
      const vnp_TxnRef = query.get('vnp_TxnRef');

      if (!vnp_ResponseCode || !vnp_TxnRef) {
        toast.error('Không nhận được thông tin thanh toán từ VNPay.');
        setStatus('Failed');
        return;
      }

      try {
        // Gọi backend để xác thực thanh toán
        const response = await axios.post('http://127.0.0.1:8000/api/vnpay_return', {
          vnp_ResponseCode,
          vnp_TxnRef,
          // Bao gồm các tham số khác nếu cần
        });

        if (response.data.status === 'Success') {
          setStatus('Success');
          toast.success('Thanh toán thành công!');
          navigate('/checkout-detail', { state: { booking_id: vnp_TxnRef } });
        } else {
          setStatus('Failed');
          toast.error('Thanh toán thất bại! Vui lòng thử lại hoặc liên hệ hỗ trợ.');
        }
      } catch (error) {
        console.error('Lỗi khi xác thực thanh toán:', error);
        toast.error('Có lỗi xảy ra khi xác thực thanh toán.');
        setStatus('Failed');
      }
    };

    handlePaymentResult();
  }, [location.search, navigate]);

  return (
    <div className={styles.paymentResultContainer}>
      <ToastContainer />
      {status === 'Processing' && <p>Đang xử lý thanh toán...</p>}
      {status === 'Success' && (
        <div>
          <h2>Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
        </div>
      )}
      {status === 'Failed' && (
        <div>
          <h2>Thanh toán thất bại!</h2>
          <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;
