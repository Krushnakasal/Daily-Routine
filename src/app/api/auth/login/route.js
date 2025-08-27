import {connectDB} from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();
  const { username, password } = await req.json();

  const user = await User.findOne({ username });
  if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });

  return new Response(JSON.stringify({ token, username: user.username }), { status: 200 });
}
