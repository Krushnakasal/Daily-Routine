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
import { 
  FiPlus, 
  FiDownload, 
  FiLogOut, 
  FiFileText, 
  FiCreditCard, 
  FiUser, 
  FiSettings, 
  FiChevronDown, 
  FiChevronRight,
  FiMenu,
  FiX,
  FiMoon,
  FiSun
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

import Addpayment from "./Addpayment";
import AdminContoll from "./admincontoll";

// Modal Component
const Modal = ({ isOpen, onClose, children, isDark }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-trasperant bg-opacity-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${isDark ? 'bg-gray-800' : 'bg-amber-200'} rounded-lg shadow-xl h-[500px] w-full max-w-3xl p-6 relative overflow-hidden`}
      >
        <button 
          onClick={onClose} 
          className={`absolute top-3 right-3 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-all`}
        >
          <FiX size={20} />
        </button>
        {children}
      </motion.div>
    </div>
  );
};

export default function Navbar() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewType, setViewType] = useState("Regular");
  const [currentLimitIndex, setCurrentLimitIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [username, setUsername] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const pageSizes = [10, 20, 30];
  const currentLimit = pageSizes[currentLimitIndex];
  const indexOfLast = currentPage * currentLimit;
  const indexOfFirst = indexOfLast - currentLimit;

  const router = useRouter();

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  // Handle responsive sidebar - client-side only
  useEffect(() => {
    const handleResize = () => {
      const isDesktopSize = window.innerWidth >= 1024;
      setIsDesktop(isDesktopSize);
      setIsSidebarOpen(isDesktopSize);
    };

    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  // Sidebar toggle for mobile only
  const toggleSidebar = () => {
    if (!isDesktop) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/new");
  };

  // Token check & username
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
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setPayments(data.map(p => ({ ...p, status: p.status || "Pending" })));
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => { 
    fetchPayments(); 
  }, []);

  // Modal Handlers
  const handleEdit = (id) => {
    setModalContent(<Addpayment id={id} />);
    setModalOpen(true);
  };

  const handleAddPayment = () => {
    setModalContent(<Addpayment />);
    setModalOpen(true);
    if (!isDesktop) setIsSidebarOpen(false); // Close sidebar on mobile only
  };

  const handleAdminForm = () => {
    setModalContent(<AdminContoll />);
    setModalOpen(true);
    if (!isDesktop) setIsSidebarOpen(false); // Close sidebar on mobile only
  };

  // Payment Actions
  const handleDelete = async (id, index) => {
  if (confirm(`Are you sure you want to delete payment list no = ${index + 1}?`)) {
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
      setPayments(prev => prev.map(p => p._id === id ? updatedPayment : p));
    } catch (err) {
      console.error(err);
      alert("Error closing loan, please try again.");
    }
  };

  // Pagination
  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => { 
    if (indexOfLast < filteredPayments.length) setCurrentPage(prev => prev + 1); 
  };

  // Filtering
  const filteredByType = payments.filter(p => 
    viewType === "Loan" 
      ? p.paymentType?.includes("Loan") 
      : !p.paymentType?.includes("Loan")
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

  // Download Handlers
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(currentPayments.map((p, i) => ({
      Sr: indexOfFirst + i + 1,
      PaymentType: Array.isArray(p.paymentType) ? p.paymentType.join(", ") : p.paymentType,
      Amount: p.amount,
      Note: p.note,
      Date: new Date(p.createdAt).toLocaleDateString(),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "payments.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Payments Report", 14, 22);
    const rows = currentPayments.map((p, i) => [
      indexOfFirst + i + 1,
      Array.isArray(p.paymentType) ? p.paymentType.join(", ") : p.paymentType || "",
      Number(p.amount).toLocaleString("en-IN", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }),
      p.note || "",
      new Date(p.createdAt).toLocaleDateString(),
    ]);
    autoTable(doc, { 
      startY: 30, 
      head: [["Sr.NO.", "Payment Type", "Amount", "Note", "Date"]], 
      body: rows, 
      styles: { fontSize: 10 }, 
      headStyles: { fillColor: [30, 64, 175] } 
    });
    doc.save("payments.pdf");
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:static w-[280px] h-auto min-h-screen z-50 lg:z-auto lg:translate-x-0 ${
          isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
        } flex flex-col p-6 shadow-2xl border-r ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
          {/* Mobile close button */}
          <button
            onClick={closeSidebar}
            className={`lg:hidden absolute top-4 right-4 p-2 rounded-full transition ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <FiX size={20} />
          </button>

          <div>
            <button 
              onClick={() => toggleMenu("dashboard")} 
              className={`flex items-center justify-between w-full px-3 py-2 rounded transition ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2 font-bold text-lg">
                <FiFileText size={18} /> Dashboard
              </span>
              {openMenu === "dashboard" ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            <AnimatePresence>
              {openMenu === "dashboard" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-6 mt-2 flex flex-col gap-2 overflow-hidden"
                >
                  <button 
                    onClick={() => setViewType("Regular")} 
                   
                    className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                      viewType === "Regular" 
                        ? "bg-blue-600 text-white" 
                        : isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <FiCreditCard size={16} /> Regular
                  </button>
                  <button 
                    onClick={() => setViewType("Loan")  } 
                    className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                      viewType === "Loan" 
                        ? "bg-blue-600 text-white" 
                        : isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <RiBankLine size={16} /> Loan
                  </button>
                  <Link 
                    href="/showtable" 
                   
                    className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <FiFileText size={16} /> Export PDF
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3">
            <button 
              onClick={() => toggleMenu("admin")} 

              className={`flex items-center justify-between w-full px-3 py-2 rounded transition ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2 font-bold">
                <FiSettings size={18} /> Admin Control
              </span>
              {openMenu === "admin" ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            <AnimatePresence>
              {openMenu === "admin" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-6 mt-2 flex flex-col gap-2 overflow-hidden"
                >
                  <button 
                    onClick={handleAdminForm} 
                     
                    className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <FiPlus size={16} /> Form
                  </button>
                  <div className={`px-4 py-2 rounded flex items-center gap-2 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <FiUser size={16} /> 
                    <span className="truncate">{username}</span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                      isDark ? 'hover:bg-red-800 hover:text-red-200' : 'hover:bg-red-100 hover:text-red-700'
                    }`} 
                    title="Logout"
                  >
                    <FiLogOut size={16} /> Log-Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark/Light Mode Toggle */}
          <div className="mt-auto pt-6">
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                isDark 
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              <span className="font-medium">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header with Menu Button */}
        <div className={`lg:hidden flex items-center justify-between p-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b shadow-sm`}>
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <FiMenu size={24} />
          </button>
          <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Payment Dashboard
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition ${
              isDark 
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>

        {/* Desktop Header */}
        <header className={`hidden lg:block ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        } shadow-md p-4 border-b`}>
          <div className="flex flex-wrap items-center gap-4 xl:gap-6">
            {/* Search Input */}
            <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-initial">
              <label className={`text-sm font-semibold whitespace-nowrap ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Search:
              </label>
              <input 
                type="text" 
                placeholder="Type or note..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-full lg:w-[300px] transition ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className={`text-sm font-semibold whitespace-nowrap ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Date filter:
              </label>
              <DatePicker 
                selected={startDate} 
                onChange={setStartDate} 
                selectsStart 
                startDate={startDate} 
                endDate={endDate} 
                isClearable 
                placeholderText="Start" 
                className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-28 transition ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
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
                className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm w-28 transition ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                dateFormat="yyyy-MM-dd" 
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <button 
                onClick={downloadExcel} 
                className={`px-3 lg:px-5 py-2 rounded-md shadow-md text-sm flex items-center gap-2 transition whitespace-nowrap ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-green-600 text-gray-100' 
                    : 'bg-white hover:bg-green-600 hover:text-white text-black border border-gray-300'
                }`}
              >
                <FiDownload size={18} /> 
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button 
                onClick={downloadPDF} 
                className={`px-3 lg:px-5 py-2 rounded-md shadow-md text-sm flex items-center gap-2 transition whitespace-nowrap ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-red-600 text-gray-100' 
                    : 'bg-white hover:bg-red-500 hover:text-white text-black border border-gray-300'
                }`}
              >
                <FiFileText size={18} /> 
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button 
                onClick={handleAddPayment} 
                className={`px-3 lg:px-5 py-2 rounded-md shadow-md text-sm flex items-center gap-2 transition whitespace-nowrap ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-blue-600 text-gray-100' 
                    : 'bg-white hover:bg-blue-500 hover:text-white text-black border border-gray-300'
                }`}
              >
                <FiPlus size={18} /> 
                <span className="hidden sm:inline">Add payment</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Action Bar */}
        <div className={`lg:hidden p-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b space-y-4`}>
          {/* Search */}
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Search payments..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm transition ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Date Filters */}
          <div className="grid grid-cols-2 gap-3">
            <DatePicker 
              selected={startDate} 
              onChange={setStartDate} 
              selectsStart 
              startDate={startDate} 
              endDate={endDate} 
              isClearable 
              placeholderText="Start Date" 
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm transition ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
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
              placeholderText="End Date" 
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm text-sm transition ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              dateFormat="yyyy-MM-dd" 
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={downloadExcel} 
              className={`px-3 py-2 rounded-md shadow-md text-sm flex items-center justify-center gap-2 transition ${
                isDark 
                  ? 'bg-gray-700 hover:bg-green-600 text-gray-100' 
                  : 'bg-white hover:bg-green-600 hover:text-white text-black border border-gray-300'
              }`}
            >
              <FiDownload size={16} /> Excel
            </button>
            <button 
              onClick={downloadPDF} 
              className={`px-3 py-2 rounded-md shadow-md text-sm flex items-center justify-center gap-2 transition ${
                isDark 
                  ? 'bg-gray-700 hover:bg-red-600 text-gray-100' 
                  : 'bg-white hover:bg-red-500 hover:text-white text-black border border-gray-300'
              }`}
            >
              <FiFileText size={16} /> PDF
            </button>
            <button 
              onClick={handleAddPayment} 
              className={`px-3 py-2 rounded-md shadow-md text-sm flex items-center justify-center gap-2 transition ${
                isDark 
                  ? 'bg-gray-700 hover:bg-blue-600 text-gray-100' 
                  : 'bg-white hover:bg-blue-500 hover:text-white text-black border border-gray-300'
              }`}
            >
              <FiPlus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 p-4 lg:p-8 transition-colors ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}>
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
            isDark={isDark}
          />
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            isDark={isDark}
          >
            {modalContent}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}