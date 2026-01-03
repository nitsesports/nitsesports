import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase.js";
import { gameConfig, getGameConfig } from "@/data/gameConfig.js";

/* 🔥 NEW: Failover setup */
const PRIMARY_API = "https://nitsesportsbackend.vercel.app";
const SECONDARY_API = "https://nitsesportsbackend.onrender.com";

/* 🔥 NEW: Helper function for failover fetch */
async function safeFetch(path, options = {}) {
  try {
    const res = await fetch(`${PRIMARY_API}${path}`, options);
    if (!res.ok) throw new Error("Primary backend failed");
    return res;
  } catch (err) {
    console.warn("⚠️ Primary backend failed, trying backup:", err.message);
    const backupRes = await fetch(`${SECONDARY_API}${path}`, options);
    return backupRes;
  }
}

const TeamRegistration = () => {
  // const API_BASE = import.meta.env.VITE_BACKEND_URL;
  const { eventId, gameId } = useParams();
  const navigate = useNavigate();
  const gameInfo = getGameConfig(gameId);

  const [loading, setLoading] = useState(false);
  const [collegeType, setCollegeType] = useState("nits");
const totalRequiredPlayers = gameInfo.playerCount + gameInfo.substituteCount;
  const [formData, setFormData] = useState({
    email: "",
    teamName: "",
    teamLeaderName: "",
    teamLeaderContact: "",
    teamLeaderDiscord: "",
    alternateContact: "",
    players: new Array(totalRequiredPlayers).fill(""),
  playerInGameNames: new Array(totalRequiredPlayers).fill(""),
  scholarIds: new Array(totalRequiredPlayers).fill(""),
  });

  // Check if email is NITS student
  const isNitsEmail = (email) => {
    const nitsEmailPattern = /^[a-zA-Z0-9_]+_ug_\d{2}@[a-zA-Z0-9]+\.nits\.ac\.in$/;
    return nitsEmailPattern.test(email);
  };

  useEffect(() => {
    const initializeForm = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.email) {
        const userEmail = sessionData.session.user.email;
        setFormData((prev) => ({ ...prev, email: userEmail }));
        // Auto-set college type based on email
        if (!isNitsEmail(userEmail)) {
          setCollegeType("other");
        } else {
          setCollegeType("nits");
        }
      }
    };
    initializeForm();
  }, []);

  if (!gameInfo) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Game not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/events")}>Back to Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const playerCount = gameInfo.playerCount;
  const price = collegeType === "nits" ? gameInfo.price.nits : gameInfo.price.other;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-set college type based on email
    if (field === "email") {
      if (!isNitsEmail(value)) {
        setCollegeType("other");
      } else {
        setCollegeType("nits");
      }
    }
  };

  const handlePlayerChange = (index, field, value) => {
    const newData = { ...formData };
    if (field === "name") {
      newData.players[index] = value;
    } else if (field === "inGameName") {
      newData.playerInGameNames[index] = value;
    } else if (field === "scholarId") {
      newData.scholarIds[index] = value;
    }
    setFormData(newData);
  };

  const validateForm = () => {
    const emailIsNits = isNitsEmail(formData.email);

    if (!formData.email) return "Email is required";
    if (!formData.teamName) return "Team name is required";
    if (!formData.teamLeaderName) return "Team leader name is required";
    if (!formData.teamLeaderContact) return "Team leader contact is required";
    if (!formData.teamLeaderContact) return "Team leader contact is required";
    if (!/^\d{10}$/.test(formData.teamLeaderContact))
    return "Team leader contact must be a valid 10-digit number";
    if (!formData.playerInGameNames[0]) return "Team leader in-game name is required";
    if (emailIsNits && !formData.scholarIds[0]) {
      return "Team leader scholar ID is required for NITS students";
    }

    
    for (let i = 1; i < playerCount; i++) {
      if (!formData.players[i]) return `Player ${i + 1} name is required`;
      if (!formData.playerInGameNames[i]) return `Player ${i + 1} in-game name is required`;
      if (emailIsNits && !formData.scholarIds[i]) {
        return `Player ${i + 1} scholar ID is required for NITS students`;
      }
    }

    for (let i = playerCount; i < totalRequiredPlayers; i++) {
      const hasName = formData.players[i];
      const hasIGN = formData.playerInGameNames[i];
      
      if (hasName || hasIGN) {
        if (!hasName || !hasIGN) return `Please complete all fields for Substitute ${i - playerCount + 1}`;
        if (emailIsNits && !formData.scholarIds[i]) return `Scholar ID required for Substitute ${i - playerCount + 1}`;
      }
    }

    return null;
  };

 const handleSubmit = async () => {
  const error = validateForm();
      if (error) {
        toast.error(error);
        return;
      }
  setLoading(true);

  try {
      const payload = {
        event_id: eventId,
        game_id: gameId,
        email: formData.email,
        team_name: formData.teamName,
        team_leader_name: formData.teamLeaderName,
        team_leader_contact: formData.teamLeaderContact,
        alternate_contact: formData.alternateContact,
        college_type: collegeType,
        team_leader_discord: formData.teamLeaderDiscord,
        players: formData.players,
        player_in_game_names: formData.playerInGameNames,
        scholar_ids: formData.scholarIds,
        amount: price,
        return_url: `${window.location.origin}/cashfree-return?order_id={order_id}`,
      };

      // If price is 0, skip Cashfree and register directly to Supabase
      if (price === 0) {
        try {
          const { data, error } = await supabase
            .from("team_registrations")
            .insert([
              {
                event_id: eventId,
                game_id: gameId,
                email: formData.email,
                team_name: formData.teamName,
                team_leader_name: formData.teamLeaderName,
                team_leader_contact: formData.teamLeaderContact,
                alternate_contact: formData.alternateContact,
                college_type: collegeType,
                team_leader_discord: formData.teamLeaderDiscord,
                players: formData.players,
                player_in_game_names: formData.playerInGameNames,
                scholar_ids: formData.scholarIds,
                amount: price,
                payment_status: "free",
                created_at: new Date().toISOString(),
              },
            ])
            .select();

          if (error) {
            console.error("Registration failed", error);
            toast.error(error.message || "Registration failed");
            setLoading(false);
            return;
          }

          if (!data || data.length === 0) {
            toast.error("Registration failed: No data returned");
            setLoading(false);
            return;
          }

          toast.success("✅ Registration successful!");
          navigate(`/registration-confirmation/${data[0].id}`, { replace: true });
          return;
        } catch (err) {
          console.error("Registration error", err);
          toast.error("Registration failed. Please try again.");
          setLoading(false);
          return;
        }
      }

      /* 🔥 CHANGED: Using safeFetch instead of fetch(API_BASE …) */
      const resp = await safeFetch("/api/create-cashfree-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await resp.text();
      let response;
      try {
        response = JSON.parse(responseText);
      } catch (e) {
        console.error("Invalid JSON response:", responseText);
        toast.error("Server error: Invalid response from server");
        setLoading(false);
        return;
      }

if (!response.success || !response.payment_session_id) {
  console.error("Create order failed", response);
  toast.error(response?.error || "Failed to create payment session");
  setLoading(false);
  return;
}

const paymentSessionId = response.payment_session_id;
console.log("✅ Payment Session ID:", paymentSessionId);

// ✅ Avoid duplicate script loads
      if (!window.Cashfree) {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;
        script.onload = () => initPayment(paymentSessionId);
        document.body.appendChild(script);
      } else {
        initPayment(paymentSessionId);
      }
    } catch (err) {
      console.error("Payment error", err);
      toast.error("Payment could not be started. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const initPayment = async (paymentSessionId) => {
    const cashfree = window.Cashfree({ mode: "production" });
    await cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });
  };

  if (!gameInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading game information...</p>
      </div>
    );
  }



  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="font-orbitron text-3xl">{gameInfo.name} Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label>Email ID *</Label>
                <Input required type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="your@email.com" />
              </div>

              <div>
                <Label>Team Name *</Label>
                <Input required value={formData.teamName} onChange={(e) => handleInputChange("teamName", e.target.value)} placeholder="Enter team name" />
              </div>

              <div>
                <Label>Team Leader / Player 1 Name *</Label>
                <Input required value={formData.teamLeaderName} onChange={(e) => handleInputChange("teamLeaderName", e.target.value)} placeholder="Leader name" />
              </div>

              <div>
                <Label>Team Leader In-Game Name ({gameInfo.name} #IN_GAME_ID) *</Label>
                {/* Fixed typo: e.g.value -> e.target.value */}
                <Input required value={formData.playerInGameNames[0] || ""} onChange={(e) => handlePlayerChange(0, "inGameName", e.target.value)} placeholder="In-Game Name and Id (Separated with #)" />
              </div>

              <div>
                <Label>Team Leader Contact (WhatsApp) *</Label>
                <Input required value={formData.teamLeaderContact} onChange={(e) => handleInputChange("teamLeaderContact", e.target.value)} placeholder="10-digit number" />
              </div>

              <div>
                <Label>Alternate Contact (WhatsApp)</Label>
                {/* This line was already correct */}
                <Input value={formData.alternateContact} onChange={(e) => handleInputChange("alternateContact", e.target.value)} placeholder="10-digit number" />
              </div>

              <div>
                <Label>Team Leader Discord Tag</Label>
                <Input 
                  value={formData.teamLeaderDiscord} 
                  onChange={(e) => handleInputChange("teamLeaderDiscord", e.target.value)} 
                  placeholder="username#0000" 
                />
              </div>

              {/* Scholar ID only shows if collegeType is 'nits' */}
              {collegeType === "nits" && (
                <div>
                  <Label>Team Leader Scholar ID *</Label>
                  <Input required value={formData.scholarIds[0] || ""} onChange={(e) => handlePlayerChange(0, "scholarId", e.target.value)} placeholder="Scholar ID" />
                </div>
              )}
            </div>

            {/* College Type */}
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg font-semibold">College Type</h3>
              {/* This Select is now disabled and its value is controlled by the email input */}
              <Select value={collegeType} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nits">NITS Student (₹{gameInfo.price.nits})</SelectItem>
                  <SelectItem value="other">Other College (₹{gameInfo.price.other})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Players Info - Starting from Player 2 */}
            {playerCount > 1 && (
              <div className="space-y-4">
                <h3 className="font-orbitron text-lg font-semibold">Additional Players</h3>
                {Array.from({ length: playerCount - 1 }).map((_, i) => {
                  const playerIndex = i + 1;
                  return (
                    <div key={playerIndex} className="border border-border/30 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm">Player {playerIndex + 1}</h4>

                      <div>
                        <Label className="text-xs">Player {playerIndex + 1} Name *</Label>
                        <Input
                          required
                          value={formData.players[playerIndex] || ""}
                          onChange={(e) => handlePlayerChange(playerIndex, "name", e.target.value)}
                          placeholder="Player name"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">In-Game Name ({gameInfo.name} #IN_GAME_ID) *</Label>
                        <Input
                          required
                          value={formData.playerInGameNames[playerIndex] || ""}
                          onChange={(e) => handlePlayerChange(playerIndex, "In-Game Name and Id (Separated with #)", e.target.value)}
                          placeholder="In-Game Name and Id (Separated with #)"
                        />
                      </div>

                      {/* Scholar ID only shows if collegeType is 'nits' */}
                      {collegeType === "nits" && (
                        <div>
                          <Label className="text-xs">Scholar ID *</Label>
                          <Input
                            required
                            value={formData.scholarIds[playerIndex] || ""}
                            onChange={(e) => handlePlayerChange(playerIndex, "scholarId", e.target.value)}
                            placeholder="Scholar ID"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

{substituteCount > 0 && (
  <div className="space-y-4 mt-8 pt-6 border-t border-dashed border-primary/30">
    <h3 className="font-orbitron text-lg font-semibold text-primary/80">Substitutes (Optional)</h3>
    {Array.from({ length: substituteCount }).map((_, i) => {
      const playerIndex = playerCount + i; // Index starts after main players
      return (
        <div key={playerIndex} className="border border-primary/10 bg-primary/5 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm text-secondary">Substitute {i + 1}</h4>
          
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              value={formData.players[playerIndex] || ""}
              onChange={(e) => handlePlayerChange(playerIndex, "name", e.target.value)}
              placeholder="Full Name"
            />
          </div>

          <div>
            <Label className="text-xs">In-Game Name</Label>
            <Input
              value={formData.playerInGameNames[playerIndex] || ""}
              onChange={(e) => handlePlayerChange(playerIndex, "inGameName", e.target.value)}
              placeholder="IGN #ID"
            />
          </div>

          {collegeType === "nits" && (
            <div>
              <Label className="text-xs">Scholar ID</Label>
              <Input
                value={formData.scholarIds[playerIndex] || ""}
                onChange={(e) => handlePlayerChange(playerIndex, "scholarId", e.target.value)}
                placeholder="Scholar ID"
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

            {/* Price and Submit */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total Amount:</span>
                <span className="font-orbitron text-2xl font-bold text-primary">
                  {price === 0 ? "FREE" : `₹${price}`}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/events")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 font-orbitron"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : price === 0 ? "Register" : `Pay ₹${price}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamRegistration;
