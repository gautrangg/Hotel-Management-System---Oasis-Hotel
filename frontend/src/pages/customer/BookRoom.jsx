import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from "@components/layout/Footer";
import StripePayment from '@components/feature/payment/StripePayment';
import "@assets/booking/RoomBookingDetail.css";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount || 0);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function BookRoom() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bid');
  const navigate = useNavigate();
  const stripeRef = useRef();

  const timerRef = useRef(null);

  const [bookingData, setBookingData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ fullName: '', number: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [originalPrice, setOriginalPrice] = useState(0);
  const [priceDifference, setPriceDifference] = useState(0);

  const numberOfNights = bookingData ?
    Math.max(1, Math.ceil(Math.abs(new Date(bookingData.checkoutDate) - new Date(bookingData.checkinDate)) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleCancel = () => {
    Swal.fire({
      title: 'Cancel booking',
      text: "Are you sure you want to cancel this booking process?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'Go back'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `http://localhost:8080/api/bookings/cancel-pending/${bookingId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          toast.success('The booking process has been canceled.');
          navigate(-1);
        } catch (err) {
          console.error("Cancellation failed. Please try again:", err);
          toast.error('Cancellation failed. Please try again.');
        }
      }
    });
  };

  const forceCancelBooking = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8080/api/bookings/cancel-pending/${bookingId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('The booking process has been canceled due to time out.');
    } catch (err) {
      console.error("Automatically cancel failed:", err);
      toast.error('Automatically Cancel failed.');
    } finally {
      navigate(-1);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    if (bookingData && numberOfNights > 0) {
      const original = bookingData.roomTypeBasePrice * numberOfNights;
      setOriginalPrice(original);
      setPriceDifference(bookingData.totalPrice - original);
    }
  }, [bookingData, numberOfNights]);

  useEffect(() => {
    if (!bookingId) {
      toast.error("Booking ID not found.");
      navigate('/home');
      return;
    }

    const fetchBookingData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please log in to continue.");
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/bookings/confirmation-details/${bookingId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setBookingData(response.data);
      } catch (err) {
        console.error("Failed to load booking details:", err);
        const errorMessage = err.response?.data || "Cannot Load Booking Detail, Session may me terminated or Booking has been paid successfully.";
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => navigate('/home'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, navigate]);

  const handleInputChange = (e) => {
    setCustomerInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBook = async () => {
    const { fullName, email, number } = customerInfo;

    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!/^[a-zA-ZÀ-ỹ\s']+$/.test(fullName)) {
      toast.error('Full name can only contain letters and spaces.');
      return;
    }

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!number) {
      toast.error('Please enter your phone number.');
      return;
    }

    if (!/^0\d{9}$/.test(number)) {
      toast.error('Please enter a valid 10-digit phone number starting with 0.');
      return;
    }

    if (!stripeRef.current) {
      toast.error('Payment system is loading, please wait.');
      return;
    }

    Swal.fire({
      title: 'Processing payment',
      text: 'Please do not close this window...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const paymentResult = await stripeRef.current.triggerSubmit();

    if (paymentResult.success) {
      try {

        const token = localStorage.getItem('token');

        if (!token) {
          Swal.close();
          toast.error('Please log in to continue.');
          navigate('/login');
          return;
        }

        const confirmPayload = {
          bookingId: bookingId,
          customerName: customerInfo.fullName,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.number,
          paymentIntentId: paymentResult.paymentIntent.id,
        };

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        await axios.post('http://localhost:8080/api/bookings/confirm', confirmPayload, config);

        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Booking and payment completed successfully!",
        });
        navigate('/my-bookings');

      } catch (apiError) {
        console.error("Error save:", apiError);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Payment succeeded, but booking confirmation failed. Please contact support.',
        });
      }
    } else {
      console.error("Payment Failed:", paymentResult.error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: paymentResult.error || 'Please try again later.',
      });
    }
  };

  useEffect(() => {
    if (!bookingData?.createAt) return;

    const startTime = new Date(bookingData.createAt).getTime();
    const expirationTime = startTime + 15 * 60 * 1000;

    timerRef.current = setInterval(() => {
      const now = new Date().getTime();
      const remaining = expirationTime - now;

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft({ minutes: 0, seconds: 0 });

        Swal.fire({
          icon: 'error',
          title: 'Time out!',
          text: 'Payment time has expired. Your booking will be canceled.',
          allowOutsideClick: false
        }).then(() => {
          forceCancelBooking();
        });
      } else {
        const minutes = Math.floor((remaining / 1000) / 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        setTimeLeft({ minutes, seconds });
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [bookingData, forceCancelBooking]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="t-bookroom-header">
        <span className="t-bookroom-header-back-icon" onClick={handleCancel}>
          <i className="bx bx-arrow-back"></i> Back
        </span>
        {timeLeft && (
          <div className="t-bookroom-header-timer">
            Time Remaining:
            <span>
              {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
      <div className="t-bookroom__container">
        <main className="t-bookroom__content">

          <div className="t-bookroom__summary-column">
            <div className="t-bookroom__card t-bookroom-card--details">
              <img src={bookingData.roomTypeImageUrl || '/placeholder.jpg'} alt={bookingData.roomTypeName} className="card__image" />
              <div className="card__body">
                <h2 className="card__title">{bookingData.roomTypeName}</h2>

                <div className="card__footer">
                  <div>
                    <span className="booked-info__label">Booked Room:</span>
                    <span className="booked-info__number">{bookingData.roomNumber}</span>
                  </div>
                  <span className="price-info__amount">{formatCurrency(bookingData.roomTypeBasePrice)} VND</span>
                </div>
              </div>
            </div>

            <div className="t-bookroom__card">
              <div className="t-bookroom-card__header">
                <h3 className="t-bookroom-card__header-title">Room Booking Detail</h3>
              </div>
              <div className="t-bookroom-card__body">
                <div className="t-bookroom-info-field">
                  <label className="t-bookroom-info-field__label">Check in</label>
                  <div className="t-bookroom-info-field__value">{formatDate(bookingData.checkinDate)}</div>
                </div>
                <div className="t-bookroom-info-field">
                  <label className="t-bookroom-info-field__label">Check out</label>
                  <div className="t-bookroom-info-field__value">{formatDate(bookingData.checkoutDate)}</div>
                </div>
                <div className="t-bookroom-info-field">
                  <label className="t-bookroom-info-field__label">Number of Adults</label>
                  <div className="t-bookroom-info-field__value">{bookingData.adult}</div>
                </div>
                <div className="t-bookroom-info-field">
                  <label className="t-bookroom-info-field__label">Number of Children</label>
                  <div className="t-bookroom-info-field__value">{bookingData.children}</div>
                </div>
              </div>
            </div>

            <div className="t-bookroom__card">
              <div className="t-bookroom-card__header">
                <h3 className="t-bookroom-card__header-title">Payment Summary</h3>
              </div>
              <div className="t-bookroom-card__body">
                <div className="t-bookroom-calculation">
                  <span className="calculation__label">
                    Original Price ({numberOfNights} nights)
                  </span>
                  <span className="calculation__result">
                    {formatCurrency(originalPrice)} VND
                  </span>
                </div>

                {priceDifference !== 0 && (
                  <div className="t-bookroom-calculation">
                    <span className={`calculation__label ${priceDifference > 0 ? 'fee' : 'discount'}`}>
                      {priceDifference > 0 ? 'Additional Fees' : 'Seasonal Discount'}
                    </span>
                    <span className={`calculation__result ${priceDifference > 0 ? 'fee' : 'discount'}`}>
                      {priceDifference > 0 ? '+' : '-'} {formatCurrency(Math.abs(priceDifference))} VND
                    </span>
                  </div>
                )}

                <hr className="t-bookroom-divider" />

                <div className="t-bookroom-calculation t-bookroom-calculation--final">
                  <span className="calculation__label">Final Total</span>
                  <span className="calculation__result">
                    {formatCurrency(bookingData.totalPrice)} VND
                  </span>
                </div>

                <hr className="t-bookroom-divider" />

                <div className="t-bookroom-total">
                  <span className="total__label">Deposit to pay (30%)</span>
                  <span className="total__amount">
                    {formatCurrency(bookingData.deposit)} VND
                  </span>
                </div>
              </div>
            </div>
          </div>


          <div className="t-bookroom__form-column">
            <div className="t-bookroom__card t-bookroom-card--customer">
              <div className="t-bookroom-card__header">
                <h2 className="t-bookroom-card__header-title">COMPLETE YOUR BOOKING</h2>
              </div>
              <div className="t-bookroom-card__body">
                <form className="t-bookroom-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="t-bookroom-form__row">
                    <div className="t-bookroom-form__group">
                      <label htmlFor="fullName" className="t-bookroom-form__label">Full Name</label>
                      <input type="text" id="fullName" placeholder='Full Name' name="fullName" className="t-bookroom-form__input" value={customerInfo.fullName} onChange={handleInputChange} />
                    </div>
                    <div className="t-bookroom-form__group">
                      <label htmlFor="number" className="t-bookroom-form__label">Phone Number</label>
                      <input type="tel" id="number" placeholder='Phone Number' name="number" className="t-bookroom-form__input" value={customerInfo.number} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="t-bookroom-form__group t-bookroom-form__group--full-width">
                    <label htmlFor="email" className="t-bookroom-form__label">Email</label>
                    <input type="email" id="email" placeholder='Contact Email' name="email" className="t-bookroom-form__input" value={customerInfo.email} onChange={handleInputChange} />
                  </div>
                </form>
              </div>
            </div>

            <StripePayment
              ref={stripeRef}
              amount={bookingData.totalPrice * 0.3}
              onPaymentSuccess={(paymentIntent) => {
                console.log('Payment Successfully!', paymentIntent);
              }}
              onPaymentError={(error) => {
                console.error('Payment Failed:', error);
              }}
            />


            <div className="t-bookroom__actions">
              <button className="btn btn--secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn btn--primary" onClick={handleBook}>Book</button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}