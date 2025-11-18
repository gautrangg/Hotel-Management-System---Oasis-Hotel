import React from 'react';

export default function RoomFilterBar({ filters, onFilterChange, roomTypes }) {
    const statusOptions = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];
    
    const priceRanges = [
        { label: 'All Prices', value: 'all' },
        { label: 'Under 2,000,000', value: '0-2000000' },
        { label: '2,000,000 - 5,000,000', value: '2000000-5000000' },
        { label: '5,000,000 - 10,000,000', value: '5000000-10000000' },
        { label: 'Over 10,000,000', value: '10000000-' }
    ];

    const floorRanges = [
        { label: 'All Floors', value: 'all' },
        { label: 'Floor 1-3', value: '1-3' },
        { label: 'Floor 4-6', value: '4-6' },
        { label: 'Floor 7-10', value: '7-10' },
        { label: 'Over Floor 10', value: '11-' }
    ];

    return (
        <div className="filter-bar">
            {/* Filter theo loại phòng */}
            <select name="type" value={filters.type} onChange={(e) => onFilterChange('type', e.target.value)}>
                <option value="all">All Types</option>
                {roomTypes.map(rt => <option key={rt.roomTypeId} value={rt.roomTypeName}>{rt.roomTypeName}</option>)}
            </select>

            {/* Filter theo khoảng giá */}
            <select name="price" value={filters.price} onChange={(e) => onFilterChange('price', e.target.value)}>
                {priceRanges.map(range => <option key={range.value} value={range.value}>{range.label}</option>)}
            </select>

            {/* Filter theo khoảng tầng */}
            <select name="floor" value={filters.floor} onChange={(e) => onFilterChange('floor', e.target.value)}>
                {floorRanges.map(range => <option key={range.value} value={range.value}>{range.label}</option>)}
            </select>

            {/* Filter theo trạng thái */}
            <select name="status" value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)}>
                <option value="all">All Statuses</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
    );
}