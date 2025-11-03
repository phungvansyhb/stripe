import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import PaymentRequestForm from "./PaymentRequestButton";
import { useEffect, useState } from "react";

const stripePromise = loadStripe(
  import.meta.env.VITE_PK_KEY
);

function App() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Tạo PaymentIntent từ frontend (chỉ để test)
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_SK_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            amount: "1099",
            currency: "usd",
            "automatic_payment_methods[enabled]": "true",
            "automatic_payment_methods[allow_redirects]": "always",
          }),
        });

        const data = await response.json();
        console.log("PaymentIntent created:", data);
        console.log("Payment method types:", data.payment_method_types);
        setClientSecret(data.client_secret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };

    createPaymentIntent();
  }, []);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <div style={{ margin: "auto", maxWidth: "500px", padding: "20px" }}>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <PaymentRequestForm />
        </Elements>
      ) : (
        <div>Loading payment form...</div>
      )}
    </div>
  );
}

export default App;
