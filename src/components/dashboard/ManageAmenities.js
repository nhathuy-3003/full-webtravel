import React, { useState, useEffect } from 'react';
import { fetchAmenities, createAmenity, updateAmenity, deleteAmenity } from '../../api';
import styles from './ManageAmenities.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import CSS cho React-Confirm-Alert

const ManageAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState({ AmenityName: '', AmenityIcon: null });
  const [editingAmenity, setEditingAmenity] = useState(null);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const data = await fetchAmenities();
        setAmenities(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách tiện nghi:', error);
        toast.error('Lỗi khi tải danh sách tiện nghi.');
      }
    };

    loadAmenities();
  }, []);

  const handleAddAmenity = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('AmenityName', newAmenity.AmenityName);
    if (newAmenity.AmenityIcon) {
      formData.append('AmenityIcon', newAmenity.AmenityIcon);
    }

    try {
      const newAmenityResponse = await createAmenity(formData);
      setAmenities([...amenities, newAmenityResponse.data]);
      setNewAmenity({ AmenityName: '', AmenityIcon: null });
      toast.success('Thêm tiện nghi thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm tiện nghi:', error);
      toast.error('Không thể thêm tiện nghi.');
    }
  };

  const handleEditAmenity = (amenity) => {
    setEditingAmenity(amenity);
  };

  const handleUpdateAmenity = async (e) => {
    e.preventDefault();
    if (!editingAmenity) return;

    const formData = new FormData();
    formData.append('AmenityName', editingAmenity.AmenityName);
    if (editingAmenity.AmenityIcon) {
      formData.append('AmenityIcon', editingAmenity.AmenityIcon);
    }

    try {
      const updatedAmenity = await updateAmenity(editingAmenity.AmenityId, formData);
      setAmenities((prev) =>
        prev.map((amenity) =>
          amenity.AmenityId === editingAmenity.AmenityId ? updatedAmenity.data : amenity
        )
      );
      setEditingAmenity(null);
      toast.success('Cập nhật tiện nghi thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật tiện nghi:', error);
      toast.error('Không thể cập nhật tiện nghi.');
    }
  };

  const confirmDeleteAmenity = (id) => {
    confirmAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa tiện nghi này không?',
      buttons: [
        {
          label: 'Có',
          onClick: () => handleDeleteAmenity(id),
        },
        {
          label: 'Không',
          onClick: () => {
            toast.info('Hủy xóa tiện nghi.');
          },
        },
      ],
    });
  };

  const handleDeleteAmenity = async (id) => {
    try {
      await deleteAmenity(id);
      setAmenities((prev) => prev.filter((amenity) => amenity.AmenityId !== id));
      toast.success('Xóa tiện nghi thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa tiện nghi:', error);
      toast.error('Không thể xóa tiện nghi.');
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <h1>Quản Lý Tiện Nghi</h1>

      {/* Thêm tiện nghi */}
      <form onSubmit={handleAddAmenity} className={styles.form}>
        <input
          type="text"
          placeholder="Tên tiện nghi"
          value={newAmenity.AmenityName}
          onChange={(e) => setNewAmenity({ ...newAmenity, AmenityName: e.target.value })}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewAmenity({ ...newAmenity, AmenityIcon: e.target.files[0] })}
        />
        <button type="submit" className={styles.addButton}>
          Thêm Tiện Nghi
        </button>
      </form>

      {/* Danh sách tiện nghi */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tên Tiện Nghi</th>
            <th>Biểu Tượng</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {amenities.map((amenity) => (
            <tr key={amenity.AmenityId}>
              <td>
                {editingAmenity?.AmenityId === amenity.AmenityId ? (
                  <input
                    type="text"
                    value={editingAmenity.AmenityName}
                    onChange={(e) =>
                      setEditingAmenity({ ...editingAmenity, AmenityName: e.target.value })
                    }
                  />
                ) : (
                  amenity.AmenityName
                )}
              </td>
              <td>
                {amenity.AmenityIcon && (
                  <img
                    src={`http://127.0.0.1:8000/storage/${amenity.AmenityIcon}`}
                    alt={amenity.AmenityName}
                    className={styles.iconPreview}
                  />
                )}
                {editingAmenity?.AmenityId === amenity.AmenityId && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditingAmenity({ ...editingAmenity, AmenityIcon: e.target.files[0] })
                    }
                  />
                )}
              </td>
              <td>
                {editingAmenity?.AmenityId === amenity.AmenityId ? (
                  <>
                    <button onClick={handleUpdateAmenity}>Lưu</button>
                    <button onClick={() => setEditingAmenity(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditAmenity(amenity)}>Sửa</button>
                    <button onClick={() => confirmDeleteAmenity(amenity.AmenityId)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageAmenities;
