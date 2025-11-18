import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import '@assets/payment/Payment.css';
import Swal from "sweetalert2";

const stripePromise = loadStripe('pk_test_51SIrHkLlAjJ4DJ61Gh62GIK9pfEuAvSuMcrIK5IiowbrF4Zfyy0xTVkRZ54oSNcAqWVERpqKgFAIUnLvFqqm36hn00iCQWLqrU'); 

const getFriendlyErrorMessage = (stripeError) => {
    if (!stripeError || !stripeError.code) {
        return "An unexpected error occurred. Please try again.";
    }

    switch (stripeError.code) {
        case 'card_declined':
            return "Your card was declined. Please check the information or use a different card.";
        case 'expired_card':
            return "This card has expired. Please use a different card.";
        case 'incorrect_cvc':
        case 'invalid_cvc':
            return "The CVC code is incorrect. Please check the 3-4 digit code on the back of your card.";
        case 'incomplete_number':
        case 'invalid_number':
            return "The card number is invalid. Please check and re-enter.";
        case 'incomplete_expiry':
        case 'invalid_expiry_year':
        case 'invalid_expiry_month':
            return "The expiration date is invalid. Please use MM/YY format.";
        case 'processing_error':
            return "There was an error processing the payment. Please try again shortly.";
        default:
            return "Payment failed. Please check your card information and try again.";
    }
};

const CheckoutForm = forwardRef(({ amount, onPaymentSuccess, onPaymentError }, ref) => {
    const stripe = useStripe();
    const elements = useElements();

    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (amount > 0) {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            axios.post('http://localhost:8080/api/payment/create-payment-intent', { amount }, config)
                .then(res => {
                    setClientSecret(res.data.clientSecret);
                    setError(null);
                })
                .catch(() => {
                    setError("Could not initialize payment. Please try again.");
                });
        }
    }, [amount]);

    useImperativeHandle(ref, () => ({
        async triggerSubmit() {
            if (!stripe || !elements || !clientSecret) {
                const friendlyError = "The payment system is not ready yet.";
                console.error("Stripe.js has not loaded yet or client secret is missing.");
                onPaymentError(friendlyError);
                return { success: false, error: friendlyError };
            }

            setError(null);

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });


            if (error) {
                const friendlyMessage = getFriendlyErrorMessage(error);
                
                setError(friendlyMessage);
                onPaymentError(friendlyMessage);
                return { success: false, error: friendlyMessage };
                
            } else if (paymentIntent.status === 'succeeded') {
                setError(null);
                onPaymentSuccess(paymentIntent);
                return { success: true, paymentIntent };
            }

            return { success: false, error: "Unknown transaction status." };
        }
    }));

    const cardElementOptions = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#fa755a', iconColor: '#fa755a' },
        },
        hidePostalCode: true,
    };

    return (
        <div className="payment-form-container">
            <div className="card-element-container">
                <CardElement id="card-element" options={cardElementOptions} />
            </div>

            {error && <div className="payment-message error">{error}</div>}
        </div>
    );
});

const StripePayment = forwardRef(({ amount, onPaymentSuccess, onPaymentError }, ref) => {
    if (amount <= 0) {
        return <div className="payment-container">Please select dates to calculate the amount.</div>
    }

    return (
        <div className="payment-container">
            <div className="payment-header">
                <h2>Payment</h2>
                <p>Total amount: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</strong></p>
            </div>
            <Elements stripe={stripePromise}>
                <CheckoutForm
                    ref={ref}
                    amount={amount}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={onPaymentError}
                />
            </Elements>
        </div>
    );
});

export default StripePayment;