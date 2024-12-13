<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class DayRevenueExport implements FromView
{
    protected $revenues;

    public function __construct($revenues)
    {
        $this->revenues = $revenues;
    }

    public function view(): View
    {
        return view('exports.day_revenue', [
            'revenues' => $this->revenues,
        ]);
    }
}
