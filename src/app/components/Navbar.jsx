"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Alldata from "./Alldata";
import Link from "next/link";

import { RiBankLine } from "react-icons/ri";
import { FiPlus, FiDownload, FiFileText, FiCreditCard } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // ✅ Added

export default function Navbar() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewType, setViewType] = useState("Regular");

  const pageSizes = [10, 20, 30];
  const [currentLimitIndex, setCurrentLimitIndex] = useState(0);
  const currentLimit = pageSizes[currentLimitIndex];
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLast = currentPage * currentLimit;
  const indexOfFirst = indexOfLast - currentLimit;

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      const paymentsWithStatus = data.map((p) => ({
        ...p,
        status: p.status || "Pending",
      }));
      setPayments(paymentsWithStatus);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const router = useRouter();

  const handleEdit = (id) => {
    setTimeout(() => {
      router.push(`/form/${id}`);
    }, 30);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
      fetchPayments();
    }
  };

  const handleCloseLoan = async (id) => {
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Closed" }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      const updatedPayment = await res.json();

      setPayments((prevPayments) =>
        prevPayments.map((p) => (p._id === id ? updatedPayment : p))
      );
    } catch (error) {
      console.error("Error closing loan:", error);
      alert("Error closing loan, please try again.");
    }
  };

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => {
    if (indexOfLast < filteredPayments.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const filteredByType = payments.filter((p) =>
    viewType === "Loan"
      ? p.paymentType?.includes("Loan")
      : !p.paymentType?.includes("Loan")
  );

  const filteredPayments = filteredByType.filter((p) => {
    const lowerSearchTerm = searchTerm.toLowerCase();

    const matchesPaymentType =
      p.paymentType?.some((type) =>
        type.toLowerCase().includes(lowerSearchTerm)
      ) || false;

    const matchesNote =
      p.note?.toLowerCase().includes(lowerSearchTerm) || false;

    const paymentDate = new Date(p.createdAt);
    const matchesDate =
      (!startDate || paymentDate >= startDate) &&
      (!endDate || paymentDate <= endDate);

    const hasNoteAndAmount = p.note && p.amount;

    return (matchesPaymentType || matchesNote) && matchesDate && hasNoteAndAmount;
  });

  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      currentPayments.map((p, i) => ({
        Sr: indexOfFirst + i + 1,
        PaymentType: Array.isArray(p.paymentType)
          ? p.paymentType.join(", ")
          : p.paymentType,
        Amount: p.amount,
        Note: p.note,
        Date: new Date(p.createdAt).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Payments Report", 14, 22);

    const rows = currentPayments.map((p, i) => {
      const amountNum = Number(p.amount);
      const amountFormatted = amountNum.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return [
        indexOfFirst + i + 1,
        p.paymentType
          ? Array.isArray(p.paymentType)
            ? p.paymentType.join(", ")
            : p.paymentType
          : "",
        `${amountFormatted}`,
        p.note || "",
        new Date(p.createdAt).toLocaleDateString(),
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [["Sr.NO.", "Payment Type", "Amount", "Note", "Date"]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.save("payments.pdf");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[300px] bg-white text-gray-800 flex flex-col p-6 shadow-2xl rounded-r-2xl border-r border-gray-200"
      >
        <motion.h2
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-extrabold mb-8 tracking-wide border-b border-indigo-600 pb-3 cursor-pointer hover:text-indigo-700 transition"
          onClick={() => router.push("/")}
        >
          Dashboard
        </motion.h2>

        <nav className="flex flex-col gap-4 text-lg">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewType("Regular")}
            className={`px-5 py-3 rounded-lg transition flex items-center gap-3 font-semibold ${
              viewType === "Regular"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-indigo-100 text-gray-700"
            }`}
          >
            <FiCreditCard size={18} />
            Regular
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewType("Loan")}
            className={`px-5 py-3 rounded-lg transition flex items-center gap-3 font-semibold ${
              viewType === "Loan"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-indigo-100 text-gray-700"
            }`}
          >
            <RiBankLine size={18} />
            Loan
          </motion.button>

          <Link href="/showtable">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-3 rounded-lg hover:bg-indigo-100 transition flex items-center gap-3 font-semibold text-gray-700"
            >
              <FiFileText size={20} />
              Export PDF
            </motion.button>
          </Link>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md p-4 overflow-x-auto whitespace-nowrap flex items-center gap-6 border-b border-gray-300">
          {/* Search */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Search:</label>
            <input
              type="text"
              placeholder="Type or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-48"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Date filter:</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              isClearable
              placeholderText="Start"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-28"
              dateFormat="yyyy-MM-dd"
            />
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              isClearable
              placeholderText="End"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-28"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Download Buttons */}
          <button
            onClick={downloadExcel}
            className="px-5 py-2 bg-white hover:bg-green-600 hover:text-white text-black rounded-md shadow-md text-sm flex items-center gap-2 transition"
          >
            <FiDownload size={20} />
            Excel
          </button>
          <button
            onClick={downloadPDF}
            className="px-5 py-2 bg-white hover:bg-red-500 hover:text-white text-black  rounded-md shadow-md text-sm flex items-center gap-2 transition"
          >
            <FiFileText size={20} />
            PDF
          </button>
          <button className="px-5 py-2  bg-white hover:bg-blue-500 hover:text-white text-black rounded-md shadow-md text-sm flex items-center gap-2 transition">
            <FiPlus size={20} />
            <Link href="/form" className="block">
              Add payment
            </Link>
          </button>
        </header>

        {/* Table */}
        <main className="flex-1 p-8 bg-white shadow-inner rounded-md m-6">
          <Alldata
            currentPayments={currentPayments}
            indexOfFirst={indexOfFirst}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePrev={handlePrev}
            handleNext={handleNext}
            currentPage={currentPage}
            pageSizes={pageSizes}
            currentLimit={currentLimit}
            setCurrentLimitIndex={setCurrentLimitIndex}
            setCurrentPage={setCurrentPage}
            indexOfLast={indexOfLast}
            filteredPayments={filteredPayments}
            isLoanView={viewType === "Loan"}
            handleCloseLoan={handleCloseLoan}
          />
        </main>
      </div>
    </div>
  );
}
