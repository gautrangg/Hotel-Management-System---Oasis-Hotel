import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import CustomerHeader from "@components/layout/CustomerHeader";
import FeedbackSection from "@components/feature/customer/FeedbackSection";

export default function GuestHome() {

  const roomsRef = useRef(null);
  const [topRooms, setTopRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRooms = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/roomtypes/top5");
        setTopRooms(response.data);
      } catch (err) {
        setError("Could not fetch rooms. Please try again later.");
        console.error("Error fetching top rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRooms();
  }, []);

  const scrollLeft = () => {
    roomsRef.current.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    roomsRef.current.scrollBy({ left: 400, behavior: "smooth" });
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="guest-home-container">
      <CustomerHeader />
      <div className="main-content">
        <div className="content-1">
          <div className="left-content">
            <div className="title">
              <h1>The Oasis's  <br/>Hotel in <br></br> Ha Noi</h1>
            </div>
          </div>
          <div className="right-content">
            <img src="/st-hero-1.jpg" className="image" />
          </div>
        </div>

        <div className="content-2">
          <div className="left-content">
            <div className="title-description">
              <span>About the Oasis's Hotel</span>
            </div>

            <h1>Our History and Commitment</h1>

            <div className="description">
              <p>At The Oasis's Hotel, our story is a journey of dedication towards exceptional hospitality and commitment to our guests. Located in the heart of Hoan Kiem in the exciting city of Ha Noi, our hotel is more than a place to stay; It's an experience.</p>
            </div>
          </div>
          <div className="right-content">
            <img src="/st-hero-2.jpg" className="image" />
            <img src="/about-2-1-qqkbusc8v5h7c83exoyxfgd6tm3h44cn2x6ivmxtw8.jpg" className="smaller-image" />
          </div>
        </div>

        <div className="content-3">
          <div className="rooms-description">
            <p className="title-description">DISCOVER OUR ROOMS</p>
            <h1 className="big-title-description">Your luxury retreat in Ha Noi</h1>
            <p className="blur-description">Each of our rooms is designed to provide you with maximum comfort and style during your stay at the Embassy Suites by Oasis Hotel</p>
          </div>


          <div className="rooms" ref={roomsRef}>
            {loading && <p>Loading rooms...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && topRooms.map(room => (
              <div className="room-card" key={room.roomTypeId}>
                <div className="room-card-image">
                  <img
                    src={room.images && room.images.length > 0 ? `http://localhost:8080/upload/rooms/${room.images[0].image}` : "/default-room.jpg"}
                    className="room-image"
                    alt={room.roomTypeName}
                  />
                </div>
                <div className="room-price">
                  <p><strong>{formatCurrency(room.price)}</strong> per night</p>
                </div>
                <div className="room-name">
                  <h2>{room.roomTypeName}</h2>
                </div>
                <div className="room-description">
                  <p>{room.description}</p>
                </div>
                <a href={`/room-detail?id=${room.roomTypeId}`} className="room-book">
                  Book
                </a>
              </div>
            ))}
          </div>


          <div className="room-controls">
            <button className="round-button" onClick={scrollLeft}>
              <i className='bx bx-chevron-left'></i>
            </button>
            <button className="round-button" onClick={scrollRight}>
              <i className='bx bx-chevron-right'></i>
            </button>
          </div>

        </div>

        <div className="content-4">
          <div className="rooms-description">
            <p className="title-description">POWER YOUR JOURNEY</p>
            <h1 className="big-title-description">They also offer a wonderful travel experience</h1>
            <p className="blur-description">Here we present six categories of nearby activities so you can make the most of your stay in Ha Noi:</p>
          </div>

          <div className="travel">

            <div className="travel-card">
              <div className="travel-card-image">
                <img src="/st-hero-4.jpg" alt="" />
              </div>
              <div class="travel-price-tag">700.000đ / Once / Per Guest</div>
              <div className="travel-title">
                <h3>Meeting and Special Events</h3>
                <p>Here we present six categories of nearby activities so you can make the most of your stay in Ha Noi</p>
              </div>
            </div>

            <div className="travel-card">
              <div className="travel-card-image">
                <img src="/bavi.jpg" alt="" />
              </div>
              <div class="travel-price-tag">340.000đ / Once / Per Guest</div>
              <div className="travel-title">
                <h3>Excursion to the National Part</h3>
                <p>Here we present six categories of nearby activities so you can make the most of your stay in Ha Noi</p>
              </div>
            </div>

            <div className="travel-card">
              <div className="travel-card-image">
                <img src="/waterpark.jpg" alt="" />
              </div>
              <div class="travel-price-tag">400.000đ / Once / Per Guest</div>
              <div className="travel-title">
                <h3>Water Fun at West Lake Water Park</h3>
                <p>Here we present six categories of nearby activities so you can make the most of your stay in Ha Noi</p>
              </div>
            </div>

            <div className="travel-card">
              <div className="travel-card-image">
                <img src="/service-4-950x1116.jpg" alt="" />
              </div>
              <div class="travel-price-tag">500.000đ / Once / Per Guest</div>
              <div className="travel-title">
                <h3>World-class Spa, Treatment and Wellness</h3>
                <p>Here we present six categories of nearby activities so you can make the most of your stay in Ha Noi</p>
              </div>
            </div>

          </div>

        </div>
        <FeedbackSection />
        <div className="content-5">

          <div className="restaurant">
            <div className="restaurant-image">
              <img src="/restaurant.png" alt="" />
            </div>

            <div className="restaurant-description" >
              <div>
                <p>OUR RESTAURANT</p>
                <h2>Exceptional culinary experience</h2>
                <p>At The Oasis's Hotel, the culinary experience is a fundamental part of your stay. Our restaurant is a place where flavors merge with comfort and hospitality to give you unforgettable moments.</p>
              </div>
            </div>

          </div>

        </div>



      </div>

      <footer>
        <div>
          <h3>Our Address</h3>
          <p>108 Tran Phu, <br></br>Ha Noi</p>
        </div>

        <div>
          <h3>Reservation</h3>
          <p>Tel.: +45 (0)951 127 855</p>
          <p>Tel.: +45 (0)951 127 855</p>
          <p>Tel.: +45 (0)951 127 855</p>
        </div>

      </footer>



    </div>
  );
};
