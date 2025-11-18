import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "@assets/roomtype/SearchRoomPage.css";
import CustomerHeader from "@components/layout/CustomerHeader.jsx";
import Footer from "@components/layout/Footer";

const priceFilterOptions = [
    { label: "Under 1,000,000", value: "under-1m", min: 0, max: 1000000 },
    { label: "1,000,000 - 2,000,000", value: "1m-2m", min: 1000000, max: 2000000 },
    { label: "2,000,000 - 5,000,000", value: "2m-5m", min: 2000000, max: 5000000 },
    { label: "5,000,000 - 7,000,000", value: "5m-7m", min: 5000000, max: 7000000 },
     { label: "Over 7,000,000", value: "over-7m", min: 7000000, max: null },
];

const FilterSidebar = ({ selectedPriceRanges, onFilterChange }) => {

    // Handler for checkboxes
    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        onFilterChange(value, checked); // Pass both value and checked status
    };

    return (
        <aside className="c-filter-sidebar">
            <h4>Filter by Price</h4>
            {priceFilterOptions.map(option => (
                <div key={option.value} className="c-filter-option">
                    <input
                        type="checkbox"
                        id={option.value}
                        value={option.value}
                        checked={selectedPriceRanges.includes(option.value)}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor={option.value}>{option.label}</label>
                </div>
            ))}
        </aside>
    );
};


function formatVND(num) {
    if (!num && num !== 0) return "VND 0";
    return "VND " + Number(num).toLocaleString("vi-VN");
}

const RoomTypeCard = ({ roomType, checkin, checkout }) => {
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleNavigateToDetail = () => {
        const params = new URLSearchParams({
            id: roomType.roomTypeId,
            checkin: checkin,
            checkout: checkout,
        });

        if (roomType.availableRooms && roomType.availableRooms.length > 0) {
            const firstAvailableRoomId = roomType.availableRooms[0].roomId;
            params.append('roomId', firstAvailableRoomId);
        }

        navigate(`/room-detail?${params.toString()}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!roomType.roomTypeId) return;
            setIsLoading(true);
            try {
                const imagesRes = await fetch(`http://localhost:8080/api/roomtypes/${roomType.roomTypeId}/images`);
                if (!imagesRes.ok) throw new Error('Failed to fetch images');
                const imagesData = await imagesRes.json();
                setImages(imagesData);

            } catch (error) {
                console.error("Error fetching data for RoomTypeCard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [roomType.roomTypeId]);

    const getImageUrl = (name) => `http://localhost:8080/upload/rooms/${name}`;

    return (
        <div className="c-room-card">
            <div className="c-room-card-left-column">
                <div className="c-room-image-container">
                    {isLoading ? (
                        <div className="image-loading-placeholder">Loading...</div>
                    ) : (
                        <img src={images.length > 0 ? getImageUrl(images[0]) : "/placeholder.jpg"} alt={roomType.roomTypeName} />
                    )}
                </div>
                <div className="c-available-rooms-section">
                    <h4>Available Rooms</h4>
                    <div className="c-room-numbers">
                        {(roomType.availableRooms || []).slice(0, 5).map(room => (
                            <button key={room.roomId} className="c-room-number-tag" type="button" onClick={(e) => e.stopPropagation()}>
                                {room.roomNumber}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="c-room-card-right-column">
                <div className="c-room-details-top">
                    <h3>{roomType.roomTypeName}</h3>
                    <div className="c-room-preview-images">

                        {images.map(imageName => (
                            <div key={imageName} className="preview-img-wrapper">
                                <img src={getImageUrl(imageName)} alt="preview" />
                            </div>
                        ))}
                    </div>
                    <p className="c-room-description">
                        {roomType.description || "Modern designed room, fully equipped with amenities."}
                    </p>

                </div>

                <div className="c-room-capacity">
                    <div className="c-capacity-item">
                        <i className='bx bxs-user'></i> Adults:
                        <span>{roomType.adult || 0}</span>
                    </div>
                    <div className="c-capacity-item">
                        <i className='bx bx-child'></i> Children:
                        <span>{roomType.children || 0}</span>
                    </div>
                </div>

                <div className="details-bottom">
                    <div className="price-capacity-wrapper">

                        <div className="c-room-price">{formatVND(roomType.price)}</div>
                    </div>
                    <button className="c-book-button t-orange-btn" onClick={handleNavigateToDetail}>
                        Book
                    </button>
                </div>
            </div>
        </div>
    );
};

const SearchRoomPage = () => {
    const [searchParams] = useSearchParams();
    const tomorrow = new Date();
    const tomorrow2 = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow2.setDate(tomorrow.getDate() + 1);
    
    const defaultCheckin = searchParams.get('checkIn') || tomorrow.toISOString().split('T')[0];
    const defaultCheckout = searchParams.get('checkOut') || tomorrow2.toISOString().split('T')[0];

    const [checkin, setCheckin] = useState(defaultCheckin);
    const [checkout, setCheckout] = useState(defaultCheckout);

    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!checkin || !checkout) {
            setError('Please select check-in and check-out dates.');
            return;
        }
        if (checkin < defaultCheckin) {
            setError('Please select check-in after today.');
            return;
        }
        if (new Date(checkin) >= new Date(checkout)) {
            setError('Check-out date must be after check-in date.');
            return;
        }

        setError('');
        setLoading(true);

        const API_URL = 'http://localhost:8080/api/rooms/search';
        const params = new URLSearchParams({
            checkin,
            checkout,
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setResults(data || []);
        } catch (err) {
            console.error("Error searching for rooms:", err);
            setError('Could not load room data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    // Logic: Lọc phòng theo giá đã chọn
// - Nếu không chọn filter → hiển thị tất cả
// - Nếu chọn → check giá của phòng có nằm trong range được chọn không
    const filteredResults = results.filter(roomType => {
        if (selectedPriceRanges.length === 0) return true;

        const match = priceFilterOptions.some(option => {
            if (!selectedPriceRanges.includes(option.value)) return false;

            const price = roomType.price || 0;
            const min = option.min ?? 0;
            const max = option.max ?? Infinity;

            return price >= min && price <= max;
        });

        return match;
    });

    useEffect(() => {
        handleSearch();
    }, []);

    const handleFilterChange = (value, isChecked) => {
        setSelectedPriceRanges(prevRanges =>
            isChecked
                ? [...prevRanges, value]
                : prevRanges.filter(range => range !== value)
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedPriceRanges, checkin, checkout]);

    return (
        <div>
            <CustomerHeader />
            <div className="c-search-page-container">

                <div className="c-search-page-wrapper">
                    <header className="c-search-header">
                        <div className="c-search-bar">
                            <div className="c-date-picker">
                                <label>Check-in *</label>
                                <input
                                    className="c-date-input"
                                    type="date"
                                    value={checkin}
                                    min={defaultCheckin}
                                    onChange={e => setCheckin(e.target.value)}
                                    placeholder="Check-in Date"
                                />
                            </div>
                            <div className="c-date-picker">
                                <label>Check-out *</label>
                                <input
                                    className="c-date-input"
                                    type="date"
                                    value={checkout}
                                    min={defaultCheckout}
                                    onChange={e => setCheckout(e.target.value)}
                                    placeholder="Check-out Date"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="c-search-button t-orange-btn"
                            >
                                Search
                            </button>
                        </div>
                    </header>

                    <main className="c-search-main-content">
                        <FilterSidebar
                            selectedPriceRanges={selectedPriceRanges}
                            onFilterChange={handleFilterChange}
                        />

                        <div className="c-search-results-container">
                            {error && <p className="c-error-message">{error}</p>}

                            {!error && (
                                filteredResults.length > 0 ? (
                                    filteredResults.map(roomType => (
                                        <RoomTypeCard
                                            key={roomType.roomTypeId}
                                            roomType={roomType}
                                            checkin={checkin}
                                            checkout={checkout}
                                        />
                                    ))
                                ) : (
                                    <p>No available rooms found for the selected dates and criteria.</p>
                                )
                            )}
                        </div>
                    </main>
                </div>

            </div>
            <Footer />
        </div>

    );
};

export default SearchRoomPage;