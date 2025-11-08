
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Payment Successful!</h1>
      <p className="text-lg mb-6">Your registration is complete.</p>
      <Button onClick={() => navigate("/events")}>Go to Events</Button>
    </div>
  );
}
