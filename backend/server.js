import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { TeamRegistration } from "./models/TeamRegistration.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());


app.use(express.json());



/* -------------------------------------------------------------------------- */
/*                            ✅ TEST ROUTE                                   */
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => res.send("✅ Cashfree backend running"));

/* -------------------------------------------------------------------------- */
/*                       ✅ CREATE CASHFREE ORDER API                         */
/* -------------------------------------------------------------------------- */
app.post("/api/create-cashfree-order", async (req, res) => {
  try {
    const {
      event_id,
      game_id,
      email,
      team_name,
      team_leader_name,
      team_leader_contact,
      alternate_contact,
      college_type,
      team_leader_discord,
      players,
      player_in_game_names,
      scholar_ids,
      amount,
      return_url,
    } = req.body;

    // Generate a unique order ID
    const order_id = `ORDER_${Date.now()}`;

    // Create payload for Cashfree
    const payload = {
      order_id,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: email.replace(/[^a-zA-Z0-9_-]/g, "_"),
        customer_email: email,
        customer_phone: team_leader_contact,
        customer_name: team_leader_name,
      },
      order_meta: { return_url },
    };

    const headers = {
      "x-client-id": process.env.CASHFREE_CLIENT_ID,
      "x-client-secret": process.env.CASHFREE_SECRET,
      "x-api-version": "2025-01-01",
      "Content-Type": "application/json",
    };

    // Create order at Cashfree
    const { data } = await axios.post(process.env.CASHFREE_API_URL, payload, { headers });
    console.log("✅ Cashfree Order Created:", data);

    // Save team registration to MongoDB
    await TeamRegistration.create({
      event_id,
      game_id,
      email,
      team_name,
      team_leader_name,
      team_leader_contact,
      alternate_contact,
      college_type,
      team_leader_discord,
      players,
      player_in_game_names,
      scholar_ids,
      amount,
      payment_provider: "cashfree",
      payment_provider_order_id: order_id,
      payment_session_id: data.payment_session_id,
      payment_status: "PENDING",
    });

    // Respond with session ID
    res.json({
      success: true,
      payment_session_id: data.payment_session_id,
    });
  } catch (err) {
    console.error("❌ Create Order Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

/* -------------------------------------------------------------------------- */
/*                         ✅ VERIFY ORDER STATUS                             */
/* -------------------------------------------------------------------------- */
app.get("/api/verify-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await TeamRegistration.findOne({ payment_provider_order_id: orderId });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("❌ Verify Order Error:", err.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});
app.get("/api/verify-cashfree-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const headers = {
      "x-client-id": process.env.CASHFREE_CLIENT_ID,
      "x-client-secret": process.env.CASHFREE_SECRET,
      "x-api-version": "2025-01-01",
      "Content-Type": "application/json",
    };

    const { data } = await axios.get(
      `https://api.cashfree.com/pg/orders/${orderId}`,
      { headers }
    );

    const status = data.order_status;
    console.log("✅ Verified Order:", orderId, "→", status);

    // Update payment status
    await TeamRegistration.findOneAndUpdate(
      { payment_provider_order_id: orderId },
      { payment_status: status === "PAID" || status === "SUCCESS" ? "SUCCESS" : "FAILED" } 
);

    res.json({ success: true, status });
  } catch (err) {
    console.error("❌ Verify Order Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to verify order" });
  }
});



/* -------------------------------------------------------------------------- */
/*                            ✅ START SERVER                                 */
/* -------------------------------------------------------------------------- */
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
