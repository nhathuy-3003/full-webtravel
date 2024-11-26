import React, { useState } from "react";
import { uploadRoomImages } from "../../api";
import styles from "./RoomImageUpload.module.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoomImageUpload = ({ roomId }) => {
  const [images, setImages] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setImages(files);
    setDescriptions(files.map(() => ""));
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
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`RoomImageUrl[${index}]`, image);
        formData.append(`RoomImageDescription[${index}]`, descriptions[index] || "");
      });
      formData.append("RoomId", roomId);

      await uploadRoomImages(formData);
      toast.success("Upload ảnh thành công!");
      setTimeout(() => navigate("/dashboard/rooms"), 3000); // Chuyển hướng sau 3 giây
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Không thể upload ảnh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <div className={styles.preview}>
          {images.map((file, index) => (
            <div key={index} className={styles.imagePreview}>
              <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
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
        <button type="submit" disabled={loading} className={styles.uploadButton}>
          {loading ? "Đang xử lý..." : "Upload Ảnh"}
        </button>
      </form>
    </div>
  );
};

export default RoomImageUpload;
