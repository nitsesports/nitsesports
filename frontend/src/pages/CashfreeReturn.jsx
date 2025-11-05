
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CashfreeReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = params.get("order_id");
      if (!orderId) return;

      try {
        const API_BASE = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${API_BASE}/api/verify-cashfree-order/${orderId}`);
        const data = await res.json();

        if (data.success && data.status === "PAID") {
          toast.success("✅ Payment successful! Registration complete.");
          navigate("/PaymentSuccess");
        } else {
          toast.error("❌ Payment failed or cancelled.");
          navigate("/PaymentFail");
        }
      } catch (err) {
        console.error("Verify Error:", err);
        toast.error("Unable to verify payment.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? <p>Verifying your payment...</p> : <p>Redirecting...</p>}
    </div>
  );
}
