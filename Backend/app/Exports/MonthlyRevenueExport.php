<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class MonthlyRevenueExport implements FromView
{
    protected $revenues;

    public function __construct($revenues)
    {
        $this->revenues = $revenues;
    }

    public function view(): View
    {
        return view('exports.mothly_revenue', [
            'revenues' => $this->revenues,
        ]);
    }
}
