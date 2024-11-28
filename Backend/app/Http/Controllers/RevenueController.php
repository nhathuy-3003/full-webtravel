<?php

namespace App\Http\Controllers;

use App\Exports\MonthlyRevenueExport;
use App\Models\BookingModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class RevenueController extends Controller
{
    //
    public function getTotalRevenue(Request $request)
    {
        $revenues = BookingModel::select(
            DB::raw("DATE_FORMAT(OrderDate, '%Y-%m') as month"),
            DB::raw("SUM(BookingTotalAmount) as total_revenue")
        )
            ->where('BookingStatus', 'Confirmed')
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        return response()->json([
            'message' => 'Tính tổng doanh thu thành công',
            'data' => $revenues
        ]);
    }

    public function exportMonthlyRevenue()
    {
        $revenues = BookingModel::select(
            DB::raw("DATE_FORMAT(OrderDate, '%Y-%m') as month"),
            DB::raw("SUM(BookingTotalAmount) as total_revenue")
        )
            ->where('BookingStatus', 'Confirmed')
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        return Excel::download(new MonthlyRevenueExport($revenues), 'monthly_revenue.xlsx');
    }
}
