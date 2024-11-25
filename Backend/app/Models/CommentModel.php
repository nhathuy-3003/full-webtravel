<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentModel extends Model
{
    //
    protected $table = 'Comment';
    protected $primaryKey = 'CommentId';
    public $timestamps = false; // Vô hiệu hóa timestamps

    protected $fillable = [
        'CommentId',
        'HotelId',
        'CustomerName',
        'Email',
        'Content',
        'Display',
        'Rating',
    ];

// CommentModel.php
public function hotel()
{
    return $this->belongsTo(HotelModel::class, 'HotelId', 'HotelId');
}

}