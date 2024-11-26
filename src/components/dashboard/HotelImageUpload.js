import React, { useState } from "react";
import { uploadHotelImages } from "../../api";
import styles from "./HotelImageUpload.module.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HotelImageUpload = ({ hotelId }) => {
  const [images, setImages] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10); // Giới hạn tối đa 10 ảnh
    setImages(files);
    setDescriptions(files.map(() => "")); // Tạo danh sách mô tả rỗng
  };

  const handleDescriptionChange = (index, value) => {
    const updatedDescriptions = [...descriptions];
    updatedDescriptions[index] = value;
    setDescriptions(updatedDescriptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!images || images.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một ảnh để upload.");
      }

      if (!hotelId) {
        throw new Error("HotelId không tồn tại. Vui lòng thử lại.");
      }

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("ImageUrl[]", image);
        formData.append(
          "HotelImageDescription[]",
          descriptions[index] || "Không có mô tả"
        );
      });
      formData.append("HotelId", hotelId);

      await uploadHotelImages(formData);
      toast.success("Upload ảnh thành công!");
      setTimeout(() => navigate("/dashboard/rooms"), 2000); // Điều hướng sau 2 giây
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      toast.error(error.message || "Đã xảy ra lỗi trong quá trình upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept="image/*"
          className={styles.inputFile}
        />
        <div className={styles.preview}>
          {images.map((file, index) => (
            <div key={index} className={styles.imageItem}>
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className={styles.previewImage}
              />
              <input
                type="text"
                placeholder={`Mô tả ảnh ${index + 1}`}
                value={descriptions[index]}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className={styles.descriptionInput}
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Đang xử lý..." : "Upload Ảnh"}
        </button>
      </form>
    </div>
  );
};

export default HotelImageUpload;
