import axios from 'axios';

const API_URL = 'http://localhost:8080/api/price-adjustments';

let priceAdjustmentsCache = null;

const fetchPriceAdjustments = async () => {
    if (priceAdjustmentsCache) {
        return priceAdjustmentsCache;
    }
    try {
        const response = await axios.get(API_URL);
        priceAdjustmentsCache = response.data;
        return priceAdjustmentsCache;
    } catch (error) {
        console.error("Lỗi khi fetch dữ liệu điều chỉnh giá:", error);
        return [];
    }
};

const getDailyAdjustedPrice = (date, basePrice, adjustments) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const adjustment = adjustments.find(adj =>
        dateString >= adj.startDate && dateString <= adj.endDate
    );

    if (adjustment) {
        if (adjustment.adjustmentType === 'PERCENTAGE') {
            return basePrice * (1 + parseFloat(adjustment.adjustmentValue) / 100);
        }
        if (adjustment.adjustmentType === 'FIXED_AMOUNT') {
            return basePrice + parseFloat(adjustment.adjustmentValue);
        }
    }

    return basePrice;
};

export const calculateTotalPrice = async ({ basePrice, checkinDate, checkoutDate }) => {
    if (!basePrice || !checkinDate || !checkoutDate || new Date(checkinDate) >= new Date(checkoutDate)) {
        return 0;
    }

    const adjustments = await fetchPriceAdjustments();
    
    let totalPrice = 0;
    
    let currentDate = new Date(checkinDate);
    const end = new Date(checkoutDate);

    while (currentDate < end) {
        const dailyPrice = getDailyAdjustedPrice(currentDate, basePrice, adjustments);
        totalPrice += dailyPrice;
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return totalPrice;
};