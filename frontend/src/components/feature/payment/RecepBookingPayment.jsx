import React, { useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import jwtDecode from "jwt-decode";

// Format currency helper
const formatCurrency = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num || 0);
};

function RecepBookingPayment() {
  // State management
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashGiven, setCashGiven] = useState("");
  const [cashValue, setCashValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  // Redirect if no booking data
  if (!bookingData) {
    React.useEffect(() => {
      Swal.fire("Error", "Booking information not found. Redirecting...", "error");
      navigate("/staff/booking");
    }, [navigate]);
    return <div>Redirecting...</div>;
  }

  // Extract booking details
  const {
    bookingId,
    customer,
    room,
    checkIn,
    checkOut,
    nights,
    adult,
    children,
    summary,
  } = bookingData;

  const depositAmount = parseFloat(summary.deposit);

  // Calculate change for cash payment
  const changeGiven = useMemo(() => {
    const cashNum = cashValue;
    if (cashNum >= depositAmount) {
      return cashNum - depositAmount;
    }
    return 0;
  }, [cashValue, depositAmount]);

  // Generate dynamic QR code URL
  const qrCodeUrl = useMemo(() => {
    const bin = "970422";
    const accountNumber = "0868754128";
    const amount = depositAmount;
    const description = customer.fullName + "Payment for book id:" + bookingData.bookingId;

    return `https://img.vietqr.io/image/${bin}-${accountNumber}-print.png?amount=${amount}&addInfo=${description}`;
  }, [depositAmount, bookingId]);

  // Handle input cash value
  const handleCashChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setCashGiven(value === "" ? "" : Number(value).toLocaleString("en-US"));
      setCashValue(value === "" ? 0 : Number(value));
    }
  };

  // Decode token to get staffId
  const decode = jwtDecode(localStorage.getItem("token"));
  const staffId = decode.staffId;

  // Send booking confirmation API request
  const handleApiBookingCreation = async (paymentDetails) => {
    setIsProcessing(true);
    const token = localStorage.getItem("token");

    const apiPayload = {
      bookingId: bookingData.bookingId,
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      paymentMethod: paymentDetails.method,
      staffId: staffId,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/bookings/reception-create",
        apiPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200 || response.status === 201) {
        Swal.close();
        Swal.fire("Success", "Booking confirmed successfully.", "success");
        navigate("/staff/booking");
      }
    } catch (apiError) {
      console.error("Error confirming booking:", apiError);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          apiError.response?.data?.message ||
          "An error occurred while confirming the booking.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment submit
  const handleSubmit = async () => {
    if (isProcessing) return;

    if (paymentMethod === "Cash") {
      const cashNum = cashValue;
      if (cashNum < depositAmount) {
        Swal.fire("Insufficient amount", "Cash provided is not enough.", "warning");
        return;
      }

      Swal.fire({
        title: "Processing...",
        text: "Please wait a moment.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      handleApiBookingCreation({ method: "Cash" });
    }
    else if (paymentMethod === "Bank Transfer") {
      Swal.fire({
        title: "Processing...",
        text: "Confirming bank transfer.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      handleApiBookingCreation({ method: "Bank Transfer" });
    }
  };

  return (
    <div className="quynh-payment-container">
      <h2 className="quynh-payment-title">PAYMENT</h2>

      <div className="quynh-payment-content">
        <div className="quynh-payment-left">
          <p>
            <strong>Customer :</strong> {customer.fullName}
          </p>
          <p>
            <strong>Selected Room :</strong> {summary.roomName || 'N/A'}
          </p>
          <p>
            <strong>Night :</strong> {nights} night
          </p>
          <p>
            <strong>Adults :</strong> {adult} 
            <strong style={{ marginLeft: "10px" }}>Childrens :</strong> {children}
          </p>
          <p>
            <strong>Time in :</strong> {checkIn} to {checkOut}
          </p>
          <p>
            <strong>Price per night :</strong> {(() => {
              const n = nights || 0;
              const total = parseFloat(summary.total) || 0;
              const avg = n > 0 ? total / n : (parseFloat(summary.price) || 0);
              return formatCurrency(avg);
            })()}/night
          </p>
          <hr style={{ margin: "10px 0", borderTop: "1px solid #ccc" }} />
          <p>
            <strong>Room (Base) :</strong> {formatCurrency(summary.room)}
          </p>
          <p>
            <strong>
              {summary.addtionalFee >= 0 ? "Additional Fees : " : "Discounts : "}
            </strong>
            <span>
              {formatCurrency(summary.addtionalFee)}
            </span>
          </p>

          <div className="quynh-payment-total">
            <p>
              <strong>Total :</strong>{" "}
              <span>{formatCurrency(summary.total)}</span>
            </p>
          </div>

          <p>
            <strong>Deposit (30%) :</strong> {formatCurrency(depositAmount)}
          </p>
        </div>

        <div className="quynh-payment-right">
          <div className="quynh-payment-method">
            <p>
              <strong>Payment Method :</strong>
            </p>
            <label>
              <input
                type="radio"
                name="payment"
                value="Cash"
                checked={paymentMethod === "Cash"}
                onChange={() => setPaymentMethod("Cash")}
                disabled={isProcessing}
              />
              Cash
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="Bank Transfer"
                checked={paymentMethod === "Bank Transfer"}
                onChange={() => setPaymentMethod("Bank Transfer")}
                disabled={isProcessing}
              />
              Transfer
            </label>
          </div>

          {paymentMethod === "Cash" && (
            <>
              <div className="quynh-payment-input">
                <label>Cash given</label>
                <input
                  type="text"
                  placeholder="Enter cash amount"
                  value={cashGiven}
                  onChange={handleCashChange}
                  disabled={isProcessing}
                  style={{
                    borderColor:
                      cashValue > 0 && cashValue < depositAmount ? "red" : "",
                  }}
                />
              </div>
              <div className="quynh-payment-input">
                <label>Change given</label>
                <input
                  type="text"
                  placeholder="Change amount"
                  value={formatCurrency(changeGiven)}
                  readOnly
                />
              </div>
            </>
          )}
          {paymentMethod === "Bank Transfer" && (
            <div
              className="quynh-payment-qr"
            >
              <p>Please ask the customer to scan the QR code below.</p>
              <p>
                <strong>Amount: {formatCurrency(depositAmount)}</strong>
              </p>
              <p>
                <strong>Payment for room: {summary.roomName}</strong>
              </p>
              <img
                src={qrCodeUrl}
                alt="VietQR Code"
              />
              <p
                className="qr-note"
              >
                After confirming the payment is received, press "Finish Payment".
              </p>
            </div>
          )}

        </div>
      </div>

      <div className="quynh-payment-buttons">
        <button
          className="quynh-btn-back"
          onClick={() =>
            navigate("/staff/booking", { state: { bookingData: bookingData } })
          }
          disabled={isProcessing}
        >
          ← Back
        </button>
        <button
          className="quynh-btn-finish"
          onClick={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Finish Payment"}
        </button>
      </div>
    </div>
  );
}

export default RecepBookingPayment;

