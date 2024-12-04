<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\BookingModel;
use App\Models\CustomerModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log; // Thêm dòng này
class BookingController extends Controller
{
    public function index()
    {
        // Include room, customer, and hotel relationships
        $bookings = BookingModel::with(['customer', 'hotel', 'room'])->get();
    
        return response()->json([
            'message' => 'Danh sách booking:',
            'data' => $bookings,
        ], 200);
    }
    

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'CustomerName' => 'required|string|max:255',
            'CustomerPhone' => 'required|string|max:20',
            'CustomerEmail' => 'required|string|email|max:255', 
            'HotelId' => 'required|exists:hotel,HotelId',
            'RoomId' => 'required|exists:room,RoomId', // RoomId là bắt buộc
            'OrderDate' => 'required|date',
            'DateIn' => 'required|date|after_or_equal:OrderDate',
            'DateOut' => 'required|date|after:DateIn',
            'BookingPaymentMethod' => 'required|string|in:vnpay',
            'BookingTotalAmount' => 'required|numeric|min:0',
        ], [
            'HotelId.exists' => 'Khách sạn không hợp lệ.',
            'RoomId.exists' => 'Phòng không hợp lệ.',
            'OrderDate.required' => 'Ngày đặt phòng là bắt buộc.',
            'DateIn.after_or_equal' => 'Ngày nhận phòng phải sau hoặc bằng ngày đặt.',
            'DateOut.after' => 'Ngày trả phòng phải sau ngày nhận phòng.',
            'BookingTotalAmount.numeric' => 'Tổng giá trị phải là số hợp lệ.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Thêm booking thất bại.',
                'errors' => $validator->messages(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Tìm kiếm khách hàng dựa trên số điện thoại và email
        $customer = CustomerModel::where('CustomerPhone', $request->CustomerPhone)
        ->where('CustomerEmail', $request->CustomerEmail)
        ->first();

// Nếu không tìm thấy, tạo mới khách hàng
if (!$customer) {
$customer = CustomerModel::create([
    'CustomerName' => $request->CustomerName,
    'CustomerPhone' => $request->CustomerPhone,
    'CustomerEmail' => $request->CustomerEmail,
    'CustomerAddress' => $request->CustomerAddress ?? '',
]);
}

            // Lưu thông tin booking
            $booking = BookingModel::create([
                'CustomerId' => $customer->CustomerId,
                'HotelId' => $request->HotelId,
                'RoomId' => $request->RoomId,
                'OrderDate' => $request->OrderDate,
                'DateIn' => $request->DateIn,
                'DateOut' => $request->DateOut,
                'BookingPaymentMethod' => $request->BookingPaymentMethod,
                'BookingTotalAmount' => $request->BookingTotalAmount,
                'BookingStatus' => 'Pending', // Trạng thái mặc định
            ]);

            // Lấy thông tin khách sạn và phòng
            $hotel = $booking->hotel;
            $room = $booking->room;

            // Gửi email xác nhận cho khách hàng
            $customerEmailDetails = [
                'CustomerName' => $customer->CustomerName,
                'HotelName' => $hotel->HotelName ?? 'N/A',
                'RoomName' => $room->RoomName ?? 'N/A',
                'DateIn' => $booking->DateIn,
                'DateOut' => $booking->DateOut,
            ];

            Log::info('Gửi email xác nhận cho khách hàng: ' . $customer->CustomerEmail);
            \Mail::to($customer->CustomerEmail)->send(new \App\Mail\BookingSuccessNotification($customerEmailDetails));
            Log::info('Email xác nhận cho khách hàng đã được gửi.');

            // Gửi email thông báo đến quản lý
            $managerEmail = 'huyladay123@gmail.com'; // Email quản lý
            $managerEmailDetails = [
                'CustomerName' => $customer->CustomerName,
                'CustomerEmail' => $customer->CustomerEmail,
                'CustomerPhone' => $customer->CustomerPhone ?? 'N/A',
                'HotelName' => $hotel->HotelName ?? 'N/A',
                'RoomName' => $room->RoomName ?? 'N/A',
                'DateIn' => $booking->DateIn,
                'DateOut' => $booking->DateOut,
            ];

            Log::info('Gửi email thông báo đến quản lý: ' . $managerEmail);
            \Mail::to($managerEmail)->send(new \App\Mail\BookingManagerNotification($managerEmailDetails));
            Log::info('Email thông báo đến quản lý đã được gửi.');

            // Kiểm tra nếu phương thức thanh toán là VNPay, xử lý thanh toán VNPay
if ($request->BookingPaymentMethod === 'vnpay') {
    $vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    $vnp_Returnurl = "https://full-webtravel.vercel.app/payment-result";
    $vnp_TmnCode = "RVACBM44";// Mã website tại VNPAY 
    $vnp_HashSecret = "3AXTXTK1L84YUMD9SMH3HAUO5MMEQOD6"; // Chuỗi bí mật

    $vnp_TxnRef = $booking->BookingId; // Mã đơn hàng
    $vnp_OrderInfo = "Thanh toán booking ID " . $booking->BookingId;
    $vnp_Amount = $booking->BookingTotalAmount * 100; // Đảm bảo số tiền chuyển sang VND
    $vnp_Locale = 'vn'; // Ngôn ngữ là tiếng Việt
    $vnp_IpAddr = $_SERVER['REMOTE_ADDR'];
    $vnp_ExpireDate = date('YmdHis', strtotime("+1 hour"));

    $inputData = [
        "vnp_Version" => "2.1.0",
        "vnp_TmnCode" => $vnp_TmnCode,
        "vnp_Amount" => $vnp_Amount,
        "vnp_Command" => "pay",
        "vnp_CreateDate" => date('YmdHis'),
        "vnp_CurrCode" => "VND",
        "vnp_IpAddr" => $vnp_IpAddr,
        "vnp_Locale" => $vnp_Locale,
        "vnp_OrderInfo" => $vnp_OrderInfo,
        "vnp_TxnRef" => $vnp_TxnRef,
        "vnp_ExpireDate" => $vnp_ExpireDate,
        "vnp_ReturnUrl" => $vnp_Returnurl,
    ];

    ksort($inputData);
    $query = "";
    $hashdata = "";
    $i = 0;

    foreach ($inputData as $key => $value) {
        if ($i == 1) {
            $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
        } else {
            $hashdata .= urlencode($key) . "=" . urlencode($value);
            $i = 1;
        }
        $query .= urlencode($key) . "=" . urlencode($value) . '&';
    }

    $vnp_Url = $vnp_Url . "?" . $query;
    if (isset($vnp_HashSecret)) {
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret); 
        $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
    }

    // Trả về URL VNPay dưới dạng JSON
    DB::commit();

    return response()->json([
        'message' => 'Đặt phòng thành công. Chuyển hướng đến VNPay để thanh toán.',
        'payment_url' => $vnp_Url,
        'data' => $booking,
    ], 201);
}

DB::commit();

return response()->json([
    'message' => 'Thêm booking và customer thành công. Email đã được gửi.',
    'data' => $booking,
], 201);
} catch (\Exception $e) {
DB::rollBack();
Log::error('Có lỗi xảy ra khi thêm booking: ' . $e->getMessage());

return response()->json([
    'message' => 'Có lỗi xảy ra khi thêm booking.',
    'error' => $e->getMessage(),
], 500);
}
Cache::forget('booking');
}

    public function show(BookingModel $booking)
    {
        $booking->load('customer', 'hotel', 'room');
        return response()->json([
            'message' => 'Thông tin chi tiết booking:',
            'data' => $booking,
        ], 200);
    }
    
    public function update(Request $request, BookingModel $booking)
    {
        $validator = Validator::make($request->all(), [
            'CustomerName' => 'sometimes|string|max:255',
            'CustomerPhone' => 'sometimes|string|max:20',
            'CustomerEmail' => 'sometimes|string|email|max:255',
            'HotelId' => 'sometimes|exists:hotel,HotelId',
            'RoomId' => 'sometimes|exists:room,RoomId', // RoomId là bắt buộc
            'OrderDate' => 'sometimes|date',
            'DateIn' => 'sometimes|date|after_or_equal:OrderDate',
            'DateOut' => 'sometimes|date|after:DateIn',
            'BookingPaymentMethod' => 'required|string|in:vnpay',
            'BookingTotalAmount' => 'sometimes|numeric|min:0',
            'BookingStatus' => 'sometimes|string|in:Pending,Confirmed,Cancelled',
        ], [
            'HotelId.exists' => 'Khách sạn không hợp lệ.',
            'RoomId.exists' => 'Phòng không hợp lệ.',
            'OrderDate.required' => 'Ngày đặt phòng là bắt buộc.',
            'DateIn.after_or_equal' => 'Ngày nhận phòng phải sau hoặc bằng ngày đặt.',
            'DateOut.after' => 'Ngày trả phòng phải sau ngày nhận phòng.',
            'BookingTotalAmount.numeric' => 'Tổng giá trị phải là số hợp lệ.',
            'BookingStatus.required' => 'Trạng thái không được để trống.',
            'BookingStatus.in' => 'Trạng thái không hợp lệ.',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Cập nhật trạng thái thất bại.',
                'errors' => $validator->messages(),
            ], 422);
        }
    
        $booking->update($request->only(['BookingStatus']));
    
        return response()->json([
            'message' => 'Cập nhật trạng thái thành công.',
            'data' => $booking,
        ], 200);
    }
    
    public function destroy(BookingModel $booking)
    {
        if (!$booking) {
            return response()->json(['message' => 'Booking không tồn tại.'], 404);
        }
    
        try {
            DB::beginTransaction();
    
            // Check if the customer has other bookings
            $customer = $booking->customer;
            $booking->delete();
    
            if ($customer && $customer->bookings()->count() === 0) {
                // Delete the customer if no other bookings exist
                $customer->delete();
            }
    
            DB::commit();
            return response()->json(['message' => 'Xóa booking và khách hàng thành công.'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa booking.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getBookingsByUser($userId)
{
    $bookings = Booking::where('UserId', $userId)->get();

    if ($bookings->isEmpty()) {
        return response()->json([
            'message' => 'Không tìm thấy booking cho người dùng này.',
        ], 404);
    }

    return response()->json([
        'data' => $bookings,
    ], 200);
}

public function getBookingsByHotel($hotelId)
{
    $bookings = BookingModel::where('HotelId', $hotelId)
        ->with(['customer', 'hotel', 'room'])
        ->get();

    if ($bookings->isEmpty()) {
        return response()->json(['message' => 'Không tìm thấy booking cho khách sạn này.'], 404);
    }

    return response()->json(['data' => $bookings], 200);
}

public function getBookingsByCustomer($customerId)
{
    $bookings = BookingModel::where('CustomerId', $customerId)->with(['hotel', 'room'])->get();

    if ($bookings->isEmpty()) {
        return response()->json(['message' => 'Không tìm thấy booking cho khách hàng này.'], 404);
    }

    return response()->json(['data' => $bookings], 200);
}
public function resendConfirmationEmail($bookingId)
{
    $booking = BookingModel::with(['customer', 'hotel', 'room'])->find($bookingId);

    if (!$booking) {
        Log::warning("Booking ID {$bookingId} không tồn tại.");
        return response()->json(['message' => 'Booking không tồn tại.'], 404);
    }

    $customer = $booking->customer;
    $hotel = $booking->hotel;
    $room = $booking->room;

    // Kiểm tra xem thuộc tính CustomerEmail có tồn tại và không trống
    if (empty($customer->CustomerEmail)) {
        Log::warning("Customer ID {$customer->CustomerId} không có email.");
        return response()->json(['message' => 'Customer không có email để gửi.'], 400);
    }

    try {
        // Gửi email xác nhận cho khách hàng
        Log::info("Bắt đầu gửi email xác nhận cho khách hàng: {$customer->CustomerEmail}");
        \Mail::to($customer->CustomerEmail)->send(new \App\Mail\BookingSuccessNotification([
            'CustomerName' => $customer->CustomerName,
            'HotelName' => $hotel->HotelName ?? 'N/A',
            'RoomName' => $room->RoomName ?? 'N/A',
            'DateIn' => $booking->DateIn,
            'DateOut' => $booking->DateOut,
        ]));
        Log::info("Email xác nhận đã được gửi thành công cho: {$customer->CustomerEmail}");

        // Gửi email thông báo đến quản lý
        $managerEmail = 'huyladay123@gmail.com'; // Thay bằng email quản lý thực tế
        Log::info("Bắt đầu gửi email thông báo đến quản lý: {$managerEmail}");
        \Mail::to($managerEmail)->send(new \App\Mail\BookingManagerNotification([
            'CustomerName' => $customer->CustomerName,
            'CustomerEmail' => $customer->CustomerEmail,
            'CustomerPhone' => $customer->CustomerPhone ?? 'N/A',
            'HotelName' => $hotel->HotelName ?? 'N/A',
            'RoomName' => $room->RoomName ?? 'N/A',
            'DateIn' => $booking->DateIn,
            'DateOut' => $booking->DateOut,
        ]));
        Log::info("Email thông báo đến quản lý đã được gửi thành công.");

        return response()->json(['message' => 'Email xác nhận đã được gửi lại.'], 200);
    } catch (\Exception $e) {
        Log::error("Lỗi khi gửi email: " . $e->getMessage());
        return response()->json([
            'message' => 'Có lỗi xảy ra khi gửi email.',
            'error' => $e->getMessage(),
        ], 500);
    }
}
//xử lý API từ VNPay và gửi thông báo qua email.
public function vnpayReturn(Request $request)
{
    $vnp_HashSecret = "3AXTXTK1L84YUMD9SMH3HAUO5MMEQOD6"; // Chuỗi bí mật do VNPay cung cấp
    $vnp_TxnRef = $request->vnp_TxnRef; // Mã đơn hàng
    $vnp_SecureHash = $request->vnp_SecureHash; // Mã hash bảo mật
    $inputData = $request->except('vnp_SecureHash'); // Lấy tất cả tham số từ VNPay ngoại trừ vnp_SecureHash

    // Sắp xếp lại dữ liệu để tạo lại chuỗi cần thiết
    ksort($inputData);
    $hashData = '';
    foreach ($inputData as $key => $value) {
        if ($key != 'vnp_SecureHash' && $value != '') {
            $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
        }
    }
    $hashData = substr($hashData, 1); // Cắt dấu & đầu tiên

    // Tính lại mã hash từ dữ liệu nhận được và so sánh với mã hash từ VNPay
    $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
    
    // Kiểm tra chữ ký bảo mật
    if ($secureHash != $vnp_SecureHash) {
        Log::error('VNPay payment: Invalid secure hash');
        return response()->json(['message' => 'Chữ ký không hợp lệ'], 400);
    }

    // Kiểm tra mã phản hồi từ VNPay
    if ($request->vnp_ResponseCode == '00') {
        // Thanh toán thành công
        $booking = BookingModel::where('BookingId', $vnp_TxnRef)->first();
        if ($booking) {
            // Cập nhật trạng thái booking thành "Đã thanh toán"
            $booking->BookingStatus = 'Confirmed';
            $booking->save();

            // Gửi email thông báo thanh toán thành công cho khách hàng và quản lý
            $this->sendPaymentSuccessEmail($booking);

            Log::info("Thanh toán thành công cho booking ID: {$vnp_TxnRef}");
            return redirect()->route('booking.success');
        }
    } else {
        // Thanh toán thất bại
        Log::error("Thanh toán thất bại cho booking ID: {$vnp_TxnRef}");
        return redirect()->route('booking.failed');
    }
}

private function sendPaymentSuccessEmail($booking)
{
    // Gửi email thông báo thanh toán thành công cho khách hàng
    \Mail::to($booking->customer->CustomerEmail)->send(new \App\Mail\PaymentSuccessNotification($booking));

    // Gửi email thông báo thanh toán thành công cho quản lý
    \Mail::to('huyladay123@gmail.com')->send(new \App\Mail\PaymentManagerNotification($booking));
}

}


