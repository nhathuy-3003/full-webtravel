import React from 'react';
import styles from './LoadingPage.module.css'; // Thêm CSS tùy chỉnh

const LoadingPage = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <h2>Đang tải dữ liệu, vui lòng chờ...</h2>
    </div>
  );
};

export default LoadingPage;
