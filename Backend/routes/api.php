<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\HotelImageController;
use App\Http\Controllers\LocationCityController;
use App\Http\Controllers\LocationDistrictController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomImageController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\RevenueController;

Route::get('/user', function (Request $request) {
    \Log::info('Dữ liệu nhận từ Frontend:', $request->all());
    return $request->user();
})->middleware('auth:sanctum');

// ** Khúc này khi làm tới đâu nhớ khai báo đường dẫn API
// ** VD làm bảng locationCity thì khai báo giống vậy thì 
// ** Khi gắn link vào postman sẽ tương đương http://127.0.0.1:8000/api/locationCity
// !! Lưu ý dùng lệnh php artisan route:list để check các phương thức GET,POST...
// !! Lưu ý khi tạo dùng lệnh php artisan make:controller NameController --resource để render full các phương thức
Route::apiResource('locationCity', LocationCityController::class);
// ** Khúc này để truy xuất các quận trong thành phố đó
Route::get('locationCity/{locationCityId}/locationDistrict', [LocationCityController::class, 'getDistrictByCity']);
// ** Khúc này để lấy dữ liệu thành phố đã phân trang sẵn
Route::get('/locationCityPage', [LocationCityController::class, 'getCitiesPage']);


// ** Khúc này của bảng locationDistrict
Route::apiResource('locationDistrict', LocationDistrictController::class);
// ** Khúc này để lấy dữ liệu thống kê các khách sạn có trong thành phố đó
Route::get('/locationDistrict/{locationDistrictId}/hotelCount', [LocationDistrictController::class, 'countHotels']);
// ** Khúc này để xuất file excel về dự liệu các khách sạn có trong thành phố đó
Route::get('/locationDistrict/{locationDistrictId}/exportDistrictHotels', [LocationDistrictController::class, 'exportDistrictHotels']);

// ** Khúc này của bảng hotel
Route::apiResource('hotel', HotelController::class);
Route::post('hotel/{hotelId}/add-amenities', [HotelController::class, 'addAmenities']);
Route::post('hotel/{hotelId}/remove-amenities', [HotelController::class, 'removeAmenities']);

// ** Khúc này của bảng image hotel
Route::apiResource('hotelImg', HotelImageController::class);
Route::get('hotel/{hotelId}/hotelImg', [HotelImageController::class, 'getHotelImages']);

// ** Khúc này của bảng Room

Route::apiResource('rooms', RoomController::class);
Route::get('/hotel/{hotelId}/rooms', [RoomController::class, 'getRoomsByHotel']);
Route::post('/hotel/{hotelId}/rooms', [RoomController::class, 'createRoom']);

// ** Khúc này của bảng amenities
Route::apiResource('amenities', AmenityController::class);

// ** Khúc này của bảng Room Img
Route::apiResource('roomImg', RoomImageController::class);
Route::get('/room/{roomId}/images', [RoomController::class, 'getRoomImages']);

// ** Khúc này của bảng booking
Route::apiResource('booking', BookingController::class);

// Route để lấy tất cả booking của một khách sạn
Route::get('/hotel/{hotelId}/bookings', [BookingController::class, 'getBookingsByHotel']);


// Route để lấy tất cả booking của một khách hàng
Route::get('/customer/{customerId}/bookings', [BookingController::class, 'getBookingsByCustomer']);

// Route để gửi lại email xác nhận (nếu cần)
Route::post('/booking/{bookingId}/resend-email', [BookingController::class, 'resendConfirmationEmail']);

// ** Tính tổng doanh thu tháng
Route::get('/month-revenue', [RevenueController::class, 'getTotalRevenue']);

// ** Xuất file tổng doanh thu tháng
Route::get('/export-monthly-revenue', [RevenueController::class, 'exportMonthlyRevenue']);


// ** Khúc này của bảng Comment
Route::apiResource('comment', CommentController::class);
Route::get('/comment/hotel/{hotelId}', [CommentController::class, 'getCommentsByHotel']);



Route::middleware('auth:sanctum')->group(function () {
    // Các route cần xác thực
    Route::post('change-password', [UserController::class, 'changePassword']);
    // Các route khác...
});



// Định nghĩa route resource cho 'user' với prefix 'users' để tránh xung đột với route 'user/me'
Route::apiResource('users', UserController::class);

// Định nghĩa route để lấy thông tin người dùng hiện tại
Route::middleware('auth:sanctum')->get('/user/me', [UserController::class, 'me']);

// Nếu cần, bạn có thể định nghĩa thêm các route khác trong group 'auth:sanctum'
Route::middleware('auth:sanctum')->group(function () {
    // Các route cần xác thực
    Route::post('change-password', [UserController::class, 'changePassword']);
    // Các route khác...
});

Route::middleware(['auth:sanctum', 'role:Quản lý'])->group(function () {
    Route::get('/manage-rooms', [RoomController::class, 'index']);
});

Route::post('register', [UserController::class, 'register']);
Route::post('login', [UserController::class, 'login']);

// ** php artisan make:controller
// ** php artisan make:model
// ** php artisan make:resource
