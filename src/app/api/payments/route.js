import { jwtDecode } from "jwt-decode";
import { connectDB } from "../../lib/dbConnect";
import Payment from "../../models/payment";
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    await connectDB();

    // token काढा
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ✅ फक्त त्याच user चे payments
    const payments = await Payment.find({ user: decoded.id }).sort({ createdAt: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function POST(req) {
  await connectDB();

  try {

    const body = await req.json();
    const { paymentType, amount, note, status, userId } = body;
     console.log(userId)
    if (!userId) {
      return NextResponse.json(
        { error: "Amount and userId are required" },
        { status: 400 }
      );
    }

    // Format paymentType
    let formattedType = paymentType;
    if (paymentType) {
      formattedType =
        paymentType.charAt(0).toUpperCase() + paymentType.slice(1).toLowerCase();
    }

    const payment = await Payment.create({
      paymentType: formattedType,
      amount,
      note,
      status,
      user: userId, // ✅ Schema मधल्या "user" field ला assign
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
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





