import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const PaymentRequestForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Debug: Kiểm tra xem Google Pay có khả dụng không
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Test',
          amount: 1099,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        console.log('PaymentRequest canMakePayment:', result);
        if (result) {
          console.log('✅ Google Pay or Apple Pay available!');
        } else {
          console.log('❌ No digital wallets available');
        }
      });
    }
  }, [stripe]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "An error occurred");
      setIsLoading(false);
      return;
    }

    // Confirm payment - clientSecret đã được truyền vào Elements
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message || "Payment failed");
      setIsLoading(false);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement 
        options={{ 
          wallets: { 
            applePay: 'auto', 
            googlePay: 'auto' 
          } 
        }} 
      />
      <button 
        type="submit" 
        disabled={!stripe || !elements || isLoading}
        style={{ 
          marginTop: "20px", 
          width: "100%", 
          padding: "12px",
          backgroundColor: "#5469d4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: isLoading ? "not-allowed" : "pointer"
        }}
      >
        {isLoading ? "Processing..." : "Pay"}
      </button>
      {/* Show error message to your customers */}
      {errorMessage && (
        <div style={{ color: "red", marginTop: "12px" }}>
          {errorMessage}
        </div>
      )}
    </form>
  );
};

export default PaymentRequestForm;
