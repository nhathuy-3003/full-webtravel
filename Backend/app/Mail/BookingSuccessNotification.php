<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class BookingSuccessNotification extends Mailable
{
    public $bookingDetails;

    public function __construct($bookingDetails)
    {
        $this->bookingDetails = $bookingDetails;
    }

    public function build()
    {
        return $this->subject('Booking Confirmation')
                    ->from('no-reply@yourdomain.com', 'Your Hotel')
                    ->html($this->generateHtmlContent()); // Gửi HTML trực tiếp
    }

    private function generateHtmlContent()
    {
        // Tạo nội dung HTML của email
        return "
            <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                    <h1 style='color: #3498db;'>Booking Confirmation</h1>
                    <p>Dear {$this->bookingDetails['CustomerName']},</p>
                    <p>Thank you for your booking! Here are your booking details:</p>
                    <table style='border-collapse: collapse; width: 100%; margin: 20px 0;'>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Hotel Name</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->bookingDetails['HotelName']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Room Name</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->bookingDetails['RoomName']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Check-in Date</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->bookingDetails['DateIn']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd;'><strong>Check-out Date</strong></td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{$this->bookingDetails['DateOut']}</td>
                        </tr>
                    </table>
                    <p>If you have any questions, feel free to contact us at support@yourdomain.com.</p>
                    <p>Best regards,</p>
                    <p><strong>Your Hotel Team</strong></p>
                </body>
            </html>
        ";
    }
}
