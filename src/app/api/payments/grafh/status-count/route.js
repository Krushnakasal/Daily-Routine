import { connectDB } from "../../../../lib/dbconect";
import Payment from "../../../../models/payment";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  // 1) Loan चा Pending आणि Closed count
  const loanStatusCounts = await Payment.aggregate([
    { $match: { paymentType: "Loan" } }, // Loan paymentType filter (जर paymentType array असेल तर unwind करा)
    { $unwind: "$paymentType" },          // जर paymentType array असेल तर पहिले unwind करा (खाली दाखवलंय)
    { $match: { paymentType: "Loan" } }, // नंतर पुन्हा filter करा कारण unwind नंतर पाहिजे
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // 2) बाकी सर्व paymentTypes ची एकूण संख्या, Loan वगळून
  const totalOtherCounts = await Payment.aggregate([
    { $unwind: "$paymentType" },
    { $match: { paymentType: { $ne: "Loan" } } },
    {
      $group: {
        _id: "$paymentType",
        count: { $sum: 1 }
      }
    }
  ]);

  // Loan status map तयार करा
  const loanStatusMap = loanStatusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Other paymentTypes साठी array तयार करा
  const otherPayments = totalOtherCounts.map(item => ({
    paymentType: item._id,
    count: item.count,
  }));

  return NextResponse.json({
    loan: {
      pending: loanStatusMap.Pending || 0,
      closed: loanStatusMap.Closed || 0,
    },
    otherPayments,
  });
}
