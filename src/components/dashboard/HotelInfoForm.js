import React, { useState, useEffect } from "react";
import { fetchCities, fetchDistrictsByCity, createHotel, fetchAmenities } from "../../api";
import styles from "./HotelInfoForm.module.css";
import LoadingPage from "../../hooks/LoadingPage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HotelInfoForm = ({ onHotelCreated }) => {
  const [formValues, setFormValues] = useState({
    hotelName: "",
    address: "",
    openDay: "",
    cityId: "",
    districtId: "",
    amenities: [],
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách thành phố và tiện nghi khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityData, amenityData] = await Promise.all([
          fetchCities(),
          fetchAmenities(),
        ]);
        setCities(cityData);
        setAmenities(amenityData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  // Xử lý khi chọn thành phố
  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setFormValues((prevState) => ({
      ...prevState,
      cityId,
      districtId: "",
    }));

    try {
      if (cityId) {
        const districtData = await fetchDistrictsByCity(cityId);
        setDistricts(districtData);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  // Xử lý khi nhập thông tin
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Xử lý khi chọn tiện nghi
  const handleAmenityChange = (amenityId) => {
    setFormValues((prevState) => {
      const updatedAmenities = prevState.amenities.includes(amenityId)
        ? prevState.amenities.filter((id) => id !== amenityId)
        : [...prevState.amenities, amenityId];
      return { ...prevState, amenities: updatedAmenities };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hotelData = {
        HotelName: formValues.hotelName,
        HotelAddress: formValues.address,
        OpenDay: formValues.openDay,
        locationCityId: formValues.cityId,
        locationDistrictId: formValues.districtId,
        amenities: formValues.amenities,
      };

      const hotelResponse = await createHotel(hotelData);
      toast.success("Tạo khách sạn thành công!");
      onHotelCreated(hotelResponse.data.HotelId);
    } catch (error) {
      console.error("Error creating hotel:", error);
      toast.error("Đã xảy ra lỗi khi tạo khách sạn.");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <LoadingPage />;
  }
  
  return (
    <div className={styles.container}>
  <ToastContainer position="top-right" autoClose={3000} />
  <form className={styles.form} onSubmit={handleSubmit}>
    <div className={styles.formGroup}>
      <label htmlFor="hotelName" className={styles.label}>Tên Khách Sạn</label>
      <input
        type="text"
        id="hotelName"
        name="hotelName"
        placeholder="Nhập tên khách sạn..."
        value={formValues.hotelName}
        onChange={handleInputChange}
        className={styles.input}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="address" className={styles.label}>Địa Chỉ</label>
      <input
        type="text"
        id="address"
        name="address"
        placeholder="Nhập địa chỉ khách sạn..."
        value={formValues.address}
        onChange={handleInputChange}
        className={styles.input}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="openDay" className={styles.label}>Ngày Mở Cửa</label>
      <input
        type="date"
        id="openDay"
        name="openDay"
        value={formValues.openDay}
        onChange={handleInputChange}
        className={styles.input}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="cityId" className={styles.label}>Thành Phố</label>
      <select
        id="cityId"
        name="cityId"
        value={formValues.cityId}
        onChange={handleCityChange}
        className={styles.input}
        required
      >
        <option value="">Chọn thành phố...</option>
        {cities.map((city) => (
          <option key={city.locationCityId} value={city.locationCityId}>
            {city.locationCityName}
          </option>
        ))}
      </select>
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="districtId" className={styles.label}>Quận</label>
      <select
        id="districtId"
        name="districtId"
        value={formValues.districtId}
        onChange={handleInputChange}
        className={styles.input}
        required
      >
        <option value="">Chọn quận...</option>
        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district["tên quận"]}
          </option>
        ))}
      </select>
    </div>

    <div className={styles.formGroup}>
      <label className={styles.label}>Tiện Nghi</label>
      <div className={styles.amenitiesContainer}>
        {amenities.map((amenity) => (
          <div
            key={amenity.AmenityId}
            className={`${styles.amenity} ${
              formValues.amenities.includes(amenity.AmenityId)
                ? styles.selected
                : ""
            }`}
            onClick={() => handleAmenityChange(amenity.AmenityId)}
          >
            <img
              src={`http://127.0.0.1:8000/storage/${amenity.AmenityIcon}`}
              alt={amenity.AmenityName}
              className={styles.amenityIcon}
            />
            <span className={styles.amenityLabel}>
              {amenity.AmenityName}
            </span>
          </div>
        ))}
      </div>
    </div>

    <button
      type="submit"
      className={styles.submitButton}
      disabled={loading}
    >
      {loading ? "Đang xử lý..." : "Tạo Khách Sạn"}
    </button>
  </form>
</div>

  );
};

export default HotelInfoForm;
