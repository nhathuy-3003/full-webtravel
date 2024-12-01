// src/api.js
import axios from 'axios';

// Tạo một instance axios để sử dụng cho tất cả các yêu cầu
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // URL cơ sở của API
  headers: {
    'Content-Type': 'application/json', // Loại nội dung là JSON
  },
});

// ==========================================================
// 1. Địa điểm (Thành phố và Quận/Huyện)
// ==========================================================

// Lấy danh sách thành phố
export const fetchCities = async () => {
  try {
    const response = await api.get('/locationCity'); // Gửi yêu cầu GET
    return response.data.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thành phố:", error);
    throw error; // Ném lỗi để xử lý bên ngoài
  }
};

// Lấy danh sách quận/huyện của một thành phố dựa trên ID thành phố
export const fetchDistrictsByCity = async (locationCityId) => {
  try {
    const response = await api.get(`/locationCity/${locationCityId}/locationDistrict`);
    console.log("Phản hồi API cho danh sách quận/huyện:", response.data.data); // Debug
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quận/huyện:", error);
    throw error;
  }
};

// ==========================================================
// 2. Khách sạn
// ==========================================================

// Lấy danh sách khách sạn dựa trên bộ lọc
export const fetchHotels = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Thêm các tham số lọc vào URL
    if (filters.city) params.append('city', filters.city); // Tên thành phố
    if (filters.district) params.append('district', filters.district); // Tên quận/huyện
    if (filters.checkIn) params.append('checkIn', filters.checkIn);
    if (filters.checkOut) params.append('checkOut', filters.checkOut);
    if (filters.adults) params.append('adults', filters.adults);
    if (filters.children) params.append('children', filters.children);

    const response = await api.get(`/hotel?${params.toString()}`);
    console.log("Phản hồi API cho khách sạn:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách sạn:", error);
    throw error;
  }
};

// Lấy danh sách tất cả khách sạn
export const fetchAllHotels = async (authToken) => {
  try {
    const response = await api.get('/hotel', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const hotels = response.data.data.map((hotel) => ({
      HotelId: hotel.HotelId || hotel.id,
      HotelName: hotel.HotelName || hotel['tên khách sạn'],
    }));
    return hotels;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách sạn:", error);
    throw error;
  }
};

// Lấy chi tiết khách sạn dựa trên ID
export const fetchHotelDetails = async (id, authToken) => { // Thêm authToken
  if (!id) {
    console.error("fetchHotelDetails called with invalid ID:", id);
    throw new Error("Invalid Hotel ID");
  }

  try {
    const response = await api.get(`/hotel/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Hotel details fetched:", response.data.data); // Debug
    return response.data.data; // Return hotel data
  } catch (error) {
    console.error("Error fetching hotel details for ID:", id, error);
    throw error;
  }
};

// Thêm khách sạn mới
export const createHotel = async (hotelData, authToken) => { // Thêm authToken
  try {
    const response = await api.post("/hotel", hotelData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Phản hồi từ API (Thêm khách sạn):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm khách sạn:", error);
    throw error;
  }
};

// Cập nhật khách sạn
export const updateHotelById = async (hotelId, hotelData, authToken) => { // Thêm authToken
  if (!hotelId) {
    console.error("Error: Missing hotelId for update.");
    throw new Error("HotelId is required.");
  }

  try {
    const response = await api.put(`/hotel/${hotelId}`, hotelData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Hotel update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating hotel:", error);
    throw error;
  }
};

// Xóa khách sạn theo ID
export const deleteHotelById = async (hotelId, authToken) => { // Thêm authToken
  if (!hotelId) throw new Error('HotelId không hợp lệ hoặc bị thiếu.');
  try {
    const response = await api.delete(`/hotel/${hotelId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log(`Khách sạn (ID: ${hotelId}) đã bị xóa thành công.`);
    return response.data; // Trả về dữ liệu từ backend (nếu có)
  } catch (error) {
    console.error(`Lỗi khi xóa khách sạn (HotelId: ${hotelId}):`, error.response?.data || error.message);
    throw error;
  }
};

// ==========================================================
// 3. Tiện nghi (Amenities)
// ==========================================================

// Lấy danh sách tiện nghi
export const fetchAmenities = async (authToken) => { // Thêm authToken
  try {
    const response = await api.get('/amenities', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data.data; // Trả về danh sách tiện nghi
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tiện nghi:", error);
    throw error;
  }
};

// Thêm tiện nghi mới
export const createAmenity = async (formData, authToken) => { // Thêm authToken
  try {
    const response = await api.post('/amenities', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm tiện nghi:', error);
    throw error;
  }
};

// Cập nhật tiện nghi
export const updateAmenity = async (amenityId, formData, authToken) => { // Thêm authToken
  try {
    const response = await api.put(`/amenities/${amenityId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật tiện nghi:', error);
    throw error;
  }
};

// Xóa tiện nghi
export const deleteAmenity = async (amenityId, authToken) => { // Thêm authToken
  try {
    const response = await api.delete(`/amenities/${amenityId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa tiện nghi:', error);
    throw error;
  }
};

// ==========================================================
// 4. Hình ảnh khách sạn
// ==========================================================

// Lấy danh sách hình ảnh khách sạn theo ID khách sạn
export const fetchHotelImages = async (hotelId, authToken) => { // Thêm authToken
  if (!hotelId) {
    console.error("fetchHotelImages được gọi mà không có hotelId.");
    return [];
  }

  try {
    const response = await api.get(`/hotel/${hotelId}/hotelImg`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.data || !Array.isArray(response.data)) {
      console.error("Định dạng phản hồi API không hợp lệ:", response);
      return [];
    }

    return response.data.map((image) => ({
      id: image.HotelImageId,
      url: `http://127.0.0.1:8000/storage/${image.ImageUrl}`,
      description: image.HotelImageDescription,
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hình ảnh khách sạn:", error);
    throw error;
  }
};

// Upload hình ảnh khách sạn
export const uploadHotelImages = async (formData, authToken) => { // Thêm authToken
  try {
    const response = await api.post("/hotelImg", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi upload hình ảnh khách sạn:", error);
    throw error;
  }
};

// Cập nhật mô tả hình ảnh khách sạn
export const updateHotelImageDescription = async (imageId, data, authToken) => { // Thêm authToken
  try {
    const response = await api.put(`/hotelImg/${imageId}`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật mô tả hình ảnh:", error);
    throw error;
  }
};

// Xóa hình ảnh khách sạn
export const deleteHotelImage = async (imageId, authToken) => { // Thêm authToken
  if (!imageId) throw new Error('ImageId không hợp lệ hoặc bị thiếu.');
  try {
    const response = await api.delete(`/hotelImg/${imageId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa hình ảnh khách sạn:", error);
    throw error;
  }
};

// ==========================================================
// 5. Phòng
// ==========================================================

// Lấy danh sách phòng theo ID khách sạn
export const fetchRoomsByHotelId = async (hotelId, authToken) => { // Thêm authToken
  try {
    const response = await api.get(`/hotel/${hotelId}/rooms`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data.data || [];
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn(`Không tìm thấy phòng cho khách sạn ID: ${hotelId}`);
      return [];
    }
    console.error("Lỗi khi lấy danh sách phòng:", error);
    throw error;
  }
};


// Tạo phòng mới
export const createRoom = async (roomData, authToken) => { // Thêm authToken
  try {
    const response = await api.post('/rooms', roomData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo phòng:", error.response?.data || error.message);
    throw error;
  }
};

// Cập nhật phòng
export const updateRoomById = async (roomId, roomData, authToken) => { // Thêm authToken
  if (!roomId) throw new Error('RoomId không hợp lệ hoặc bị thiếu.');
  try {
    const response = await api.put(`/rooms/${roomId}`, roomData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật phòng (RoomId: ${roomId}):`, error.response?.data || error.message);
    throw error;
  }
};

// Xóa phòng
export const deleteRoomById = async (roomId, authToken) => { // Thêm authToken
  try {
    const response = await api.delete(`/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa phòng (RoomId: ${roomId}):`, error);
    throw error;
  }
};

// ==========================================================
// 6. Hình ảnh phòng
// ==========================================================

// Lấy danh sách hình ảnh của một phòng dựa trên ID phòng
export const fetchRoomImages = async (roomId, authToken) => { // Thêm authToken
  try {
    const response = await api.get(`/room/${roomId}/images`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Hình ảnh phòng được lấy:', roomId, ':', response.data);
    return response.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hình ảnh phòng:", error);
    throw error;
  }
};

// Cách khác để lấy danh sách hình ảnh phòng với định dạng cụ thể
export const fetchRoomImagesAmbule = async (roomId, authToken) => { // Thêm authToken
  try {
    const response = await api.get(`/room/${roomId}/images`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Hình ảnh phòng được lấy:', roomId, response.data);
    return response.data.map((image) => ({
      id: image.RoomImageId,
      url: `http://127.0.0.1:8000/storage/${image.RoomImageUrl}`,
      description: image.RoomImageDescription || '',
    }));
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách hình ảnh phòng (RoomId: ${roomId}):`, error);
    return [];
  }
};

// Upload hình ảnh của phòng
export const uploadRoomImages = async (formData, authToken) => { // Thêm authToken
  try {
    const response = await api.post("/roomImg", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error uploading room images:", error);
    throw error;
  }
};

// Cập nhật mô tả hình ảnh của phòng
export const updateRoomImageDescription = async (imageId, data, authToken) => { // Thêm authToken
  try {
    const response = await api.put(`/roomImg/${imageId}`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật mô tả hình ảnh:", error);
    throw error;
  }
};

// Xóa hình ảnh của phòng
export const deleteRoomImage = async (imageId, authToken) => { // Thêm authToken
  if (!imageId) throw new Error('ImageId không hợp lệ hoặc bị thiếu.');
  try {
    const response = await api.delete(`/roomImg/${imageId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa hình ảnh phòng:", error);
    throw error;
  }
};

// ==========================================================
// 7. Booking
// ==========================================================

// Lấy danh sách booking
export const fetchBookings = async (authToken) => {
  try {
    const response = await api.get('/booking', {
      headers: {
        Authorization: `Bearer ${authToken}`, // Đảm bảo token đúng
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách booking:', error);
    throw error;
  }
};

// Lấy chi tiết booking theo ID
export const fetchBookingDetails = async (bookingId, authToken) => { // Thêm authToken
  if (!bookingId) throw new Error('BookingId không hợp lệ hoặc bị thiếu.');

  try {
    const response = await api.get(`/booking/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data.data; // Trả về thông tin chi tiết booking
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết booking (BookingId: ${bookingId}):`, error);
    throw error;
  }
};

// Tạo booking mới
export const createBooking = async (bookingData, authToken) => { // Thêm authToken
  try {
    const response = await api.post('/booking', bookingData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Phản hồi từ API (Tạo booking):", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo booking:", error.response?.data || error.message);
    throw error;
  }
};

// Cập nhật booking theo ID
export const updateBookingById = async (bookingId, bookingData, authToken) => { // Thêm authToken
  try {
    const response = await api.put(`/booking/${bookingId}`, bookingData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật booking (BookingId: ${bookingId}):`, error.response?.data || error.message);
    throw error;
  }
};

// Xóa booking theo ID
export const deleteBookingById = async (bookingId, authToken) => { // Thêm authToken
  if (!bookingId) throw new Error('BookingId không hợp lệ hoặc bị thiếu.');
  try {
    const response = await api.delete(`/booking/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa booking (BookingId: ${bookingId}):`, error);
    throw error;
  }
};
// Lấy danh sách booking cho một user cụ thể (Nhân viên)
export const fetchBookingsForUser = async (authToken, userId) => {
  try {
      const response = await api.get(`/booking/user/${userId}`, {
          headers: {
              Authorization: `Bearer ${authToken}`,
          },
      });
      return response.data.data || [];
  } catch (error) {
      console.error("Lỗi khi lấy danh sách booking cho user:", error);
      return [];
  }
};
// ==========================================================
// 8. Người dùng
// ==========================================================




// Lấy danh sách người dùng

// src/api.js

export const fetchUsers = async (authToken) => {
  try {
    const response = await api.get('/users', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    throw error;
  }
};


// Lấy thông tin người dùng từ token (đổi tên hàm)


export const fetchUserSetting = async (token) => {
  try {
    const response = await api.get('/user/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      return response.data; // Trả về dữ liệu người dùng
    } else {
      throw new Error('Không có dữ liệu người dùng.');
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    throw error;
  }
};


// Thay đổi mật khẩu người dùng
export const updatePassword = async (token, currentPassword, newPassword) => {
  try {
    const response = await api.post(
      '/change-password',
      {
        currentPassword,
        newPassword,
        newPassword_confirmation: newPassword, // Nếu cần xác nhận mật khẩu
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thay đổi mật khẩu:', error.response || error.message);
    throw error;
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userId, userData, authToken) => {
  if (!userId) {
    console.error("Error: Missing userId for update.");
    throw new Error("UserId is required.");
  }

  try {
    const response = await api.put(`/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("User update response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating user (UserId: ${userId}):`, error.response?.data || error.message);
    throw error;
  }
};


// Hàm login
export const login = async (username, password, role) => {
  try {
    const response = await api.post('/login', {
      UserName: username,
      Password: password,
      Role: role, // Gửi vai trò đến API
    });

    if (response.data && response.data.token) {
      return {
        token: response.data.token,
        user: response.data.user, // Thông tin người dùng
      };
    } else {
      throw new Error('Không có token trong phản hồi');
    }
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    throw error;
  }
};


// Tạo mới user
export const createUser = async (userData, authToken) => { // Thêm authToken
  try {
    const response = await api.post('/users', userData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo người dùng:', error.response || error.message);
    throw error;
  }
};

// Xóa user
export const deleteUser = async (userId, authToken) => { // Thêm authToken
  try {
    const response = await api.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error.response || error.message);
    throw error;
  }
};

// ==========================================================
// 9. Comments
// ==========================================================

// Fetch comments for a specific hotel
export const fetchComments = async (hotelId, authToken) => { // Thêm authToken
  try {
    const response = await api.get(`/comment/hotel/${hotelId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }); // Gọi API với /hotel/{hotelId}
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bình luận:', error);
    throw error;
  }
};

// Lấy tất cả bình luận
export const fetchAllComments = async (authToken) => { // Thêm authToken
  try {
    const response = await api.get('/comment', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }); // Gọi API để lấy tất cả bình luận
    return response.data.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bình luận:', error);
    throw error;
  }
};

// Cập nhật trạng thái bình luận
export const updateComment = async (commentId, data, authToken) => { // Thêm authToken
  if (!commentId) {
    console.error("commentId không hợp lệ:", commentId);
    throw new Error("CommentId không được để trống.");
  }

  try {
    const response = await api.put(`/comment/${commentId}`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật bình luận:", error.response || error.message);
    throw error;
  }
};

// Xóa bình luận
export const deleteComment = async (commentId, authToken) => { // Thêm authToken
  if (!commentId) {
    console.error("CommentId không hợp lệ:", commentId);
    throw new Error("CommentId không được để trống.");
  }

  try {
    const response = await api.delete(`/comment/${commentId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }); // Đường dẫn API chính xác
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    throw error;
  }
};

// Post a new comment
export const postComment = async (hotelId, comment, authToken) => { // Thêm authToken
  try {
    const response = await api.post(`/comment`, {
      ...comment,
      HotelId: hotelId, // Include the hotel ID in the payload
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data; // Adjust this to match your backend response structure
  } catch (error) {
    console.error('Failed to post comment:', error);
    throw error;
  }
};


// Thêm interceptor để tự động thêm authToken

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;
