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
import { FiPlus, FiDownload, FiLogOut, FiFileText, FiCreditCard, FiUser, FiSettings, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";

import Modal from "./Model";
import Addpayment from "./Addpayment";
import AdminContoll from "./admincontoll";

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

  const [username, setUsername] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [openModal, setOpenModal] = useState(null); // "add" or "admin"

  const router = useRouter();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/new");
  };

  // Token check & username set
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setTimeout(() => router.push("/new"), 500);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username || "User");
    } catch (err) {
      console.error("Invalid token:", err);
      router.push("/");
    }
  }, [router]);

  const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payments", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setPayments(data.map(p => ({ ...p, status: p.status || "Pending" })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  // Payment actions
  const handleEdit = (id) => setTimeout(() => router.push(`/form/${id}`), 30);
  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
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
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setPayments(p => p.map(pay => pay._id === id ? updated : pay));
    } catch (err) {
      console.error(err); alert("Error closing loan");
    }
  };

  // Pagination
  const handlePrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const handleNext = () => indexOfLast < filteredPayments.length && setCurrentPage(p => p + 1);

  // Filter
  const filteredByType = payments.filter(p =>
    viewType === "Loan" ? p.paymentType?.includes("Loan") : !p.paymentType?.includes("Loan")
  );
  const filteredPayments = filteredByType.filter(p => {
    const lower = searchTerm.toLowerCase();
    const matchesType = p.paymentType?.some(t => t.toLowerCase().includes(lower)) || false;
    const matchesNote = p.note?.toLowerCase().includes(lower) || false;
    const date = new Date(p.createdAt);
    const matchesDate = (!startDate || date >= startDate) && (!endDate || date <= endDate);
    return (matchesType || matchesNote) && matchesDate && p.note && p.amount;
  });
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);

  // Download
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(currentPayments.map((p,i)=>({
      Sr: indexOfFirst + i + 1,
      PaymentType: Array.isArray(p.paymentType)?p.paymentType.join(", "):p.paymentType,
      Amount: p.amount,
      Note: p.note,
      Date: new Date(p.createdAt).toLocaleDateString()
    })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "payments.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Payments Report", 14, 22);
    const rows = currentPayments.map((p,i)=>[
      indexOfFirst+i+1,
      Array.isArray(p.paymentType)?p.paymentType.join(", "):p.paymentType||"",
      Number(p.amount).toLocaleString("en-IN",{minimumFractionDigits:2, maximumFractionDigits:2}),
      p.note||"",
      new Date(p.createdAt).toLocaleDateString()
    ]);
    autoTable(doc, { startY:30, head:[["Sr.NO.","Payment Type","Amount","Note","Date"]], body:rows, styles:{fontSize:10}, headStyles:{fillColor:[30,64,175]} });
    doc.save("payments.pdf");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside initial={{ x:-250, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{duration:0.6,ease:"easeOut"}} className="w-[280px] bg-white text-gray-800 flex flex-col p-6 shadow-2xl rounded-r-2xl border-r border-gray-200">
        {/* Dashboard */}
        <div>
          <button onClick={()=>toggleMenu("dashboard")} className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-gray-200 transition">
            <span className="flex items-center gap-2 font-bold text-lg"><FiFileText size={18}/> Dashboard</span>
            {openMenu==="dashboard"?<FiChevronDown/>:<FiChevronRight/>}
          </button>
          {openMenu==="dashboard" && (
            <div className="ml-6 mt-2 flex flex-col gap-2">
              <button onClick={()=>setViewType("Regular")} className={`px-4 py-2 rounded flex items-center gap-2 ${viewType==="Regular"?"bg-blue-600 text-white":"hover:bg-gray-100"}`}><FiCreditCard size={16}/> Regular</button>
              <button onClick={()=>setViewType("Loan")} className={`px-4 py-2 rounded flex items-center gap-2 ${viewType==="Loan"?"bg-blue-600 text-white":"hover:bg-gray-100"}`}><RiBankLine size={16}/> Loan</button>
              <Link href="/showtable" className="px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-100"><FiFileText size={16}/> Export PDF</Link>
            </div>
          )}
        </div>
        {/* Admin */}
        <div className="mt-3">
          <button onClick={()=>toggleMenu("admin")} className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-gray-200 transition">
            <span className="flex items-center gap-2 font-bold text-lg"><FiSettings size={18}/> Admin Control</span>
            {openMenu==="admin"?<FiChevronDown/>:<FiChevronRight/>}
          </button>
          {openMenu==="admin" && (
            <div className="ml-6 mt-2 flex flex-col gap-2">
              <button onClick={()=>setOpenModal("admin")} className="px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-100"><FiPlus size={16}/> Form</button>
              <div className="px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-100"><FiUser size={16}/> {username}</div>
              <button onClick={handleLogout} className="px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-100" title="Logout"><FiLogOut size={20}/> Log-Out</button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md p-4 overflow-x-auto whitespace-nowrap flex items-center gap-6 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Search:</label>
            <input type="text" placeholder="Type or note..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-48" />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Date filter:</label>
            <DatePicker selected={startDate} onChange={setStartDate} selectsStart startDate={startDate} endDate={endDate} isClearable placeholderText="Start" className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-28" dateFormat="yyyy-MM-dd"/>
            <DatePicker selected={endDate} onChange={setEndDate} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} isClearable placeholderText="End" className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-28" dateFormat="yyyy-MM-dd"/>
          </div>

          <button onClick={downloadExcel} className="px-5 py-2 bg-white hover:bg-green-600 hover:text-white text-black rounded-md shadow-md text-sm flex items-center gap-2 transition"><FiDownload size={20}/> Excel</button>
          <button onClick={downloadPDF} className="px-5 py-2 bg-white hover:bg-red-500 hover:text-white text-black rounded-md shadow-md text-sm flex items-center gap-2 transition"><FiFileText size={20}/> PDF</button>
          <button onClick={()=>setOpenModal("add")} className="px-5 py-2 bg-white hover:bg-blue-500 hover:text-white text-black rounded-md shadow-md text-sm flex items-center gap-2 transition"><FiPlus size={20}/> Add payment</button>
        </header>

        <main className="flex-1 p-8 bg-white shadow-inner rounded-md m-6">
          <Alldata currentPayments={currentPayments} indexOfFirst={indexOfFirst} handleEdit={handleEdit} handleDelete={handleDelete} handlePrev={handlePrev} handleNext={handleNext} currentPage={currentPage} pageSizes={pageSizes} currentLimit={currentLimit} setCurrentLimitIndex={setCurrentLimitIndex} setCurrentPage={setCurrentPage} indexOfLast={indexOfLast} filteredPayments={filteredPayments} isLoanView={viewType==="Loan"} handleCloseLoan={handleCloseLoan}/>
        </main>
      </div>

      {/* Modal (fixed duplicate slider issue) */}
      {openModal && (
        <Modal isOpen={!!openModal} onClose={()=>setOpenModal(null)}>
          {openModal === "add" && <Addpayment />}
          {openModal === "admin" && <AdminContoll />}
        </Modal>
      )}
    </div>
  );
}
