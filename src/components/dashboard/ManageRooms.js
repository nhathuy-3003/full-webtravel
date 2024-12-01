import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../hooks/LoadingPage'; // Import trang chờ
import {
  fetchHotels,
  fetchRoomsByHotelId,
  fetchUserSetting,
  deleteRoomById,
  deleteHotelById,
  updateRoomById,
  fetchAmenities,
  fetchRoomImagesAmbule,
  deleteRoomImage,
  uploadRoomImages,
  updateRoomImageDescription,
} from '../../api';
import styles from './ManageRooms.module.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageRooms = () => {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [allAmenities, setAllAmenities] = useState([]);
  const [roomImages, setRoomImages] = useState([]);
  const navigate = useNavigate();
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);
  
  // Fetch user role and data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await fetchUserSetting(); // Lấy thông tin người dùng
        setRole(user.Role);
  
        if (user.Role === 'Quản lý') {
          // Nếu là Quản lý, tải toàn bộ khách sạn và phòng
          const hotelData = await fetchHotels(); // Tải danh sách khách sạn
          setHotels(hotelData);
  
          const roomsData = {};
          for (const hotel of hotelData) {
            
            const hotelRooms = await fetchRoomsByHotelId(hotel.id); // Tải danh sách phòng theo HotelId
            roomsData[hotel.id] = hotelRooms || [];
          }
          setRooms(roomsData);
  
          const amenitiesData = await fetchAmenities(); // Tải danh sách tiện nghi
          setAllAmenities(amenitiesData);
        } else if (user.Role === 'Nhân viên') {
          // Nếu là Nhân viên, chỉ tải phòng thuộc khách sạn họ quản lý
          if (!user.HotelId) {
            console.error('Nhân viên không có HotelId được gán.');
            console.error('Nhân viên không có HotelId được gán.');
            setRooms([]); // Không có phòng nếu không gán HotelId
            return;
          }
  
          const roomsData = await fetchRoomsByHotelId(user.HotelId); // Tải danh sách phòng
          setRooms({ [user.HotelId]: roomsData }); // Lưu phòng vào object với HotelId làm key
        } else {
          console.warn('Vai trò không được hỗ trợ:', user.Role);
          setRooms([]); // Không hiển thị gì nếu vai trò không được hỗ trợ
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        navigate('/error'); // Điều hướng tới trang lỗi
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [navigate]);

  // Handle edit hotel
  const handleEditHotelClick = (hotelId) => {
    navigate(`/dashboard/edit-hotel/${hotelId}`);
  };

  // Open edit modal for a specific room
  const handleEditRoomClick = async (room) => {
    try {
      setEditingRoom({
        ...room,
        selectedAmenities: room.amenities?.map((a) => a.AmenityId) || [],
      });
      const images = await fetchRoomImagesAmbule(room.RoomId);
      setRoomImages(images);
    } catch (error) {
      notifyError('Lỗi khi tải dữ liệu phòng:', error);
    }
  };

  // Close edit modal
  const handleCloseModal = () => {
    setEditingRoom(null);
    setRoomImages([]);
  };

  // Save room details, amenities, and image descriptions
  const handleSaveRoom = async () => {
    try {
      const updatedRoom = {
        ...editingRoom,
        amenities: editingRoom.selectedAmenities,
      };
  
      console.log('Cập nhật phòng:', updatedRoom);
  
      await updateRoomById(editingRoom.RoomId, updatedRoom); // Cập nhật phòng
      console.log('Cập nhật phòng thành công!');
  
      await handleImageUpload(); // Tải ảnh
      console.log('Tải ảnh thành công!');
  
      // Gọi thông báo thành công
      notifySuccess('Cập nhật phòng thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu phòng:', error);
      notifyError(`Cập nhật phòng thất bại! Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      handleCloseModal(); // Đóng modal
    }
  };
  
  // Delete a room image
  const handleDeleteImage = async (imageId) => {
    try {
      await deleteRoomImage(imageId);
      setRoomImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
      notifySuccess('Xóa ảnh thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa ảnh:', error);
      notifyError('Xóa ảnh thất bại!');
    }
  };

  // Handle delete room
  const handleDeleteRoomClick = async (roomId, hotelId) => {
    confirmAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa phòng này không?',
      buttons: [
        {
          label: 'Có',
          onClick: async () => {
            try {
              await deleteRoomById(roomId); // Gọi API để xóa phòng
              notifySuccess('Xóa phòng thành công!'); // Thông báo thành công
  
              // Cập nhật danh sách phòng sau khi xóa thành công
              const updatedRooms = await fetchRoomsByHotelId(hotelId);
              setRooms((prevRooms) => ({ ...prevRooms, [hotelId]: updatedRooms }));
            } catch (error) {
              console.error('Lỗi khi xóa phòng:', error);
              notifyError('Xóa phòng thất bại!'); // Thông báo lỗi nếu có
            }
          },
        },
        {
          label: 'Không',
          onClick: () => {
            console.log('Hủy xóa phòng');
          },
        },
      ],
    });
  };
  

  // Handle delete hotel
  const handleDeleteHotelClick = (hotelId) => {
    confirmAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa khách sạn này không? Tất cả các phòng sẽ bị xóa.',
      buttons: [
        {
          label: 'Có',
          onClick: async () => {
            try {
              await deleteHotelById(hotelId);
              notifySuccess('Xóa khách sạn thành công!');
              setHotels((prevHotels) => prevHotels.filter((hotel) => hotel.id !== hotelId));
              setRooms((prevRooms) => {
                const updatedRooms = { ...prevRooms };
                delete updatedRooms[hotelId];
                return updatedRooms;
              });
            } catch (error) {
              console.error('Lỗi khi xóa khách sạn:', error);
              notifyError('Xóa khách sạn thất bại!');
            }
          },
        },
        { label: 'Không' },
      ],
    });
  };

  // Upload new images with descriptions
  const handleImageUpload = async () => {
    const formData = new FormData();

    const newImages = roomImages.filter((image) => image.file);

    if (newImages.length === 0) {
      toast.info('Không có ảnh mới để tải lên!');
      return;
    }

    newImages.forEach((image) => {
      formData.append('RoomImageUrl[]', image.file); // Add image file
      formData.append('RoomImageDescription[]', image.description || ''); // Add description
    });

    formData.append('RoomId', editingRoom.RoomId); // Add room ID

    try {
      const uploadedImages = await uploadRoomImages(formData);

      if (Array.isArray(uploadedImages)) {
        setRoomImages((prevImages) => [
          ...prevImages.filter((img) => !img.file), // Keep existing images
          ...uploadedImages.map((img, index) => ({
            ...img,
            description: newImages[index]?.description || '',
          })),
        ]);
        notifySuccess('Tải ảnh thành công!');
      } else {
        console.error('Định dạng phản hồi không mong đợi:', uploadedImages);
        notifyError('Tải ảnh thất bại. Vui lòng kiểm tra API.');
      }
    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error);
      notifyError('Tải ảnh thất bại!');
    }
  };

  const handleUpdateImageDescription = async (image) => {
    try {
      if (!image.id) {
        console.warn('Thiếu ID ảnh, không thể cập nhật mô tả.');
        return;
      }

      await updateRoomImageDescription(image.id, {
        RoomImageDescription: image.description,
      });

      notifySuccess('Cập nhật mô tả thành công!');

      setRoomImages((prevImages) =>
        prevImages.map((img) =>
          img.id === image.id ? { ...img, description: image.description } : img
        )
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật mô tả ảnh:', error);
      notifyError('Cập nhật mô tả thất bại.');
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className={styles.container}>
    <h1>Quản lý Phòng & Khách sạn</h1>
  
    {/* Nút thêm khách sạn chỉ dành cho Quản lý */}
    {role === 'Quản lý' && (
      <div className={styles.actions}>
        <button
          className={styles.addHotelButton}
          onClick={() => navigate('/dashboard/add-hotel')}
        >
          Thêm Khách Sạn
        </button>
      </div>
    )}
  
    {/* Hiển thị danh sách khách sạn và phòng */}
    {role === 'Quản lý' && hotels.length > 0 ? (
      hotels.map((hotel) => (
        <div key={hotel.id} className={styles.hotelSection}>
          <h2>{hotel['tên khách sạn']}</h2>
          <p>Địa chỉ: {hotel['địa chỉ khách sạn']}</p>
          <button
            className={styles.editButton}
            onClick={() => handleEditHotelClick(hotel.id)}
          >
            Sửa
          </button>
          <button
            className={styles.addRoomButton}
            onClick={() => navigate(`/dashboard/add-room/${hotel.id}`)}
          >
            Thêm Phòng
          </button>
          <button
            className={styles.deleteButtonH}
            onClick={() => handleDeleteHotelClick(hotel.id)}
          >
            Xóa Khách Sạn
          </button>
  
          {rooms[hotel.id]?.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên Phòng</th>
                  <th>Giá</th>
                  <th>Loại Phòng</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {rooms[hotel.id].map((room) => (
                  <tr key={room.RoomId}>
                    <td>{room.RoomName}</td>
                    <td>{parseFloat(room.Price).toLocaleString()} VND</td>
                    <td>{room.RoomType}</td>
                    <td>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditRoomClick(room)}
                      >
                        Sửa
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() =>
                          handleDeleteRoomClick(room.RoomId, hotel.id)
                        }
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có phòng trong khách sạn này.</p>
          )}
        </div>
      ))
    ) : role === 'Nhân viên' && Object.keys(rooms).length > 0 ? (
      <div className={styles.hotelSection}>
        <h2>Phòng của khách sạn ID: {Object.keys(rooms)[0]}</h2>
  
        <button
          className={styles.addRoomButton}
          onClick={() =>
            navigate(`/dashboard/add-room/${Object.keys(rooms)[0]}`)
          }
        >
          Thêm Phòng
        </button>
  
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên Phòng</th>
              <th>Giá</th>
              <th>Loại Phòng</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {rooms[Object.keys(rooms)[0]].map((room) => (
              <tr key={room.RoomId}>
                <td>{room.RoomName}</td>
                <td>{parseFloat(room.Price).toLocaleString()} VND</td>
                <td>{room.RoomType}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditRoomClick(room)}
                  >
                    Sửa
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() =>
                      handleDeleteRoomClick(room.RoomId, Object.keys(rooms)[0])
                    }
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>Không có khách sạn hoặc phòng nào để hiển thị.</p>
    )}
 
  
      {editingRoom && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ✕
            </button>
            <h2>Sửa Phòng</h2>

            <div className={styles.field}>
              <label>Tên Phòng:</label>
              <input
                type="text"
                value={editingRoom.RoomName}
                onChange={(e) =>
                  setEditingRoom({ ...editingRoom, RoomName: e.target.value })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Giá:</label>
              <input
                type="number"
                value={editingRoom.Price}
                onChange={(e) =>
                  setEditingRoom({ ...editingRoom, Price: e.target.value })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Loại Phòng:</label>
              <input
                type="text"
                value={editingRoom.RoomType}
                onChange={(e) =>
                  setEditingRoom({ ...editingRoom, RoomType: e.target.value })
                }
              />
            </div>

            <div className={styles.field}>
  <label>Tiện Nghi:</label>
  <div className={styles.amenities}>
    {allAmenities.map((amenity) => (
      <div
        key={amenity.AmenityId}
        className={`${styles.amenityItem} ${
          editingRoom.selectedAmenities.includes(amenity.AmenityId) ? styles.selected : ''
        }`}
        onClick={() => {
          const isSelected = editingRoom.selectedAmenities.includes(amenity.AmenityId);
          const updatedAmenities = isSelected
            ? editingRoom.selectedAmenities.filter((id) => id !== amenity.AmenityId)
            : [...editingRoom.selectedAmenities, amenity.AmenityId];

          setEditingRoom((prev) => ({
            ...prev,
            selectedAmenities: updatedAmenities,
          }));
        }}
      >
        <img
          src={`http://127.0.0.1:8000/storage/${amenity.AmenityIcon}`}
          alt={amenity.AmenityName}
          className={styles.amenityIcon}
        />
        <span>{amenity.AmenityName}</span>
      </div>
    ))}
  </div>
</div>

            <div className={styles.field}>
              <label>Ảnh Hiện Tại:</label>
              <div className={styles.imageGrid}>
                {roomImages.map((image, index) => (
                  <div
                    key={image.id || `new-${index}`}
                    className={styles.imageItem}
                  >
                    <img
                      src={image.url || URL.createObjectURL(image.file)}
                      alt={image.description || 'Room Image'}
                    />
                    <input
                      type="text"
                      placeholder="Mô tả ảnh"
                      value={image.description ?? ''}
                      onChange={(e) => {
                        const newDescription = e.target.value;
                        setRoomImages((prevImages) =>
                          prevImages.map((img) =>
                            img.id === image.id
                              ? { ...img, description: newDescription }
                              : img
                          )
                        );
                      }}
                    />
                    {image.id && (
                      <button onClick={() => handleUpdateImageDescription(image)}>
                        Cập Nhật Mô Tả
                      </button>
                    )}
                    <button onClick={() => handleDeleteImage(image.id)}>
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>Thêm Ảnh Mới:</label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  const newImages = Array.from(files).map((file) => ({
                    file,
                    description: '',
                  }));
                  setRoomImages((prevImages) => [...prevImages, ...newImages]);
                }}
              />
            </div>

            <div className={styles.actions}>
              <button onClick={handleSaveRoom}>Lưu</button>
              <ToastContainer/>
              <button onClick={handleCloseModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
