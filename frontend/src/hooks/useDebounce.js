import { useState, useEffect } from 'react';

/**
 * Hook để trì hoãn một giá trị (thường dùng cho thanh tìm kiếm)
 * @param {any} value Giá trị cần trì hoãn
 * @param {number} delay Thời gian trì hoãn (ms)
 * @returns {any} Giá trị đã trì hoãn
 */
export default function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Đặt timeout để cập nhật giá trị sau khi hết thời gian delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Hủy timeout nếu value thay đổi (người dùng tiếp tục gõ)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Chỉ chạy lại effect nếu value hoặc delay thay đổi

    return debouncedValue;
}