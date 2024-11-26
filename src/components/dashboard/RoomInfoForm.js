import React, { useState, useEffect } from 'react';
import { createRoom, fetchAmenities, fetchHotels } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './RoomInfoForm.module.css';
import LoadingPage from '../../hooks/LoadingPage'; // Import trang chờ

const RoomInfoForm = ({ hotelId, onRoomCreated }) => {
  const [formValues, setFormValues] = useState({
    hotelId: hotelId || '',
    roomName: '',
    roomType: '',
    roomStatus: '',
    maxCustomer: 1,
    price: '',
    description: '',
    amenities: [],
  });

  const [hotels, setHotels] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true); // Loading state for page
  const [selectedHotelName, setSelectedHotelName] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const amenityData = await fetchAmenities();
        setAmenities(amenityData);

        const hotelData = await fetchHotels();
        setHotels(hotelData);

        if (hotelId) {
          const selectedHotel = hotelData.find(
            (hotel) => hotel.id.toString() === hotelId.toString()
          );
          if (selectedHotel) {
            setSelectedHotelName(selectedHotel['tên khách sạn']);
          }
        }
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu.');
        console.error('Error fetching data:', error);
      } finally {
        setLoadingPage(false); // Turn off the loading page
      }
    };

    fetchData();
  }, [hotelId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleAmenityChange = (amenityId) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenityId)) {
        return prev.filter((id) => id !== amenityId); // Remove if already selected
      } else {
        return [...prev, amenityId]; // Add if not selected
      }
    }); 
    setFormValues((prev) => ({
      ...prev,
      amenities: selectedAmenities.includes(amenityId)
        ? selectedAmenities.filter((id) => id !== amenityId)
        : [...selectedAmenities, amenityId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValues.hotelId && !hotelId) {
      toast.warn('Vui lòng chọn khách sạn.');
      return;
    }

    setLoading(true);

    try {
      const roomData = {
        HotelId: hotelId || formValues.hotelId,
        RoomName: formValues.roomName,
        RoomType: formValues.roomType,
        RoomStatus: formValues.roomStatus,
        MaxCustomer: formValues.maxCustomer,
        Price: formValues.price,
        Description: formValues.description,
        amenities: formValues.amenities,
      };

      const response = await createRoom(roomData);
      toast.success('Phòng được tạo thành công!');
      onRoomCreated(response.data.RoomId);
    } catch (error) {
      if (error.response) {
        console.error('Lỗi từ server:', error.response.data);
        toast.error('Lỗi: ' + (error.response.data.message || 'Không xác định'));
      } else {
        console.error('Lỗi không xác định:', error.message);
        toast.error('Lỗi không xác định');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return <LoadingPage />;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <ToastContainer />
      {hotelId ? (
        <div className={styles.formGroup}>
          <label>Khách Sạn:</label>
          <p>{selectedHotelName}</p>
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label>Chọn Khách Sạn</label>
          <select
            name="hotelId"
            value={formValues.hotelId}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Chọn khách sạn --</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel['tên khách sạn']}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Tên Phòng</label>
        <input
          type="text"
          name="roomName"
          value={formValues.roomName}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Kiểu Phòng</label>
        <input
          type="text"
          name="roomType"
          value={formValues.roomType}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Trạng Thái</label>
        <input
          type="text"
          name="roomStatus"
          value={formValues.roomStatus}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Số Khách Tối Đa</label>
        <input
          type="number"
          name="maxCustomer"
          value={formValues.maxCustomer}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Giá</label>
        <input
          type="number"
          name="price"
          value={formValues.price}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Mô Tả</label>
        <textarea
          name="description"
          value={formValues.description}
          onChange={handleInputChange}
          required
        ></textarea>
      </div>
      <div className={styles.formGroup}>
        <label>Tiện Nghi:</label>
        <div className={styles.amenities}>
          {amenities.map((amenity) => (
            <div
              key={amenity.AmenityId}
              className={`${styles.amenityItem} ${
                selectedAmenities.includes(amenity.AmenityId)
                  ? styles.selected
                  : ''
              }`}
              onClick={() => handleAmenityChange(amenity.AmenityId)}
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity.AmenityId)}
                onChange={() => handleAmenityChange(amenity.AmenityId)}
                style={{ display: 'none' }}
              />
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
      <button type="submit" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Tạo Phòng'}
      </button>
    </form>
  );
};

export default RoomInfoForm;
