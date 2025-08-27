import jwt from "jsonwebtoken";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return new Response(JSON.stringify({ message: "No token provided" }), { status: 401 });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ message: "Protected data", user: decoded.id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
  }
}
