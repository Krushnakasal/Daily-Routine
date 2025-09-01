"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  FiSun,
  FiHome,
  FiBarChart,
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
  FiDatabase
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

import Addpayment from "./Addpayment";
import AdminContoll from "./admincontoll";

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, paymentIndex, isDark }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md p-6`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Delete Payment
          </h3>
          
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-6`}>
            Are you sure you want to delete payment list no. <span className="font-semibold text-red-600">{paymentIndex}</span>? 
            This action cannot be undone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children, isDark }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, index: null });

  const pageSizes = [10, 20, 30];
  const currentLimit = pageSizes[currentLimitIndex];
  const indexOfLast = currentPage * currentLimit;
  const indexOfFirst = indexOfLast - currentLimit;

  const router = useRouter();

  // Toast configuration based on theme
  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: isDark ? "dark" : "light",
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    toast.success(`Switched to ${!isDark ? 'dark' : 'light'} mode`, toastConfig);
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
    toast.success("Logged out successfully", toastConfig);
    setTimeout(() => router.push("/new"), 1000);
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
      toast.error("Session expired. Please login again.", toastConfig);
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
      toast.error("Failed to load payments", toastConfig);
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
    if (!isDesktop) setIsSidebarOpen(false);
  };

  const handleAdminForm = () => {
    setModalContent(<AdminContoll />);
    setModalOpen(true);
    if (!isDesktop) setIsSidebarOpen(false);
  };

  // Delete with confirmation
  const handleDelete = (id, index) => {
    setDeleteModal({ isOpen: true, id, index: index + 1 });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/payments?id=${deleteModal.id}`, { method: "DELETE" });
      
      if (response.ok) {
        await fetchPayments();
        toast.success(`Payment list no. ${deleteModal.index} deleted successfully`, toastConfig);
      } else {
        toast.error("Failed to delete payment", toastConfig);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error occurred while deleting", toastConfig);
    } finally {
      setDeleteModal({ isOpen: false, id: null, index: null });
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
      toast.success("Loan closed successfully", toastConfig);
    } catch (err) {
      console.error(err);
      toast.error("Error closing loan, please try again", toastConfig);
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
    try {
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
      toast.success("Excel file downloaded successfully", toastConfig);
    } catch (error) {
      toast.error("Failed to download Excel file", toastConfig);
    }
  };

  const downloadPDF = () => {
    try {
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
      toast.success("PDF file downloaded successfully", toastConfig);
    } catch (error) {
      toast.error("Failed to download PDF file", toastConfig);
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Toast Container */}
      <ToastContainer {...toastConfig} />
      
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

      {/* Enhanced Sidebar */}
      <motion.aside 
        initial={{ x: -320 }}
        animate={{ x: isSidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:static w-[320px] h-auto min-h-screen z-50 lg:z-auto lg:translate-x-0 ${
          isDark ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-800'
        } flex flex-col shadow-2xl border-r ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        {/* Header Section */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} flex items-center justify-center`}>
                <FiDollarSign className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-lg">Payment Manager</h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Financial Dashboard</p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={closeSidebar}
              className={`lg:hidden p-2 rounded-full transition ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-2">
          {/* Quick Stats */}
          <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} backdrop-blur`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-600/50' : 'bg-blue-50'}`}>
                <FiTrendingUp className={`${isDark ? 'text-green-400' : 'text-green-600'} mb-1`} size={16} />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                <p className="font-bold">{filteredPayments.length}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-600/50' : 'bg-purple-50'}`}>
                <FiPieChart className={`${isDark ? 'text-purple-400' : 'text-purple-600'} mb-1`} size={16} />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</p>
                <p className="font-bold">{viewType}</p>
              </div>
            </div>
          </div>

          {/* Dashboard Menu */}
          <div className="mb-4">
            <button 
              onClick={() => toggleMenu("dashboard")} 
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                isDark ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'
              } group`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                  <FiHome size={16} className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                Dashboard
              </span>
              <motion.div
                animate={{ rotate: openMenu === "dashboard" ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown size={16} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openMenu === "dashboard" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 mt-2 space-y-1 overflow-hidden"
                >
                  <button 
                    onClick={() => setViewType("Regular")} 
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                      viewType === "Regular" 
                        ? `${isDark ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-blue-500 to-blue-600'} text-white shadow-lg` 
                        : isDark ? "hover:bg-gray-700/50" : "hover:bg-white/50"
                    }`}
                  >
                    <FiCreditCard size={16} /> 
                    <span>Regular Payments</span>
                    {viewType === "Regular" && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                  </button>
                  
                  <button 
                    onClick={() => setViewType("Loan")} 
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                      viewType === "Loan" 
                        ? `${isDark ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white shadow-lg` 
                        : isDark ? "hover:bg-gray-700/50" : "hover:bg-white/50"
                    }`}
                  >
                    <RiBankLine size={16} /> 
                    <span>Loan Payments</span>
                    {viewType === "Loan" && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                  </button>
                  
                  <Link 
                    href="/showtable" 
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                      isDark ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'
                    }`}
                  >
                    <FiFileText size={16} /> 
                    <span>Export Reports</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Control */}
          <div className="mb-4">
            <button 
              onClick={() => toggleMenu("admin")} 
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                isDark ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'
              } group`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
                  <FiSettings size={16} className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                Admin Control
              </span>
              <motion.div
                animate={{ rotate: openMenu === "admin" ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown size={16} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openMenu === "admin" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 mt-2 space-y-1 overflow-hidden"
                >
                  <button 
                    onClick={handleAdminForm} 
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                      isDark ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'
                    }`}
                  >
                    <FiPlus size={16} /> 
                    <span>Admin Form</span>
                  </button>
                  
                  <div className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
                    isDark ? 'bg-gray-700/30' : 'bg-gray-100/50'
                  }`}>
                    <div className={`p-1.5 rounded-full ${isDark ? 'bg-green-600/20' : 'bg-green-100'}`}>
                      <FiUser size={14} className={`${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{username}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleLogout} 
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                      isDark ? 'hover:bg-red-700/20 hover:text-red-300' : 'hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <FiLogOut size={16} /> 
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analytics Section */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10' : 'bg-gradient-to-r from-indigo-50 to-purple-50'} border ${isDark ? 'border-indigo-500/20' : 'border-indigo-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <FiBarChart size={16} className={`${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className="font-semibold text-sm">Analytics</span>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
              Track your financial data
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This Month</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                +12%
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Theme Toggle */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isDark 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg' 
                : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg'
            }`}
          >
            <motion.div
              animate={{ rotate: isDark ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </motion.div>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <DeleteConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
            onConfirm={confirmDelete}
            paymentIndex={deleteModal.index}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

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