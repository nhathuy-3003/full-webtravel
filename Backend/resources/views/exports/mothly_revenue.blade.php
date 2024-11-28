<table>
    <thead>
        <tr>
            <th>Tháng</th>
            <th>Tổng Doanh Thu</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($revenues as $revenue)
            <tr>
                <td>{{ $revenue->month }}</td>
                <td>{{ number_format($revenue->total_revenue, 2) }} VNĐ</td>
            </tr>
        @endforeach
    </tbody>
</table>
