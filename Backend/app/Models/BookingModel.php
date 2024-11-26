<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingModel extends Model
{
    protected $table = 'booking'; // Tên bảng
    protected $primaryKey = 'BookingId'; // Khóa chính

    protected $fillable = [
        'CustomerId',
        'HotelId',
        'RoomId',
        'OrderDate',
        'DateIn',
        'DateOut',
        'BookingPaymentMethod',
        'BookingTotalAmount',
        'BookingStatus',
    ];

    public $timestamps = true;

    public function hotel()
    {
        return $this->belongsTo(HotelModel::class, 'HotelId', 'HotelId');
    }
    
    public function room()
    {
        return $this->belongsTo(RoomModel::class, 'RoomId', 'RoomId');
    }
    
    public function customer()
    {
        return $this->belongsTo(CustomerModel::class, 'CustomerId', 'CustomerId');
    }
    
}
