import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useState } from "react";

export default function Alldata({
  currentPayments,
  indexOfFirst,
  handleEdit,
  handleDelete,
  handlePrev,
  handleNext,
  currentPage,
  pageSizes,
  currentLimit,
  setCurrentLimitIndex,
  setCurrentPage,
  indexOfLast,
  filteredPayments,
  isLoanView = false,
  handleCloseLoan,
}) {
  const [modalData, setModalData] = useState(null);

  const totalAmount = currentPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const truncateText = (text, length = 8) =>
    text?.length > length ? text.slice(0, length) + "..." : text;

  return (
    <>
      <section className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-indigo-100 text-indigo-800 font-semibold select-none">
            <tr>
              <th className="border px-5 py-3 text-center">No.</th>
              <th className="border px-5 py-3 text-left">Payment Type</th>
              <th className="border px-5 py-3 text-right">Amount</th>
              <th className="border px-5 py-3 text-left">Note</th>
              <th className="border px-5 py-3 text-center">Date</th>
              {isLoanView && (
                <>
                  <th className="border px-5 py-3 text-center">paid/not</th>
                  <th className="border px-5 py-3 text-center">Status</th>
                </>
              )}
              <th className="border px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentPayments.length === 0 ? (
              <tr>
                <td
                  colSpan={isLoanView ? 8 : 6}
                  className="text-center py-6 text-gray-400 italic"
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              currentPayments.map((p, i) => (
                <tr
                  key={p._id}
                  className="hover:bg-indigo-50 transition select-none"
                  title={`Payment on ${new Date(p.createdAt).toLocaleDateString()}`}
                >
                  <td className="border px-5 py-3 text-center">{indexOfFirst + i + 1}</td>

                  {/* Payment Type */}
                  <td className="border px-5 py-3">
                    {Array.isArray(p.paymentType) ? (
                      p.paymentType.join(", ").length > 8 ? (
                        <button
                          onClick={() =>
                            setModalData({ title: "Payment Type", content: p.paymentType.join(", ") })
                          }
                          className="text-indigo-600 underline font-semibold"
                        >
                          {truncateText(p.paymentType.join(", "))}
                        </button>
                      ) : (
                        p.paymentType.join(", ")
                      )
                    ) : p.paymentType.length > 8 ? (
                      <button
                        onClick={() =>
                          setModalData({ title: "Payment Type", content: p.paymentType })
                        }
                        className="text-indigo-600 underline font-semibold"
                      >
                        {truncateText(p.paymentType)}
                      </button>
                    ) : (
                      p.paymentType
                    )}
                  </td>

                  {/* Amount */}
                  <td className="border px-5 py-3 text-right font-mono">
                    {("₹ " + Number(p.amount).toLocaleString("en-IN")).length > 8 ? (
                      <button
                        onClick={() =>
                          setModalData({
                            title: "Amount",
                            content: "₹ " + Number(p.amount).toLocaleString("en-IN"),
                          })
                        }
                        className="text-indigo-600 underline font-semibold"
                      >
                        {truncateText("₹ " + Number(p.amount).toLocaleString("en-IN"), 8)}
                      </button>
                    ) : (
                      "₹ " + Number(p.amount).toLocaleString("en-IN")
                    )}
                  </td>

                  {/* Note */}
                  <td className="border px-5 py-3">
                    {p.note && p.note.length > 5 ? (
                      <button
                        onClick={() => setModalData({ title: "Note", content: p.note })}
                        className="text-black cursor-pointer  font-semibold"
                        >
                        {truncateText(p.note, 8)}
                      </button>
                    ) : (
                      p.note || "-"
                    )}
                  </td>

                  <td className="border px-5 py-3 text-center">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>

                  {isLoanView && (
                    <>
                      <td className="border px-5 py-3 text-center">
                        {p.status === "Closed" ? (
                          <span className="text-green-600 font-semibold">Closed</span>
                        ) : (
                          <button
                            onClick={() => handleCloseLoan(p._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Close
                          </button>
                        )}
                      </td>
                      <td className="border px-5 py-3 text-center font-semibold">
                        {p.status || "Pending"}
                      </td>
                    </>
                  )}

                  <td className="border px-5 py-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(p._id)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded-md font-semibold transition flex items-center gap-1"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition flex items-center gap-1"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Total Row */}
          {currentPayments.length > 0 && (
            <tfoot className="border">
              <tr className="bg-indigo-100 font-semibold select-none">
                <td className=" px-5 py-3 text-right" colSpan={2}>
                  Total
                </td>
                <td className=" px-5 py-3 text-right font-mono">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </td>
                <td className=" px-5 py-3" colSpan={isLoanView ? 5 : 4}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </section>

      {/* Pagination */}
      <section className="flex flex-wrap items-center justify-between mt-6 gap-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed text-gray-600"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          Previous
        </button>

        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-semibold select-none">Show:</span>
          {pageSizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                setCurrentLimitIndex(pageSizes.indexOf(size));
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                currentLimit === size
                  ? "bg-indigo-700 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={indexOfLast >= filteredPayments.length}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            indexOfLast >= filteredPayments.length
              ? "bg-gray-300 cursor-not-allowed text-gray-600"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          Next
        </button>
      </section>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-300 p-6 rounded-lg w-96 relative">
            <h2 className="font-semibold text-lg mb-4">{modalData.title}</h2>
            <p>{modalData.content}</p>
            <button
              onClick={() => setModalData(null)}
              className="absolute top-2 right-2 text-red-500 font-bold text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
