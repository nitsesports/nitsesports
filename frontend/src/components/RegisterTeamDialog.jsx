import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { supabase } from "@/lib/supabase.js";

const RegisterTeamDialog = ({ open, onOpenChange, eventId = "gamingbonanza", game }) => {
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [club, setClub] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [members, setMembers] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const reset = () => {
    setTeamName("");
    setClub("");
    setCaptainName("");
    setCaptainEmail("");
    setCaptainPhone("");
    setMembers("");
    setNotes("");
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!teamName || !captainName || !captainPhone) {
      setMessage("Please fill team name, captain name and phone");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setMessage("You must be signed in to register. Please login.");
        setLoading(false);
        return;
      }
    } catch (err) {
      setMessage("Auth check failed. Please try again.");
      setLoading(false);
      return;
    }

    const payload = {
      event_id: eventId,
      game_id: game?.id ?? null,
      team_name: teamName,
      club: club || null,
      captain_name: captainName,
      captain_email: captainEmail || null,
      captain_phone: captainPhone,
      members: members ? members.split(",").map((m) => m.trim()) : [],
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("team_registrations").insert([payload]);
      if (error) {
        setMessage(error.message || "Registration failed");
        setLoading(false);
        return;
      }
      setMessage("Registered successfully");
      reset();
      onOpenChange(false);
    } catch (err) {
      setMessage(err?.message || String(err) || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-orbitron text-center">Register Team {game ? `— ${game.name}` : ""}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label>Team Name</Label>
            <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" />
          </div>
          <div>
            <Label>Club / College (optional)</Label>
            <Input value={club} onChange={(e) => setClub(e.target.value)} placeholder="College or club" />
          </div>
          <div>
            <Label>Captain Name</Label>
            <Input value={captainName} onChange={(e) => setCaptainName(e.target.value)} placeholder="Captain name" />
          </div>
          <div>
            <Label>Captain Email (optional)</Label>
            <Input type="email" value={captainEmail} onChange={(e) => setCaptainEmail(e.target.value)} placeholder="captain@example.com" />
          </div>
          <div>
            <Label>Captain Phone</Label>
            <Input value={captainPhone} onChange={(e) => setCaptainPhone(e.target.value)} placeholder="10-digit phone" />
          </div>
          <div>
            <Label>Members (comma separated)</Label>
            <Textarea value={members} onChange={(e) => setMembers(e.target.value)} placeholder="Player1, Player2, Player3" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else" />
          </div>

          {message && <div className="text-sm text-red-600">{message}</div>}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterTeamDialog;
