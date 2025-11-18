import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { validateCustomerUpdate } from "@utils/customerUpdateValidator";

function RecepBookingForm() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [customerErrors, setCustomerErrors] = useState({});


  // Format date to yyyy-mm-dd
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Get the next day from a given date
  const getNextDay = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay;
  };

  // Calculate the number of nights between two dates
  const calculateNights = (checkInDate, checkOutDate) => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate check-out date based on check-in date and number of nights
  const calculateCheckOut = (checkInDate, nights) => {
    const start = new Date(checkInDate);
    start.setDate(start.getDate() + parseInt(nights, 10));
    return formatDate(start);
  };

  const today = new Date();
  const tomorrow = getNextDay(today);

  // Date and nights states
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(tomorrow));

  // Customer search states
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // Room finding states
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Guest count states
  const [adult, setAdult] = useState(2);
  const [children, setChildren] = useState(0);

  const [roomInfo, setRoomInfo] = useState({
    name: "None",
    price: 0,
  });
  const [pricingLoading, setPricingLoading] = useState(false);

  // State to store summary from API
  const [summaryData, setSummaryData] = useState({
    room: "0",
    service: "0",
    addtionalFee: "0",
    deposit: "0",
    total: "0",
  });

  // Run when edit customer info(validate)
  useEffect(() => {
    if (!isEditingCustomer) {
      setCustomerErrors({});
      return;
    }
    const errors = validateCustomerUpdate(selectedCustomer || {});
    setCustomerErrors(errors);
  }, [selectedCustomer, isEditingCustomer]);

  // Detect customer passed from RegisterWalkIn page
  useEffect(() => {
    if (location.state && location.state.bookingData) {
      const { bookingData } = location.state;

      setCheckIn(bookingData.checkIn);
      setCheckOut(bookingData.checkOut);
      setSelectedCustomer(bookingData.customer);
      setSelectedRoom(bookingData.room);
      setAdult(bookingData.adult);
      setChildren(bookingData.children);
      setSelectedRoomType(bookingData.selectedRoomType);

      navigate(location.pathname, { replace: true, state: {} });
    }
    else if (location.state && location.state.customer) {
      const navigatedCustomer = location.state.customer;
      setSelectedCustomer(navigatedCustomer);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Fetch room types when component mounts
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/roomtypes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setRoomTypes(data);
      } catch (error) {
        console.error("Failed to fetch room types:", error);
      }
    };
    fetchRoomTypes();
  }, [token]);

  // Search customers with debounce
  useEffect(() => {
    if (customerQuery.trim() === "") {
      setCustomerList([]);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/customers/search?query=${customerQuery}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setCustomerList(data);
      } catch (error) {
        console.error("Failed to search customers:", error);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [customerQuery, token]);

  // Fetch available rooms based on filters
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      const typeId = selectedRoomType ? parseInt(selectedRoomType, 10) : null;

      try {
        const params = new URLSearchParams();
        params.append("checkinDate", checkIn);
        params.append("checkoutDate", checkOut);
        if (typeId) {
          params.append("roomTypeId", typeId);
        }

        const url = `http://localhost:8080/api/rooms/search-available?${params.toString()}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setAvailableRooms(data);
        setSelectedRoom(null);
      } catch (error) {
        console.error("Failed to fetch available rooms:", error);
        setAvailableRooms([]);
      }
    };

    fetchAvailableRooms();
  }, [checkIn, checkOut, selectedRoomType, token]);

  // useEffect call API to calculate price
  useEffect(() => {
    // Chua chon phong, reset summary
    if (!selectedRoom) {
      setSummaryData({ room: "0", service: "0", addtionalFee: "0", deposit: "0", total: "0" });
      setRoomInfo({ name: "None", price: 0 });
      return;
    }

    // Cap nhat thong tin phong
    setRoomInfo({
      name: `Room ${selectedRoom.roomNumber} - ${selectedRoom.roomTypeName}`,
      price: parseFloat(selectedRoom.pricePerNight),
    });

    const fetchPricing = async () => {
      setPricingLoading(true);
      try {
        const basePrice = selectedRoom.pricePerNight;
        const params = new URLSearchParams();
        params.append("basePrice", basePrice);
        params.append("checkin", checkIn);
        params.append("checkout", checkOut);

        const res = await fetch(
          `http://localhost:8080/api/rooms/calculate?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch pricing");
        }

        const data = await res.json();
        setSummaryData(data);

      } catch (error) {
        console.error("Failed to fetch pricing:", error);
        setSummaryData({ room: "0", service: "0", addtionalFee: "0", deposit: "0", total: "0" });
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, [selectedRoom, checkIn, checkOut, token]);

  // Handle booking submission
  const handleSubmit = async () => {
    try {
      if (!selectedCustomer || !selectedRoom || !checkIn || !checkOut) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: "Please select customer, room, and date before continuing.",
        });
        return;
      }

      if (adult + children > selectedRoom.capacity) {
        Swal.fire({
          icon: "error",
          title: "Room Capacity Exceeded",
          text: `Room ${selectedRoom.roomNumber} (Capacity: ${selectedRoom.capacity}) cannot accommodate ${adult + children} guests. Please adjust.`,
        });
        return;
      }

      if (adult + children === 0) {
        Swal.fire({
          icon: "error",
          title: "Invalid Guest Count",
          text: "There must be at least one adult guest.",
        });
        return;
      }

      if (!selectedCustomer.customerId) {
        Swal.fire({
          icon: "error",
          title: "Customer Data Error",
          text: "Customer ID not found. Please search again.",
        });
        setSelectedCustomer(null);
        return;
      }

      setIsEditingCustomer(false);

      //Confirm
      const total = parseFloat(summaryData.total);
      const deposit = parseFloat(summaryData.deposit);
      const baseTotal = parseFloat(summaryData.room);
      const additionalFee = parseFloat(summaryData.addtionalFee);

      const confirmationResult = await Swal.fire({
        title: "Confirm Booking Details",
        icon: "info",
        html: `
    <div style="text-align: left; padding: 0 1rem; font-size: 0.95rem;">
      <p>Please review the booking details before proceeding:</p>
      <hr style="margin : 0.5rem 0;" />
      <p><strong>Customer :</strong> ${selectedCustomer.fullName || 'N/A'}</p>
      <p><strong>Room :</strong> ${roomInfo.name}</p>
      <p><strong>Check-in :</strong> ${checkIn}</p>
      <p><strong>Check-out :</strong> ${checkOut}</p>
      <p><strong>Nights :</strong> ${nights}</p>
      <p><strong>Guests :</strong> ${adult} Adults, ${children} Children</p>
      <hr style="margin : 0.5rem 0;" />
      <p><strong>Room (Base) :</strong> ${baseTotal.toLocaleString('vi-VN')} VND</p>
      <p> <strong>${additionalFee >= 0 ? "Additional Fees" : "Discounts"} :</strong>
                      <span>
                        ${additionalFee.toLocaleString('vi-VN')} VND
                      </span>
                    </p>
      <h4 style="text-align: right; font-size: 1.1rem; color: #3085d6; margin: 0.5rem 0;">
        <strong>Total: ${total.toLocaleString('vi-VN')} VND</strong>
      </h4>
      <p style="text-align: right; font-size: 0.95rem; margin-top: 5px;">
        <strong>Deposit (30%): ${deposit.toLocaleString('vi-VN')} VND</strong>
      </p>
    </div>
  `,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirm & Proceed",
        cancelButtonText: "Cancel",
      });
      //Cancel
      if (!confirmationResult.isConfirmed) {
        return;
      }

      //Confirmed
      const initiationData = {
        roomId: selectedRoom.roomId,
        checkinDate: `${checkIn}T14:00:00`,
        checkoutDate: `${checkOut}T12:00:00`,
        adult,
        children,
      };

      const response = await axios.post(
        "http://localhost:8080/api/bookings/initiate",
        initiationData,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { customerId: selectedCustomer.customerId },
        }
      );

      const { bookingId } = response.data;

      if (bookingId) {
        const bookingSummary = {
          ...summaryData,
          roomName: roomInfo.name,
          price: roomInfo.price,
        };

        const bookingData = {
          bookingId: bookingId,
          customer: selectedCustomer,
          room: selectedRoom,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: nights,
          adult: adult,
          children: children,
          summary: bookingSummary,
          selectedRoomType: selectedRoomType,
        };


        navigate("/staff/booking/payment", { state: bookingData });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to create booking. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error initiating booking:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again later.";

      Swal.fire({
        icon: "error",
        title: "Error Occurred",
        text: errorMessage,
      });
    }
  };

  // Customer search input handler
  const handleCustomerSearchChange = (e) => {
    setCustomerQuery(e.target.value);
  };

  // Handle selecting a customer from search results
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerQuery("");
    setCustomerList([]);
    setIsSearching(false);
    setIsEditingCustomer(false);
  };

  // Handle editing customer information
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setSelectedCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle check-in date change
  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);

    const newCheckInDate = new Date(newCheckIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= newCheckInDate) {
      setCheckOut(formatDate(getNextDay(newCheckInDate)));
    }
  };

  // Handle check-out date change
  const handleCheckOutChange = (e) => {
    const newCheckOut = e.target.value;
    setCheckOut(newCheckOut);
  };

  // Handle number of nights change
  const handleNightsChange = (e) => {
    let newNights = parseInt(e.target.value, 10);
    if (isNaN(newNights) || newNights <= 0) {
      newNights = 1;
    }
    const newCheckOut = calculateCheckOut(checkIn, newNights);
    setCheckOut(newCheckOut);
  };

  // Handle room selection and adjust guest count if exceeding capacity
  const handleRoomSelect = (room) => {
    if (adult + children > room.capacity) {
      Swal.fire({
        icon: "info",
        title: "Guest Adjustment",
        text: `Room capacity is ${room.capacity}. Guest count has been automatically adjusted.`,
        timer: 2500,
        showConfirmButton: false,
      });

      if (room.capacity < adult) {
        setAdult(room.capacity);
        setChildren(0);
      } else {
        setChildren(room.capacity - adult);
      }
    }
    setSelectedRoom(room);
    console.log("Selected room:", room);
  };

  // Handle adult count change with auto-limit
  const handleAdultChange = (e) => {
    let newAdult = parseInt(e.target.value, 10);
    if (isNaN(newAdult)) newAdult = 1;
    if (newAdult < 1) newAdult = 1;

    if (selectedRoom) {
      const maxAllowed = selectedRoom.capacity - children;
      if (newAdult > maxAllowed) {
        newAdult = Math.max(1, maxAllowed);
      }
    }
    setAdult(newAdult);
  };

  // Handle children count change with auto-limit
  const handleChildrenChange = (e) => {
    let newChildren = parseInt(e.target.value, 10);
    if (isNaN(newChildren)) newChildren = 0;
    if (newChildren < 0) newChildren = 0;

    if (selectedRoom) {
      const maxAllowed = selectedRoom.capacity - adult;
      if (newChildren > maxAllowed) {
        newChildren = Math.max(0, maxAllowed);
      }
    }
    setChildren(newChildren);
  };

  // Handle room type selection
  const handleRoomTypeChange = (e) => {
    setSelectedRoomType(e.target.value);
  };

  // Derived values
  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const minCheckOutDate = useMemo(() => {
    return formatDate(getNextDay(new Date(checkIn)));
  }, [checkIn]);

  // Render UI
  return (
    <div className="quynh-body-background">
      <div className="quynh-container">
        {/* Search Customer */}
        <div className="quynh-search-container">
          <input
            type="text"
            className="quynh-search-customer"
            placeholder="Search Customer by Phone, Email, Name..."
            value={customerQuery}
            onChange={handleCustomerSearchChange}
            onFocus={() => setIsSearching(true)}
            disabled={!!selectedCustomer}
          />
          {isSearching && customerList.length > 0 && !selectedCustomer && (
            <div className="quynh-search-results">
              {customerList.map((customer) => (
                <div
                  key={customer.customerId}
                  className="quynh-search-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCustomerSelect(customer);
                  }}
                >
                  {customer.fullName} - {customer.phone} - {customer.address}
                </div>
              ))}
            </div>
          )}
          {selectedCustomer && (
            <div className="quynh-customer-buttons">
              <button
                type="button"
                className={`quynh-btn-edit ${isEditingCustomer ? "save-mode" : ""}`}

                disabled={isEditingCustomer && Object.keys(customerErrors).length > 0}

                onClick={() => {
                  if (isEditingCustomer) {
                    setIsEditingCustomer(false);
                  } else {
                    setIsEditingCustomer(true);
                  }
                }}
              >
                {isEditingCustomer ? "Save" : "Edit"}
              </button>
              <button
                type="button"
                className="quynh-btn-clear"
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerQuery("");
                  setIsEditingCustomer(false);
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="quynh-title">CREATE NEW BOOKING</h2>

        {/* Customer Info */}
        <div className="quynh-section">
          <h3 className="quynh-subtitle">CUSTOMER INFORMATION</h3>
          <div className="quynh-customer-grid">
            <div className="quynh-form-group">
              <label>Customer:</label>
              <input
                type="text"
                name="fullName"
                value={
                  selectedCustomer
                    ? selectedCustomer.fullName || selectedCustomer.name
                    : ""
                }
                disabled={!isEditingCustomer}
                onChange={handleCustomerInfoChange}
              />
              {customerErrors.name && <small className="error-text">{customerErrors.name}</small>}
            </div>
            <div className="quynh-form-group">
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                value={selectedCustomer ? selectedCustomer.phone : ""}
                disabled={!isEditingCustomer}
                onChange={handleCustomerInfoChange}
              />
              {customerErrors.phone && <small className="error-text">{customerErrors.phone}</small>}
            </div>
            
            <div className="quynh-form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={selectedCustomer ? selectedCustomer.email : ""}
                disabled={!isEditingCustomer}
                onChange={handleCustomerInfoChange}
              />
              {customerErrors.email && <small className="error-text">{customerErrors.email}</small>}
            </div>
            
            <div className="quynh-form-group">
              <label>Citizen Id:</label>
              <input
                type="text"
                name="citizenId"
                value={selectedCustomer ? selectedCustomer.citizenId : ""}
                disabled={!isEditingCustomer}
                onChange={handleCustomerInfoChange}
              />
            {customerErrors.citizenId && <small className="error-text">{customerErrors.citizenId}</small>}
            </div>

            <div className="quynh-form-group">
              <label>Gender:</label>
              <select
                name="gender"
                value={selectedCustomer ? selectedCustomer.gender : ""}
                disabled={!isEditingCustomer}
                onChange={handleCustomerInfoChange}
                style={{
                  backgroundColor: !isEditingCustomer ? "#eee" : "#fff",
                  cursor: !isEditingCustomer ? "not-allowed" : "default",
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="quynh-form-group">
              <label>Address:</label>
              <input
                type="text"
                name="address"
                value={selectedCustomer ? selectedCustomer.address : ""}
                disabled={!isEditingCustomer}
                onChange={handleCustomerInfoChange}
              />
              {customerErrors.address && <small className="error-text">{customerErrors.address}</small>}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="quynh-section">
          <h3 className="quynh-subtitle">BOOKING DETAILS</h3>
          <div className="quynh-booking-grid">
            {/* Check-in */}
            <div className="quynh-form-group">
              <label>Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={handleCheckInChange}
                min={formatDate(today)}
                className="quynh-input-date"
              />
            </div>
            {/* Adult */}
            <div className="quynh-form-group">
              <label>Adult</label>
              <input
                type="number"
                value={adult}
                onChange={handleAdultChange}
                min="1"
                max={
                  selectedRoom
                    ? Math.max(1, selectedRoom.capacity - children)
                    : undefined
                }
                className="quynh-input-number-small"
                disabled={!selectedRoom}
                title={!selectedRoom ? "Vui lòng chọn phòng trước" : ""}
              />
            </div>
            {/* Check-out */}
            <div className="quynh-form-group">
              <label>Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={handleCheckOutChange}
                min={minCheckOutDate}
                className="quynh-input-date"
              />
            </div>
            {/* Children */}
            <div className="quynh-form-group">
              <label>Children</label>
              <input
                type="number"
                value={children}
                onChange={handleChildrenChange}
                min="0"
                max={
                  selectedRoom
                    ? Math.max(0, selectedRoom.capacity - adult)
                    : undefined
                }
                className="quynh-input-number-small"
                disabled={!selectedRoom}
                title={!selectedRoom ? "Vui lòng chọn phòng trước" : ""}
              />
            </div>
          </div>
          <div className="quynh-night-row">
            <label>Number of night:</label>
            <input
              type="number"
              className="quynh-input-number-small"
              value={nights}
              onChange={handleNightsChange}
              min="1"
              style={{ width: "80px", textAlign: "center" }}
            />
          </div>
        </div>

        {/* Find & Choose Room */}
        <div className="quynh-section">
          <h3 className="quynh-subtitle">FIND AND CHOOSE A ROOM</h3>
          <div className="quynh-room-area">
            {/* LEFT */}
            <div className="quynh-room-left">
              <div className="quynh-room-filter">
                <label htmlFor="roomTypes" className="quynh-label-inline">
                  {" "}
                  RoomTypes{" "}
                </label>
                <select
                  id="roomTypes"
                  className="quynh-select-roomtype"
                  value={selectedRoomType}
                  onChange={handleRoomTypeChange}
                >
                  <option value="">--All--</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.roomTypeId} value={rt.roomTypeId}>
                      {rt.roomTypeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="quynh-room-list">
                <h4>List of available rooms</h4>
                {availableRooms.length > 0 ? (
                  availableRooms.map((room) => (
                    <div
                      key={room.roomId}
                      className={`quynh-room-item ${selectedRoom?.roomId === room.roomId ? "selected" : ""
                        }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      Room {room.roomNumber} - {room.roomTypeName} |{" "}
                      <b>Capacity: {room.capacity}</b> | VND{" "}
                      {parseFloat(room.pricePerNight).toLocaleString()}/night
                    </div>
                  ))
                ) : (
                  <p>No available rooms found for the selected criteria.</p>
                )}
              </div>
            </div>
            {/* RIGHT */}
            <div className="quynh-room-right">
              <div className="quynh-summary">
                <h4>Summary</h4>
                {pricingLoading ? (
                  <p>Calculating price...</p>
                ) : (
                  <>
                    <p>
                      <b>Selected Room :</b> {roomInfo.name}
                    </p>
                    <p>
                      <b>Night :</b> {nights} night
                    </p>
                    <p>
                      <b>Time in :</b> {checkIn} - {checkOut}
                    </p>
                    <p>
                      <b>Avg price/night :</b> {(() => {
                        const n = nights || 0;
                        const total = parseFloat(summaryData.total) || 0;
                        const avg = n > 0 ? total / n : roomInfo.price;
                        return avg.toLocaleString('vi-VN');
                      })()}/night
                    </p>
                    <hr style={{ margin: "10px 0" }} />
                    <p>
                      <b>Room (Base) :</b> {parseFloat(summaryData.room).toLocaleString('vi-VN')} VND
                    </p>
                    <p>
                      {summaryData.addtionalFee >= 0 ? "Additional Fees " : "Discounts"}{" :"}
                      <span>
                        {parseFloat(summaryData.addtionalFee).toLocaleString('vi-VN')} VND
                      </span>
                    </p>

                    <p className="quynh-summary-total">
                      <b>Total :</b> {parseFloat(summaryData.total).toLocaleString('vi-VN')} VND
                    </p>
                    <p>
                      <b>Deposit (30%):</b> {parseFloat(summaryData.deposit).toLocaleString('vi-VN')} VND
                    </p>
                  </>
                )}
                <button
                  onClick={handleSubmit}
                  className="quynh-btn quynh-btn-payment"
                  disabled={pricingLoading || !selectedRoom || !selectedCustomer}
                >
                  {pricingLoading ? "Calculating..." : "Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RecepBookingForm;