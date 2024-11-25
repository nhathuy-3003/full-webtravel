<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;

use App\Models\CommentModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
  // CommentController.php

public function index(Request $request)
{
    $hotelId = $request->query('hotelId');

    if ($hotelId) {
        // Khi có HotelId, chỉ trả về bình luận đã được duyệt
        $comments = CommentModel::where('HotelId', $hotelId)
            ->where('Display', 1)
            ->get();
    } else {
        // Khi không có HotelId, trả về tất cả bình luận (dành cho quản trị viên)
        $comments = CommentModel::all();
    }

    if ($comments->isEmpty()) {
        return response()->json(['message' => 'Không có bình luận nào.'], 404);
    }

    // Trả về dữ liệu bình luận
    return response()->json([
        'data' => CommentResource::collection($comments)
    ], 200);
}

    
    

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validator = Validator::make(
            $request->all(),
            [
                'HotelId' => 'required|exists:Hotel,HotelId',
                'CustomerName' => 'required|string|max:25',
                'Email' => 'required|string|max:255|email',
                'Content' => 'required|string',
                'Display' => 'in:0,1',
                'Rating' => 'required|integer|between:0,5'
            ],
            [
                // Custom thông báo lỗi cho từng trường và quy tắc
                'CustomerName.required' => 'Tên phòng không được để trống.',
                'CustomerName.string' => 'Tên phòng phải là một chuỗi ký tự.',
                'CustomerName.max' => 'Tên phòng không được dài quá 25 ký tự.',

                'Email.required' => 'Email không được để trống.',
                'Email.string' => 'Email phải là một chuỗi ký tự.',
                'Email.max' => 'Email không được dài quá 255 ký tự.',
                'Email.email' => 'Phải là định dạng email.',

                'Content.required' => 'Nội dung bình luận không được để trống.',
                'Content.string' => 'Nội dung bình luận phải là một chuỗi ký tự.',

                'HotelId.required' => 'ID hotel không được để trống.',
                'HotelId.exists' => 'ID hotel không hợp lệ.',

                // 'Display.in' => 'Trạng thái để hiển thị bình luận là 0 (ko hiển thị) hoặc 1 (hiển thị).',

                'Rating.required' => 'Đánh giá không được để trống.',
                'Rating.integer' => 'Đánh giá phải là một số nguyên.',
                'Rating.between' => 'Đánh giá phải nằm trong khoảng từ 0 đến 5.',
            ]
        );
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Thêm dữ liệu thất bại',
                'error' => $validator->messages(),
            ], 422);
        }

        $comment = CommentModel::create(
            [
                'CustomerName' => $request->CustomerName,
                'HotelId' => $request->HotelId,
                'Email' => $request->Email,
                'Content' => $request->Content,
                // 'Display' => $request->Display,
                'Rating' => $request->Rating,
            ]
        );

        return response()->json([
            'message' => 'Thêm bình luận thành công',
            'data' => new CommentResource($comment)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CommentModel $comment)
    {
        //
        return new CommentResource($comment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CommentModel $comment)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'HotelId' => 'sometimes|exists:Hotel,HotelId',
                'CustomerName' => 'sometimes|string|max:25',
                'Email' => 'sometimes|string|max:255|email',
                'Content' => 'sometimes|string',
                'Display' => 'sometimes|in:0,1',
                'Rating' => 'sometimes|integer|between:0,5'
            ],
            [
                // Custom validation messages
            ]
        );
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Cập nhật dữ liệu thất bại',
                'error' => $validator->messages(),
            ], 422);
        }
    
        $comment->update($request->only([
            'CustomerName',
            'HotelId',
            'Email',
            'Content',
            'Display',
            'Rating',
        ]));
    
        return response()->json([
            'message' => 'Cập nhật bình luận thành công',
            'data' => new CommentResource($comment)
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommentModel $comment)
    {
        //
        $comment->delete();
        return response()->json([
            'message' => 'Đã xoá thành công bình luận'
        ], 200);
    }
    public function getCommentsByHotel($hotelId)
{
    // Lấy danh sách bình luận theo HotelId
    $comments = CommentModel::where('HotelId', $hotelId)->where('Display', 1)->get();

    if ($comments->isEmpty()) {
        return response()->json(['message' => 'Không có bình luận nào.'], 404);
    }

    return response()->json(['data' => CommentResource::collection($comments)], 200);
}

}