import { connectDB } from "../../../lib/dbConnect";
import Payment from "../../../models/payment";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
}
export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();
  try {
    const updated = await Payment.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}


