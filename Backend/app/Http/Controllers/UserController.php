<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\UserModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $users = UserModel::all(); // Lấy toàn bộ dữ liệu
        return response()->json([
            'data' => $users,
        ], 200);
        $user = UserModel::with(['hotel'])
            ->get();
        if ($user->isNotEmpty()) {
            return UserResource::collection($user);
        } else {
            return response()->json(
                [
                    'message' => 'Không có dữ liệu nào người dùng'
                ],
                200
            );
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'UserName' => 'required|string|max:15|unique:user,UserName',
                'FullName' => 'required|string|max:30',
                'Password' => 'required|string|min:6|max:25',
                'Role' => 'required|in:Nhân viên,Quản lý',
                'UserStatus' => 'required|in:0,1',
                'HotelId' => [
        'nullable',
        'exists:hotel,HotelId',
        function ($attribute, $value, $fail) use ($request) {
            if ($request->Role === 'Nhân viên' && empty($value)) {
                $fail('HotelId is required for Nhân viên.');
            }
        },
    ],
            ],
            [
                // Custom error messages
            ]
        );
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Thêm người dùng thất bại',
                'error' => $validator->errors(),
            ], 422);
        }
    
        $userData = $request->all();
    
        if ($userData['Role'] === 'Quản lý') {
            $userData['HotelId'] = null; // Managers oversee all hotels
        }
    
        $userData['Password'] = bcrypt($userData['Password']);
    
        $user = UserModel::create($userData);
    
        return response()->json([
            'message' => 'Đăng ký thành công',
            'data' => new UserResource($user)
        ], 201);
    }
    

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'UserName' => 'required|string|max:15|unique:user,UserName,' . $id . ',UserId',
            'FullName' => 'required|string|max:30',
            'Password' => 'nullable|string|min:6|max:25', // Cho phép cập nhật mật khẩu mới
            'Role' => 'required|in:Nhân viên,Quản lý',
            'UserStatus' => 'required|in:0,1', // Kiểm tra trạng thái (1 hoặc 0)
           'HotelId' => [
        'nullable',
        'exists:hotel,HotelId',
        function ($attribute, $value, $fail) use ($request) {
            if ($request->Role === 'Nhân viên' && empty($value)) {
                $fail('HotelId is required for Nhân viên.');
            }
        },
    ],
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Cập nhật thất bại',
                'errors' => $validator->errors(),
            ], 422);
        }
    
        $user = UserModel::find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }
        if ($request->Role === 'Quản lý') {
            $hotelId = null;
        } else {
            $hotelId = $request->HotelId;
        }
        $user->update([
            'UserName' => $request->UserName,
            'FullName' => $request->FullName,
            'HotelId' => $hotelId,
            'Role' => $request->Role,
            'UserStatus' => $request->UserStatus,
            'Password' => $request->Password ? bcrypt($request->Password) : $user->Password, // Chỉ cập nhật nếu có mật khẩu mới
        ]);
    
        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $user,
        ], 200);
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    
    public function login(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'UserName' => 'required|string|max:255',
                'Password' => 'required|string|min:6|max:25',
            ],
            [
                'UserName.required' => 'Tên đăng nhập không được để trống.',
                'UserName.string' => 'Tên đăng nhập phải là một chuỗi ký tự.',
                'UserName.max' => 'Tên đăng nhập không được dài quá 15 ký tự.',
                'Password.required' => 'Mật khẩu không được để trống.',
                'Password.string' => 'Mật khẩu phải là một chuỗi ký tự.',
                'Password.max' => 'Mật khẩu không được dài quá 25 ký tự.',
                'Password.min' => 'Mật khẩu không được ngắn quá 6 ký tự.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = UserModel::where('UserName', $request->UserName)->first();

        if (!$user || !Hash::check($request->Password, $user->Password)) {
            return response()->json([
                'message' => 'Tên đăng nhập hoặc mật khẩu không đúng.',
            ], 401);
        }

        $token = $user->createToken('authToken')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => new UserResource($user),
            'token' => $token,
        ], 200);
    }
   

    public function changePassword(Request $request)
    {
        $user = Auth::user(); // Lấy người dùng từ token đã xác thực
    
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
        }
    
        $request->validate([
            'currentPassword' => 'required|string|min:6',
            'newPassword' => 'required|string|min:6|confirmed', // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        ]);
    
        // Kiểm tra mật khẩu cũ
        if (!Hash::check($request->currentPassword, $user->Password)) {
            return response()->json(['message' => 'Mật khẩu cũ không đúng.'], 400);
        }
    
        // Cập nhật mật khẩu mới
        $user->Password = Hash::make($request->newPassword);
        $user->save();
    
        return response()->json(['message' => 'Mật khẩu đã được thay đổi thành công.']);
    }
    
    
}