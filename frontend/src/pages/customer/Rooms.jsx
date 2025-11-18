import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CustomerHeader from "@components/layout/CustomerHeader";
import "@assets/roomtype/Rooms.css";
import Footer from "@components/layout/Footer";

const RoomCard = ({ roomType }) => {
    const navigate = useNavigate();
    const imageUrl = roomType.images && roomType.images.length > 0
        ? `http://localhost:8080/upload/rooms/${roomType.images[0].image}`
        : "https://via.placeholder.com/400x300?text=No+Image";

    return (
        <div className="t-customer-room-card">
            <div className="t-customer-room-card-image-wrapper">
                <img src={imageUrl} alt={roomType.roomTypeName} className="t-customer-room-card-image" />

            </div>
            <div className="t-customer-room-card-content">
                <div className="t-customer-room-card-price">
                    {new Intl.NumberFormat('vi-VN').format(roomType.price)} ₫<span className="t-customer-room-card-price-night"> / night</span>
                </div>
                <h3 className="t-customer-room-card-name">{roomType.roomTypeName}</h3>
                <div className="t-customer-room-card-details">
                    <span><i className="fa fa-user"></i> Adults: {roomType.adult}</span>
                    <span><i className="fa fa-child"></i> Children: {roomType.children}</span>
                </div>
                <p className="t-customer-room-card-description">
                    {roomType.description.substring(0, 100)}...
                </p>
                <button className="t-customer-room-card-button t-orange-btn"
                    onClick={() => navigate(`/room-detail?id=${roomType.roomTypeId}`)}
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default function RoomsPage() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [sortOrder, setSortOrder] = useState("default");

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/roomtypes/all/details");
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setRoomTypes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomTypes();
    }, []);

    const filteredAndSortedRooms = useMemo(() => {
        let filtered = [...roomTypes];

        if (searchTerm) {
            filtered = filtered.filter(room =>
                room.roomTypeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const minPrice = parseFloat(priceRange.min);
        const maxPrice = parseFloat(priceRange.max);
        if (!isNaN(minPrice)) {
            filtered = filtered.filter(room => room.price >= minPrice);
        }
        if (!isNaN(maxPrice)) {
            filtered = filtered.filter(room => room.price <= maxPrice);
        }

        switch (sortOrder) {
            case "price-asc":
                filtered.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                filtered.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }

        return filtered;
    }, [roomTypes, searchTerm, priceRange, sortOrder]);


    if (loading) {
        return (
            <>
                <CustomerHeader />
                <div className="c-loading-spinner">
                    <i className="bx bx-loader-alt bx-spin"></i> Loading...
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <CustomerHeader />
                <div className="c-loading-spinner">
                    <div className="text-center mt-20 text-red-600">Error: {error}</div>
                </div>
            </>
        );
    }

    return (
        <div className="t-customer-rooms-container">
            <CustomerHeader />
            <div className="t-customer-rooms-hero">
                <h1>Explore our Rooms</h1>
                <p>Find the perfect room for your stay</p>
            </div>

            <div className="t-rooms-main-content">
                <div className="t-customer-rooms-controls">
                    <input
                        type="text"
                        placeholder="Search by room name..."
                        className="t-customer-rooms-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="t-customer-rooms-price-filter">
                        <input
                            type="number"
                            placeholder="Min price"
                            min="0"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max price"
                            min="0"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        />
                    </div>
                    <select
                        className="t-customer-rooms-sort"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="default">Sort by</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>

                <div className="t-customer-rooms-grid">
                    {filteredAndSortedRooms.length > 0 ? (
                        filteredAndSortedRooms.map(roomType => (
                            <RoomCard key={roomType.roomTypeId} roomType={roomType} />
                        ))
                    ) : (
                        <p>No rooms found matching your criteria.</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}