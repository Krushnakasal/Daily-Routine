import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // relation with User
    
  },
  paymentType: {
    type: [String], // array of payment types
  },
  amount: {
    type: Number,
    
  },
  note: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Closed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export default Payment;
