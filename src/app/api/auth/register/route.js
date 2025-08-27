import { connectDB } from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcrypt";

export async function POST(req) {
  await connectDB();
  const { username, password } = await req.json();

  if (!username || !password) {
    return new Response(JSON.stringify({ message: "All fields required" }), { status: 400 });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10); 

  const user = await User.create({ username, password: hashedPassword });
     console.log("Created User ID:", user._id.toString());
  return new Response(JSON.stringify({ message: "User created", username: user.username }), { status: 201 });
}
