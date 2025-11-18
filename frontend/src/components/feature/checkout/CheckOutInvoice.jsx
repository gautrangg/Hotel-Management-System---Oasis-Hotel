import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import Pagination from '../../base/ui/Pagination';
import { formatDateTime } from '../../../utils/dateUtils';
import "@assets/booking/CheckOutInvoice.css";

const formatCurrency = (number) => {
  if (number === null || number === undefined) return "0 VND"; // Mặc định là 0 VND

  // Xóa bỏ ký tự không phải số (giữ lại dấu chấm cho số thập phân)
  const cleaned = String(number).replace(/[^0-9.]/g, '');
  
  // Chuyển sang số nguyên
  const value = parseInt(cleaned, 10);
  
  if (isNaN(value)) return "0 VND"; // Trả về 0 VND nếu input không hợp lệ
  
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
};

// Format date to DD/MM/YYYY
const formatDate_DDMMYYYY = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Kiểm tra ngày có hợp lệ không
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Lỗi format ngày:", dateString, error);
    return 'N/A';
  }
};

export default function CheckOutInvoice({ 
  bookingId, 
  bookingData,
  onClose, 
  onCompletePayment,
  invoiceData,
  checkoutCalculation,
  pendingServices = [],
  onAddService,
  onRemoveService,
  actualCheckoutTime,
  onCheckoutTimeChange
}) {
  const [penalty, setPenalty] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [localCheckoutTime, setLocalCheckoutTime] = useState(actualCheckoutTime);
  
  // Cash payment state
  const [cashReceived, setCashReceived] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  useEffect(() => {
    if (actualCheckoutTime) {
      setLocalCheckoutTime(actualCheckoutTime);
    }
  }, [actualCheckoutTime]);

  const calculateTotals = () => {
    if (!checkoutCalculation) return { subtotal: 0, deposit: 0, penalty: 0, finalAmount: 0 };
    
    const roomTotal = parseFloat(checkoutCalculation.roomTotal) || 0;
    const serviceTotal = parseFloat(checkoutCalculation.serviceTotal) || 0;
    const pendingServiceTotal = pendingServices.reduce((sum, service) => sum + (service.total || 0), 0);
    
    const subtotal = roomTotal + serviceTotal;
    
    const depositAmount = parseFloat(checkoutCalculation.deposit) || 0;
    const lateCheckoutFee = parseFloat(checkoutCalculation.lateCheckoutFee) || 0;
    const earlyCheckoutPenalty = parseFloat(checkoutCalculation.earlyCheckoutPenalty) || 0;
    const additionalPenalty = parseFloat(penalty) || 0;
    
    const finalAmount = subtotal + pendingServiceTotal - depositAmount + lateCheckoutFee + earlyCheckoutPenalty + additionalPenalty;
    
    return { 
      subtotal, 
      deposit: depositAmount, 
      lateCheckoutFee,
      earlyCheckoutPenalty,
      penalty: additionalPenalty, 
      finalAmount,
      pendingServiceTotal
    };
  };

  const { subtotal, deposit, lateCheckoutFee, earlyCheckoutPenalty, penalty: penaltyAmount, finalAmount, pendingServiceTotal } = calculateTotals();

  // Bank transfer QR (similar to staff/booking/payment)
  const qrCodeUrl = React.useMemo(() => {
    const bin = "970422";
    const accountNumber = "0868754128";
    const amount = Math.max(0, Math.floor(finalAmount || 0));
    const customerName = invoiceData?.customer?.name || invoiceData?.contactName || "Customer";
    const description = `${customerName} checkout #${String(bookingId || "").replace(/[^a-zA-Z0-9]/g, '')}`;
    return `https://img.vietqr.io/image/${bin}-${accountNumber}-print.png?amount=${amount}&addInfo=${encodeURIComponent(description)}`;
  }, [finalAmount, bookingId, invoiceData]);

  // Calculate change when cash received changes
  useEffect(() => {
    if (paymentMethod === 'Cash' && cashReceived && finalAmount) {
      const received = parseFloat(cashReceived) || 0;
      const change = received - finalAmount;
      setChangeAmount(change > 0 ? change : 0);
    } else {
      setChangeAmount(0);
    }
  }, [cashReceived, finalAmount, paymentMethod]);

  const handleCompletePayment = async () => {
    if (finalAmount < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'The payment amount is invalid. Please check again.',
        confirmButtonColor: '#d97706'
      });
      return;
    }

    // Validate payment method specific fields
    if (paymentMethod === 'Cash') {
      const received = parseFloat(cashReceived) || 0;
      if (received < finalAmount) {
        Swal.fire({
          icon: 'warning',
          title: 'Insufficient funds',
          text: `Customers give ${formatCurrency(received)} but need payment ${formatCurrency(finalAmount)}.`,
          confirmButtonColor: '#d97706'
        });
        return;
      }
    }

    const result = await Swal.fire({
      title: 'Payment confirmation',
      text: `Are you sure you want to complete the payment for the customer? ${invoiceData?.customer?.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await onCompletePayment({
          paymentMethod,
          penalty: penaltyAmount,
          finalAmount,
          paymentDetails: paymentMethod === 'Cash' ? {
            cashReceived: parseFloat(cashReceived),
            changeAmount: changeAmount
          } : null
        });
        
        // Only show success popup if payment was actually successful
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Payment has been completed.',
          confirmButtonColor: '#d97706'
        }).then(() => {
          onClose();
        });
        
      } catch (error) {
        console.error('Payment error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'An error occurred while processing the payment.',
          confirmButtonColor: '#d97706'
        });
        // Don't close the modal on error
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddServiceClick = () => {
    onAddService();
  };

  const handleRemoveServiceClick = (serviceId) => {
    Swal.fire({
      title: 'Confirm deletion',
      text: 'Are you sure you want to delete this service?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        onRemoveService(serviceId);
      }
    });
  };

  if (!invoiceData) {
    return (
      <div className="checkout-invoice-modal">
        <div className="checkout-invoice-container">
          <h2 className="checkout-invoice-title">Process Payment & Check-out</h2>
          <p>Loading invoice data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-invoice-modal">
      <div className="checkout-invoice-container">
        <div className="checkout-invoice-header">
          <h2 className="checkout-invoice-title">Process Payment & Check-out</h2>
          {onClose && (
            <button className="checkout-close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {/* Checkout Time & Scenario */}
        {checkoutCalculation && (
          <div className="checkout-section checkout-scenario-section">
            <h3 className="checkout-section-title">Checkout Information</h3>
            <div className="checkout-scenario-box">
                <div 
                  className="checkout-time-group" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    gap: '8px' 
                  }}
                >
                  <label>Actual Checkout Time:</label>
                  
                  <span 
                    className="checkout-time-display"
                    style={{
                      fontWeight: '600',  
                      fontSize: '1.05rem' 
                    }}
                  >
                    {formatDateTime(localCheckoutTime || actualCheckoutTime)}
                  </span>
                </div>
              <div className="checkout-scenario-info">
                <p><strong>Scenario:</strong> {checkoutCalculation.checkoutScenario}</p>
                <p><strong>Description:</strong> {checkoutCalculation.description}</p>
                {checkoutCalculation.hoursLate > 0 && (
                  <p><strong>Hours Late:</strong> {checkoutCalculation.hoursLate} hours</p>
                )}
                {checkoutCalculation.formattedExpectedCheckoutTime && (
                  <p><strong>Expected Checkout:</strong> {checkoutCalculation.formattedExpectedCheckoutTime}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="checkout-section checkout-customer-section">
          <h3 className="checkout-section-title">
            Customer Information & Booking
          </h3>
          <div className="checkout-customer-box">
            <div className="checkout-customer-top">
              <div className="checkout-customer-left">
                <p>
                  <i className="bx bx-user checkout-icon"></i>{" "}
                  {invoiceData.customer?.name || invoiceData.contactName || 'N/A'}
                </p>
                <p>
                  <i className="bx bx-envelope checkout-icon"></i>{" "}
                  {invoiceData.customer?.email || invoiceData.contactEmail || 'N/A'}
                </p>
                <p>
                  <i className="bx bx-phone checkout-icon"></i>{" "}
                  {invoiceData.customer?.phone || invoiceData.contactPhone || 'N/A'}
                </p>
              </div>
            </div>

            <div className="checkout-customer-bottom">
              <div className="checkout-customer-left">
              <p>
                  Check-in : <span>{formatDate_DDMMYYYY(bookingData?.actualCheckin || bookingData?.checkinDate)}</span>
              </p>
                <p>
                  {/* Sử dụng formatCurrency và ưu tiên giá trị 0 làm dự phòng */}
                  Deposit : <span>{formatCurrency(invoiceData.customer?.deposit || invoiceData.deposit || 0)}</span>
                </p>
              </div>
              <div className="checkout-customer-right">
                  <p>
                    Check-out : <span>{formatDate_DDMMYYYY(bookingData?.checkoutDate || bookingData?.expectedCheckoutDate)}</span>
                  </p>
                <p>
                  Number Customer : <span>{invoiceData.customer?.adult || invoiceData.adult || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="checkout-section">
          <h3 className="checkout-section-title">Room Details</h3>
          <table className="checkout-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Room Type</th>
                <th>Price per night</th>
                <th>Number of nights</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{invoiceData?.room?.roomNumber || invoiceData?.roomNumber || 'N/A'}</td>
                <td>{invoiceData?.room?.type || invoiceData?.roomTypeName || 'N/A'}</td>
                <td>{formatCurrency(checkoutCalculation?.roomTotal ? checkoutCalculation.roomTotal / checkoutCalculation.numberOfNights : 1000000)}</td>
                <td>{checkoutCalculation?.numberOfNights || 1}</td>
                <td>{formatCurrency(checkoutCalculation?.roomTotal || 1000000)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Services */}
        <div className="checkout-section">
          <h3 className="checkout-section-title">Services</h3>
          {invoiceData.services?.length > 0 ? (
            <table className="checkout-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.services.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.quantity}</td>
                    <td>{formatCurrency(s.price)}</td>
                    <td>{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ marginTop: "10px" }}>No services used.</p>
          )}

          {/* Pending Services */}
          {pendingServices.length > 0 && (
            <div className="pending-services-section">
              <h4>Final Services Added</h4>
              <table className="checkout-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingServices.map((service, i) => (
                    <tr key={`pending-${i}`}>
                      <td>{service.serviceName}</td>
                      <td>{service.quantity}</td>
                      <td>{formatCurrency(service.pricePerUnit)}</td>
                      <td>{formatCurrency(service.total)}</td>
                      <td>
                        <button 
                          className="btn-remove-service"
                          onClick={() => handleRemoveServiceClick(service.serviceId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Service Button */}
          <div className="add-service-section">
            <button 
              className="btn-add-service"
              onClick={handleAddServiceClick}
            >
              + Add final service
            </button>
          </div>

          {/* Payment Summary */}
          <div className="checkout-summary">
            <div className="summary-row">
              <span>Subtotal (Room + Service)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {pendingServiceTotal > 0 && (
              <div className="summary-row">
                <span>Additional Services</span>
                <span>{formatCurrency(pendingServiceTotal)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Deposit</span>
              <span>-{formatCurrency(deposit)}</span>
            </div>
            {lateCheckoutFee > 0 && (
              <div className="summary-row">
                <span>Late Checkout Fee</span>
                <span className="penalty-amount">+{formatCurrency(lateCheckoutFee)}</span>
              </div>
            )}
            {earlyCheckoutPenalty > 0 && (
              <div className="summary-row">
                <span>Early Checkout Penalty</span>
                <span className="penalty-amount">+{formatCurrency(earlyCheckoutPenalty)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Additional Penalty</span>
              <div className="penalty-input-group">
                <input
                  type="number"
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="penalty-input"
                />
                <span className="penalty-currency">VND</span>
              </div>
            </div>
            <div className="summary-row total-inline">
              <span className="total-label">Amount to be Paid</span>
              <span className="summary-total-amount">{formatCurrency(finalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method & Action */}
        <div className="checkout-payment-section">
          <div className="payment-method-group">
            <label>Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-method-select"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Cash Payment Form */}
          {paymentMethod === 'Cash' && (
            <div className="cash-payment-form">
              <h4>Cash Payment</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount Received</label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="Enter amount received"
                    className="cash-input"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="form-group">
                  <label>Change</label>
                  <div className="change-display">
                    {changeAmount > 0 ? formatCurrency(changeAmount) : '0 VND'}
                  </div>
                </div>
              </div>
              {cashReceived && parseFloat(cashReceived) < finalAmount && (
                <div className="insufficient-cash-warning">
                  ⚠️ Insufficient cash received
                </div>
              )}
            </div>
          )}

          {/* Bank Transfer QR */}
          {paymentMethod === 'Bank Transfer' && (
            <div className="cash-payment-form" style={{ background: '#fff7ed', borderColor: '#fdba74' }}>
              <h4 style={{ color: '#9a3412' }}>Bank Transfer</h4>
              <p>Please ask the customer to scan the QR code below.</p>
              <p><strong>Amount: {formatCurrency(finalAmount)}</strong></p>
              <p><strong>Reference: </strong>{invoiceData?.customer?.name || invoiceData?.contactName || 'Customer'}</p>
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <img src={qrCodeUrl} alt="VietQR Code" style={{ maxWidth: '240px', width: '100%', borderRadius: '8px', border: '1px solid #fde68a' }} />
              </div>
              <p className="qr-note">After confirming the transfer is received, press "Complete Payment & Check-out".</p>
            </div>
          )}
          
          <button 
            className="checkout-complete-btn"
            onClick={handleCompletePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Payment & Check-out'}
          </button>
        </div>
      </div>
    </div>
  );
}
