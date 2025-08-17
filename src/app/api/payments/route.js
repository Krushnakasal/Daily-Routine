import { connectDB } from "../../lib/dbconect";
import Payment from "../../models/payment";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const payments = await Payment.find();
  return NextResponse.json(payments);
}


export async function POST(req) {
  await connectDB();

  const body = await req.json();

  // PaymentType format: first letter uppercase, rest lowercase
  if (body.paymentType) {
    const type = body.paymentType;
    body.paymentType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  const payment = await Payment.insertMany(body);
  return NextResponse.json(payment);
}


export async function PUT(req) {
  await connectDB();
  const body = await req.json();
  const { id, ...updateData } = body;
  const updated = await Payment.findByIdAndUpdate(id, updateData, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await Payment.findByIdAndDelete(id);
  return NextResponse.json({ message: "Deleted successfully" });
}





