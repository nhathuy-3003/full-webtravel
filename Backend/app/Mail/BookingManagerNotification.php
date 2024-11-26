<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class BookingManagerNotification extends Mailable
{
    public $managerEmailDetails;

    public function __construct($managerEmailDetails)
    {
        $this->managerEmailDetails = $managerEmailDetails;
    }

    public function build()
    {
        return $this->subject('Thông Báo Booking Mới')
                    ->from('no-reply@yourdomain.com', 'Your Hotel')
                    ->html($this->generateHtmlContent());
    }

    private function generateHtmlContent()
    {
        return "
            <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                    <h1 style='color: #e74c3c;'>Thông Báo Booking Mới</h1>
                    <p>Dưới đây là thông tin chi tiết về booking mới:</p>
                    <table style='border-collapse: collapse; width: 100%; margin: 20px 0;'>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Tên khách hàng</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->managerEmailDetails['CustomerName']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Email khách hàng</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->managerEmailDetails['CustomerEmail']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Số điện thoại khách hàng</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->managerEmailDetails['CustomerPhone']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Khách sạn</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->managerEmailDetails['HotelName']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Phòng</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->managerEmailDetails['RoomName']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Ngày nhận phòng</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->managerEmailDetails['DateIn']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Ngày trả phòng</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->managerEmailDetails['DateOut']}</td>
                        </tr>
                    </table>
                    <p>Vui lòng kiểm tra và xử lý booking này.</p>
                    <p>Trân trọng,<br>Your Hotel Team</p>
                </body>
            </html>
        ";
    }
}
