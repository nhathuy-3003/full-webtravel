<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\BookingModel;

class PaymentManagerNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(BookingModel $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        $htmlContent = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Thông báo thanh toán thành công</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { padding: 20px; }
                    .header { background-color: #f8f8f8; padding: 10px; text-align: center; }
                    .content { margin-top: 20px; }
                    .footer { margin-top: 20px; font-size: 12px; color: #888888; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thông báo thanh toán thành công</h1>
                    </div>
                    <div class="content">
                        <p>Khách hàng <strong>' . htmlspecialchars($this->booking->customer->CustomerName) . '</strong> đã thanh toán thành công cho booking ID: <strong>' . htmlspecialchars($this->booking->BookingId) . '</strong>.</p>
                        <p>Thông tin chi tiết:</p>
                        <ul>
                            <li>Email khách hàng: ' . htmlspecialchars($this->booking->customer->CustomerEmail) . '</li>
                            <li>Số điện thoại khách hàng: ' . htmlspecialchars($this->booking->customer->CustomerPhone ?? 'N/A') . '</li>
                            <li>Khách sạn: ' . htmlspecialchars($this->booking->hotel->HotelName ?? 'N/A') . '</li>
                            <li>Phòng: ' . htmlspecialchars($this->booking->room->RoomName ?? 'N/A') . '</li>
                            <li>Ngày nhận phòng: ' . htmlspecialchars($this->booking->DateIn) . '</li>
                            <li>Ngày trả phòng: ' . htmlspecialchars($this->booking->DateOut) . '</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Trân trọng,</p>
                        <p>Đội ngũ Hỗ trợ Booking của chúng tôi</p>
                    </div>
                </div>
            </body>
            </html>
        ';

        return $this->subject('Thông báo thanh toán thành công')
                    ->html($htmlContent);
    }
}
