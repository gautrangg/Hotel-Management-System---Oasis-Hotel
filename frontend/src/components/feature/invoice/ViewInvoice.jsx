import React, { useState, useEffect } from "react";
import { formatDateTime } from "../../../utils/dateUtils";
import "@assets/payment/ViewInvoice.css";

const formatCurrency = (number) => {
  if (number === null || number === undefined) return "";
  if (typeof number === "string" && number.includes("VND")) return number;

  const value = parseFloat(number);
  if (isNaN(value)) return number;
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
};

export default function ViewInvoice({ bookingId, onClose, checkoutCalculation }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!bookingId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:8080/api/invoices/view/booking/${bookingId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData?.message) errorMsg = errorData.message;
          } catch { }
          throw new Error(errorMsg);
        }

        const data = await response.json();

        // Format dates for display using utility function (dd/mm/yyyy HH:mm)
        if (data.customer?.checkIn) {
          data.formattedCheckinDate = formatDateTime(data.customer.checkIn);
        }

        if (data.customer?.checkOut) {
          data.formattedCheckoutDate = formatDateTime(data.customer.checkOut);
        }

        setInvoice(data);
      } catch (err) {
        console.error("Invoice fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [bookingId]);

  if (loading)
    return (
      <div className="quynh-invoice-container">
        <h2 className="quynh-invoice-title">View Invoice</h2>
        <p>Loading invoice data...</p>
      </div>
    );

  if (error)
    return (
      <div className="quynh-invoice-container">
        <h2 className="quynh-invoice-title">View Invoice</h2>
        <p style={{ color: "red" }}>Error loading invoice: {error}</p>
      </div>
    );

  if (!invoice)
    return (
      <div className="quynh-invoice-container">
        <h2 className="quynh-invoice-title">View Invoice</h2>
        <p>No invoice found for this booking.</p>
      </div>
    );

  // render ui
  return (
    <div className="quynh-invoice-modal">
      <div className="quynh-invoice-container">
        <div className="quynh-invoice-header">
          <h2 className="quynh-invoice-title">View Invoice</h2>
          {onClose && (
            <button className="quynh-close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {/* Checkout Scenario Info */}
        {checkoutCalculation && (
          <div className="quynh-section quynh-scenario-section">
            <h3 className="quynh-section-title">Checkout Information</h3>
            <div className="quynh-scenario-box">
              <div className="quynh-scenario-info">
                <p><strong>Scenario:</strong> {checkoutCalculation.checkoutScenario}</p>
                <p><strong>Description:</strong> {checkoutCalculation.description}</p>
                {checkoutCalculation.hoursLate > 0 && (
                  <p><strong>Hours Late:</strong> {checkoutCalculation.hoursLate} hours</p>
                )}
                {checkoutCalculation.formattedExpectedCheckoutTime && (
                  <p><strong>Expected Checkout:</strong> {checkoutCalculation.formattedExpectedCheckoutTime}</p>
                )}
                {checkoutCalculation.formattedActualCheckoutTime && (
                  <p><strong>Actual Checkout:</strong> {checkoutCalculation.formattedActualCheckoutTime}</p>
                )}
                {checkoutCalculation.lateCheckoutFee > 0 && (
                  <p><strong>Late Checkout Fee:</strong> {formatCurrency(checkoutCalculation.lateCheckoutFee)}</p>
                )}
                {checkoutCalculation.earlyCheckoutPenalty > 0 && (
                  <p><strong>Early Checkout Penalty:</strong> {formatCurrency(checkoutCalculation.earlyCheckoutPenalty)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="quynh-section quynh-customer-section">
          <h3 className="quynh-section-title">
            Customer Information & Booking
          </h3>
          <div className="quynh-customer-box">
            <div className="quynh-customer-top">
              <div className="quynh-customer-left">
                <p>
                  <i className="bx bx-user quynh-icon"></i>{" "}
                  {invoice.customer?.name}
                </p>
                <p>
                  <i className="bx bx-envelope quynh-icon"></i>{" "}
                  {invoice.customer?.email}
                </p>
                <p>
                  <i className="bx bx-phone quynh-icon"></i>{" "}
                  {invoice.customer?.phone}
                </p>
              </div>
            </div>

            <div className="quynh-customer-bottom">
              <p>
                Check-in : <span>{invoice.customer?.checkIn || 'N/A'}</span>
              </p>
              <p>
                Check-out : <span>{invoice.customer?.checkOut || 'N/A'}</span>
              </p>
              <p>
                Deposit : <span>{formatCurrency(invoice.customer?.deposit) || 'N/A'}</span>
              </p>
              <p>
                Number Adults :{" "}
                <span>{invoice.customer?.adult}</span>
              </p>
              <p>
                Number Childrens :{" "}
                <span>{invoice.customer?.children}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="quynh-section">
          <h3 className="quynh-section-title">Room Details</h3>
          <table className="quynh-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Room Type</th>
                <th>Price per night</th>
                <th>Number of night</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{invoice.room?.roomNumber}</td>
                <td>{invoice.room?.type}</td>
                <td>{formatCurrency(invoice.room?.price)}</td>
                <td>{invoice.room?.nights}</td>
                <td>{formatCurrency(invoice.room?.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Services */}
        <div className="quynh-section">
          <h3 className="quynh-section-title">Services</h3>
          {invoice.services?.length > 0 ? (
            <table className="quynh-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.services.map((s, i) => (
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

          <div className="quynh-summary">
            <p>
              Room <span>{formatCurrency(invoice.summary?.room)}</span>
            </p>
            <p>
              Service <span>{formatCurrency(invoice.summary?.service)}</span>
            </p>
            <p>
              {invoice.summary.addtionalFee >= 0 ? "Additional Fees :" : "Discounts :"}
              <span>
                {formatCurrency(Math.abs(invoice.summary?.addtionalFee || 0))}
              </span>
            </p>
            <p>
              Penalty <span>{formatCurrency(invoice.summary?.penalty || 0)}</span>
            </p>
            <p>
              Deposit <span>{formatCurrency(invoice.summary?.deposit)}</span>
            </p>
            <p className="quynh-total">
              Total Amount <span>{formatCurrency(invoice.summary?.total)}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="quynh-footer">
          <div>
            Payment deposit status{" "}
            <span
              className={`quynh-status quynh-status-${invoice.paymentStatus?.toLowerCase()}`}
            >
              {invoice.paymentStatus}
            </span>
          </div>
          <div>
            Receptionist <span>{invoice.receptionist}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
