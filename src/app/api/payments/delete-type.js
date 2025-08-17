// pages/api/payments/delete-type.js
export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" }); // accept POST
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "ID required" });

  try {
    await Payment.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
