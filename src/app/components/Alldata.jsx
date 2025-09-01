import { FiEdit, FiTrash2, FiX, FiCheck, FiClock } from "react-icons/fi";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // Toast wrappers
  const notifyDelete = () => toast.success("Payment deleted successfully ✅");
  const notifyEdit = () => toast.info("Edit mode opened ✏️");
  const notifyCloseLoan = () => toast.success("Loan closed successfully 🚀");

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {currentPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 italic bg-white rounded-lg shadow">
              No payments found.
            </div>
          ) : (
            currentPayments.map((p, i) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-white p-4 rounded-lg shadow-lg border"
              >

                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {indexOfFirst + i + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {isLoanView && (
                    <div className="flex items-center gap-2">
                      {p.status === "Closed" ? (
                        <span className="flex items-center justify-center p-2 bg-green-500 text-white rounded-full">
                          <FiCheck size={14} />
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            handleCloseLoan(p._id);
                            notifyCloseLoan();
                          }}
                          className="flex items-center justify-center p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          title="Close Loan"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Status for Loan View */}
                {isLoanView && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-600 block mb-1">Status:</span>
                    {p.status === "Pending" ? (
                      <span className="flex items-center justify-start p-2 bg-red-500 text-white rounded-full ">
                        <FiClock size={18} />
                        <span className="ml-2 text-sm font-medium">Pending</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-start bg-green-500 text-white rounded-full p-1">
                        <FiCheck size={16} />
                        <span className="ml-2 text-sm font-medium">Closed</span>
                      </span>
                    )}
                  </div>
                )}


                {/* Payment Type */}
                <div className="mb-2">
                  <span className="text-xs text-gray-600 block mb-1">Payment Type:</span>
                  <div className="font-medium">
                    {Array.isArray(p.paymentType) ? (
                      p.paymentType.join(", ").length > 25 ? (
                        <button
                          onClick={() =>
                            setModalData({ title: "Payment Type", content: p.paymentType.join(", ") })
                          }
                          className="text-indigo-600 underline"
                        >
                          {truncateText(p.paymentType.join(", "), 25)}
                        </button>
                      ) : (
                        p.paymentType.join(", ")
                      )
                    ) : p.paymentType.length > 25 ? (
                      <button
                        onClick={() =>
                          setModalData({ title: "Payment Type", content: p.paymentType })
                        }
                        className="text-indigo-600 underline"
                      >
                        {truncateText(p.paymentType, 25)}
                      </button>
                    ) : (
                      p.paymentType
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-2">
                  <span className="text-xs text-gray-600 block mb-1">Amount:</span>
                  <div className="text-lg font-bold text-green-600 font-mono">
                    ₹ {Number(p.amount).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Note */}
                {p.note && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-600 block mb-1">Note:</span>
                    <div className="text-sm">
                      {p.note.length > 30 ? (
                        <button
                          onClick={() => setModalData({ title: "Note", content: p.note })}
                          className="text-gray-800 underline"
                        >
                          {truncateText(p.note, 30)}
                        </button>
                      ) : (
                        p.note
                      )}
                    </div>
                  </div>
                )}

                {/* Status for Loan View */}
                {isLoanView && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-600 block mb-1">Status:</span>
                    <span className="text-sm font-medium">{p.status || "Pending"}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleEdit(p._id);
                      notifyEdit();
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-2 rounded-md font-semibold transition flex items-center gap-2 shadow-sm"
                  >
                    <FiEdit size={16} />
                    
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleDelete(p._id, i);
                      notifyDelete();
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md font-semibold transition flex items-center gap-2 shadow-sm"
                  >
                    <FiTrash2 size={16} />
                    
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}

          {/* Mobile Total */}
          {currentPayments.length > 0 && (
            <div className="bg-indigo-100 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <span className="text-xl font-bold text-indigo-700 font-mono">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
        </motion.section>
      </div>

      {/* Desktop Table View */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden md:block overflow-x-auto rounded-sm shadow-xl bg-white w-full"
      >
        <table className="w-full border-collapse min-w-[600px] text-sm lg:text-base">
          <thead className="bg-blue-100 text-black font-semibold select-none">
            <tr>
              <th className="border px-3 lg:px-5 py-2 lg:py-3 text-center">No.</th>
              <th className="border px-3 lg:px-5 py-2 lg:py-3 text-left">Payment Type</th>
              <th className="border px-3 lg:px-5 py-2 lg:py-3 text-right">Amount</th>
              <th className="border px-3 lg:px-5 py-2 lg:py-3 text-left">Note</th>
              <th className="border px-3 lg:px-5 py-2 lg:py-3 text-center">Date</th>
              {isLoanView && (
                <>
                  <th className="border px-3 lg:px-5 py-2 lg:py-3 text-center">Action</th>
                  <th className="border px-3 lg:px-5 py-2 lg:py-3 text-center">Status</th>
                </>
              )}
              <th className="border px-3 lg:px-5 py-2 lg:py-3 text-center">Actions</th>
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
                <motion.tr
                  key={p._id}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="hover:bg-indigo-50 transition select-none cursor-pointer"
                  title={`Payment on ${new Date(p.createdAt).toLocaleDateString()}`}
                >
                  <td className="border px-3 lg:px-5 py-2 lg:py-3 text-center">
                    {indexOfFirst + i + 1}
                  </td>

                  {/* Payment Type */}
                  <td className="border px-3 lg:px-5 py-2 lg:py-3">
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
                  <td className="border px-3 lg:px-5 py-2 lg:py-3 text-right font-mono">
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
                  <td className="border px-3 lg:px-5 py-2 lg:py-3">
                    {p.note && p.note.length > 5 ? (
                      <button
                        onClick={() => setModalData({ title: "Note", content: p.note })}
                        className="text-black cursor-pointer font-semibold"
                      >
                        {truncateText(p.note, 8)}
                      </button>
                    ) : (
                      p.note || "-"
                    )}
                  </td>

                  <td className="border px-3 lg:px-5 py-2 lg:py-3 text-center">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>

                  {isLoanView && (
                    <>
                      {/* Loan Action (Desktop) */}
                      <td className="border px-3 lg:px-5 py-2 lg:py-3 text-center">
                        {p.status === "Closed" ? (
                          <span className="flex items-center justify-center">
                            <span className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition">
                              <FiCheck size={16} />
                            </span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              handleCloseLoan(p._id);
                              notifyCloseLoan();
                            }}
                            className="flex items-center justify-center p-2 ml-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                            title="Close Loan"
                          >
                            <FiX size={16} />
                          </button>
                        )}
                      </td>

                      {/* Loan Status (Desktop) */}
                      <td className="border px-3 lg:px-5 py-2 lg:py-3 text-center font-semibold">
                        {p.status === "Pending" ? (
                          <span className="flex items-center justify-center text-yellow-600">
                            <FiClock size={22} />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center bg-green-500 text-white rounded-full p-1">
                            <FiCheck size={18} />
                          </span>
                        )}
                      </td>

                    </>
                  )}

                  {/* Actions */}
                  <td className="border px-3 lg:px-5 py-2 lg:py-3">
                    <div className="flex justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          handleEdit(p._id);
                          notifyEdit();
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 lg:px-3 py-1 lg:py-2 rounded-md font-semibold transition flex items-center gap-1 lg:gap-2 shadow"
                      >
                        <FiEdit size={16} />
                        
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          handleDelete(p._id, i);
                          notifyDelete();
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 lg:px-3 py-1 lg:py-2 rounded-md font-semibold transition flex items-center gap-1 lg:gap-2 shadow"
                      >
                        <FiTrash2 size={16} />
                      
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>

          {/* Total Row */}
          {currentPayments.length > 0 && (
            <tfoot className="border">
              <tr className="bg-indigo-100 font-semibold select-none">
                <td className="px-3 lg:px-5 py-2 lg:py-3 text-right" colSpan={2}>
                  Total
                </td>
                <td className="px-3 lg:px-5 py-2 lg:py-3 text-right font-mono">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </td>
                <td className="px-3 lg:px-5 py-2 lg:py-3" colSpan={isLoanView ? 5 : 4}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </motion.section>

      {/* Pagination */}
      <section className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <motion.button
          whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`w-full sm:w-auto px-4 py-2 rounded-md font-semibold transition shadow ${currentPage === 1
            ? "bg-gray-300 cursor-not-allowed text-gray-600"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        >
          Previous
        </motion.button>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-gray-700 font-semibold select-none text-sm">Show:</span>
          {pageSizes.map((size) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              key={size}
              onClick={() => {
                setCurrentLimitIndex(pageSizes.indexOf(size));
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md font-semibold transition shadow text-sm ${currentLimit === size
                ? "bg-indigo-700 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              {size}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: indexOfLast >= filteredPayments.length ? 1 : 1.05 }}
          whileTap={{ scale: indexOfLast >= filteredPayments.length ? 1 : 0.95 }}
          onClick={handleNext}
          disabled={indexOfLast >= filteredPayments.length}
          className={`w-full sm:w-auto px-4 py-2 rounded-md font-semibold transition shadow ${indexOfLast >= filteredPayments.length
            ? "bg-gray-300 cursor-not-allowed text-gray-600"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        >
          Next
        </motion.button>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl"
            >
              <h2 className="font-semibold text-lg mb-4 text-gray-800">
                {modalData.title}
              </h2>
              <p className="text-black break-words">{modalData.content}</p>
              <button
                onClick={() => setModalData(null)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}