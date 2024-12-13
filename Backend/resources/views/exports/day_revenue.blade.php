<table>
    <thead>
        <tr>
            <th>Ngày</th>
            <th>Tổng Doanh Thu</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($revenues as $revenue)
            <tr>
                <td>{{ $revenue->day }}</td>
                <td>{{ number_format($revenue->total_revenue, 0, ',', '.') }} VNĐ</td>
            </tr>
        @endforeach
    </tbody>
</table>
