<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Id' => $this->CommentId,
            'HotelName' => $this->hotel ? $this->hotel->HotelName : null,
            'HotelId' =>  $this->hotel ? $this->hotel->HotelId : null,
            'CustomerName' => $this->CustomerName,
            'Email' => $this->Email,
            'Content' => $this->Content,
            'Display' => $this->Display,
            'Rating' => $this->Rating,
        ];
    }
}