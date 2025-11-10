// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas URI
const MONGODB_URI = process.env.MONGODB_URI;

// ✅ Updated connection (no deprecated options)
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ----- Train Model -----
const trainSchema = new mongoose.Schema({
  name: String,
  from: String,
  to: String,
  time: String,
});
const Train = mongoose.model("Train", trainSchema);

// ----- Booking Model -----
const bookingSchema = new mongoose.Schema({
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: "Train" },
  passengerName: String,
  seat: String,
  createdAt: { type: Date, default: Date.now },
});
const Booking = mongoose.model("Booking", bookingSchema);

// ----- Routes -----

// Add a train (Admin/Seed)
app.post("/trains/add", async (req, res) => {
  try {
    const train = new Train(req.body);
    await train.save();
    res.json(train);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search trains: /trains?from=Delhi&to=Agra
app.get("/trains", async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from) query.from = { $regex: new RegExp(from, "i") };
    if (to) query.to = { $regex: new RegExp(to, "i") };
    const trains = await Train.find(query);
    res.json(trains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a ticket
app.post("/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bookings
app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("trainId");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel booking
app.delete("/bookings/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Start Server -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚆 Server running on http://localhost:${PORT}`)
);
