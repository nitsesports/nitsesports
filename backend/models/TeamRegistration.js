import mongoose from "mongoose";
import crypto from "crypto";

const teamRegistrationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  // Event & Game info
  event_id: { type: String, required: true },
  game_id: { type: String, required: true },

  // Team & contact info
  email: { type: String, required: true },
  team_name: { type: String, required: true },
  team_leader_name: { type: String, required: true },
  team_leader_contact: { type: String, required: true },
  alternate_contact: { type: String },
  college_type: { type: String, enum: ["nits", "other"], required: true },
  team_leader_discord: { type: String },

  // Arrays for multiple players
  players: { type: [String], default: [] },
  player_in_game_names: { type: [String], default: [] },
  scholar_ids: { type: [String], default: [] },

  // Payment info
  amount: { type: Number, required: true },
  payment_status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING",
  },
  payment_provider: { type: String, default: "cashfree" },
  payment_provider_order_id: { type: String }, // Cashfree order_id
  payment_provider_payment_id: { type: String }, // actual payment reference (optional)
  payment_session_id: { type: String },
});

export const TeamRegistration = mongoose.model("TeamRegistration", teamRegistrationSchema);
