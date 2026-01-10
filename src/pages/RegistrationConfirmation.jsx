import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { supabase } from "@/lib/supabase.js";
import { CheckCircle2 } from "lucide-react";

const WHATSAPP_GROUP_LINKS = {
  bgmi: "https://chat.whatsapp.com/JT1LmygDBmcJUODP2DhhuS",
  rc: "https://chat.whatsapp.com/D1oKopa4iM61eEPIj83owa",
  
};

const RegistrationConfirmation = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const whatsappLink = registration ? WHATSAPP_GROUP_LINKS[registration.game_id.toLowerCase()] : null;

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const { data, error } = await supabase
          .from("team_registrations")
          .select("*")
          .eq("id", registrationId)
          .single();

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }

        setRegistration(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [registrationId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <p className="text-center">Loading confirmation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Registration not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/events")}>Back to Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="glass-card border-green-500/30 bg-black">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            
            <CardTitle className="font-orbitron text-3xl text-green-500">
              Registration Confirmed!
            </CardTitle>
            {whatsappLink && (
  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-2">
    <p className="text-sm text-emerald-600 font-medium">
      📢 Join the official WhatsApp group for <strong>{registration.game_id.toUpperCase()}</strong>
    </p>

    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md transition"
    >
      Join WhatsApp Group
    </a>

    <p className="text-xs text-muted-foreground">
      Important updates, match schedules, and announcements will be shared here.
    </p>
  </div>
)}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Confirmation Details */}
            <div className="bg-background/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Registration ID:</span>
                <span className="font-mono font-semibold">{registrationId}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Game:</span>
                <span className="font-semibold capitalize">{registration.game_id}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Team Name:</span>
                <span className="font-semibold">{registration.team_name}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Team Leader:</span>
                <span className="font-semibold">{registration.team_leader_name}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold">{registration.email}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-semibold">{registration.team_leader_contact}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">College Type:</span>
                <Badge variant={registration.college_type === "nits" ? "default" : "outline"}>
                  {registration.college_type.toUpperCase()}
                </Badge>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold text-green-500">₹{registration.amount}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Payment Status:</span>
                <Badge variant="default" className="bg-green-600">
                  {registration.payment_status?.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Players Summary */}
            <div className="space-y-3">
              <h3 className="font-orbitron text-lg font-semibold">Team Members</h3>
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                {registration.players?.map((player, idx) => (
                  <div key={idx} className="text-sm space-y-1">
                    <p className="font-semibold">
                      Player {idx + 1}: {player}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      In-Game: {registration.player_in_game_names?.[idx]}
                    </p>
                    {registration.scholar_ids?.[idx] && (
                      <p className="text-muted-foreground text-xs">
                        Scholar ID: {registration.scholar_ids[idx]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-500">
                ✓ Your registration has been successfully submitted and payment has been received. 
                A confirmation email will be sent to <strong>{registration.email}</strong> shortly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/events")}
              >
                Back to Events
              </Button>
              <Button
                className="flex-1 font-orbitron"
                onClick={() => window.print()}
              >
                Print Confirmation
              </Button>
            </div>
          </CardContent>
          {/* WhatsApp Group */}


        </Card>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;
