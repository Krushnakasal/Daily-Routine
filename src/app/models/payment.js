// models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  paymentType: {
    type: [String], // Array of strings
    
  },
  amount: {
    type: Number,

  },
  note: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Closed"],
    default: "Pending",
  },
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export default Payment;
