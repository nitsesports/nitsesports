import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* 🔥 NEW: Failover backend setup */
const PRIMARY_API = "http://nitsesportsbackend-env.eba-e3acmnk2.us-east-1.elasticbeanstalk.com";
const SECONDARY_API = "https://nitsesportsbackend.vercel.app";

/* 🔥 NEW: Universal failover-safe fetch */
async function safeFetch(path, options = {}) {
  let lastError;
  for (const base of [PRIMARY_API, SECONDARY_API]) {
    try {
      const res = await fetch(`${base}${path}`, options);
      if (res.ok) return res;
      lastError = await res.text();
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(`Both servers failed: ${lastError}`);
}

export default function CashfreeReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = params.get("order_id");
      if (!orderId) return;

      try {
        /* ✅ CHANGED: use safeFetch instead of fetch(API_BASE …) */
        const res = await safeFetch(`/api/verify-cashfree-order/${orderId}`);
        const data = await res.json();

        if (data.success && (data.status === "PAID" || data.status === "SUCCESS")) {
          toast.success("✅ Payment successful! Registration complete.");
          navigate("/PaymentSuccess");
        } else {
          toast.error("❌ Payment failed or cancelled.");
          navigate("/PaymentFail");
        }
      } catch (err) {
        console.error("❌ Verify Error:", err);
        toast.error("Unable to verify payment. Please try again later.");
        navigate("/PaymentFail");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? <p>Verifying your payment...</p> : <p>Redirecting...</p>}
    </div>
  );
}
