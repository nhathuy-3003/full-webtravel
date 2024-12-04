<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\BookingModel;

class PaymentSuccessNotification extends Mailable
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
                <title>Thanh toán thành công</title>
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
                        <h1>Thanh toán thành công</h1>
                    </div>
                    <div class="content">
                        <p>Chào ' . htmlspecialchars($this->booking->customer->CustomerName) . ',</p>
                        <p>Cảm ơn bạn đã thanh toán thành công cho booking ID: <strong>' . htmlspecialchars($this->booking->BookingId) . '</strong>.</p>
                        <p>Thông tin chi tiết:</p>
                        <ul>
                            <li>Khách sạn: ' . htmlspecialchars($this->booking->hotel->HotelName ?? 'N/A') . '</li>
                            <li>Phòng: ' . htmlspecialchars($this->booking->room->RoomName ?? 'N/A') . '</li>
                            <li>Ngày nhận phòng: ' . htmlspecialchars($this->booking->DateIn) . '</li>
                            <li>Ngày trả phòng: ' . htmlspecialchars($this->booking->DateOut) . '</li>
                            <li>Tổng giá trị: ' . number_format($this->booking->BookingTotalAmount, 0, ',', '.') . ' VND</li>
                        </ul>
                        <p>Chúng tôi hy vọng bạn có một kỳ nghỉ tuyệt vời!</p>
                    </div>
                    <div class="footer">
                        <p>Trân trọng,</p>
                        <p>Đội ngũ Hỗ trợ Booking của chúng tôi</p>
                    </div>
                </div>
            </body>
            </html>
        ';

        return $this->subject('Thanh toán thành công')
                    ->html($htmlContent);
    }
}
