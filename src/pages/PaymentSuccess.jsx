import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const WHATSAPP_GROUP_LINKS = [
  {
    name: "Free Fire",
    link: "https://chat.whatsapp.com/D38uU249lJKJSTquoOgRrb",
  },
  {
    name: "Valorant",
    link: "https://chat.whatsapp.com/D3izu54NpVi69H6eVNzAsu",
  },
  {
    name: "MLBB",
    link: "https://chat.whatsapp.com/Ejo9p6BASMULwXiPa8vEfI",
  },
  {
    name: "FIFA",
    link: "https://chat.whatsapp.com/LbiWkF4HfT56Oeh3LeafSw",
  },
];

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-bold text-green-600">
        ✅ Payment Successful!
      </h1>

      <p className="text-lg text-center">
        Your registration is complete. Join the WhatsApp group for updates.
      </p>

      {/* ⚠️ Warning */}
      <div className="max-w-md w-full bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="text-yellow-500 w-5 h-5 mt-0.5" />
        <p className="text-sm text-yellow-600">
          <strong>Important:</strong> Please join <strong>only the WhatsApp group of the game you registered for</strong>.
          Joining other groups may lead to confusion and removal by admins.
        </p>
      </div>

      {/* WhatsApp Links */}
      <div className="w-full max-w-sm space-y-3">
        {WHATSAPP_GROUP_LINKS.map((game) => (
          <a
            key={game.name}
            href={game.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Join {game.name} WhatsApp Group
          </a>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-4"
        onClick={() => navigate("/events")}
      >
        Go to Events
      </Button>
    </div>
  );
}
