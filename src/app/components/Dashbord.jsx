"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ redirect साठी
import Link from "next/link";
import { FaHome, FaUserShield } from "react-icons/fa";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
} from "recharts";
import { motion } from "framer-motion"; // ✅ Framer Motion

const sidebarStyle = {
  width: "250px",
  background: "white",
  color: "#333",
  height: "100vh",
  padding: "30px 20px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  fontFamily: "sans-serif",
  boxShadow: "6px 0 25px rgba(0,0,0,0.1)",
  borderRadius: "0 20px 20px 0",
};

const containerStyle = {
  display: "flex",
  height: "100vh",
  fontFamily: "sans-serif",
  backgroundColor: "#f8f9fd",
};

const mainContentStyle = {
  flex: 1,
  padding: "30px",
  overflowY: "auto",
};

const graphBoxStyle = {
  width: "100%",
  height: 320,
  background: "white",
  borderRadius: "20px",
  boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
  padding: 20,
  marginBottom: 40,
};

const sidebarLinks = [
  { name: "Dashboard", path: "/home", icon: <FaHome /> },
  { name: "Admincontroll", path: "/admin", icon: <FaUserShield /> },
];

const Dashboard = () => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherPayments, setOtherPayments] = useState([
    { name: "Placeholder", value: 0 },
  ]);
  const [loanStatus, setLoanStatus] = useState({ pending: 0, closed: 0 });

  // ✅ Token check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // token नसेल तर redirect
    } else {
      setIsAuth(true);
    }
    setLoading(false);
  }, [router]);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments/grafh/status-count");
      const data = await res.json();

      setLoanStatus({
        pending: Math.max((data.loan?.pending || 0) - 1, 0),
        closed: data.loan?.closed || 0,
      });

      const filteredOtherPayments = data.otherPayments.map((item) => ({
        name: Array.isArray(item.paymentType)
          ? item.paymentType.join(",")
          : item.paymentType,
        value: Math.max((item.count || 0) - 1, 0),
      }));

      setOtherPayments(filteredOtherPayments);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchPayments();
    }
  }, [isAuth]);

  if (loading) return <div>Loading...</div>;

  if (!isAuth) return null; // ❌ token नसेल तर component renderच होणार नाही

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <motion.aside
        style={sidebarStyle}
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={{ marginBottom: "40px", fontWeight: "bold", color: "#1976d2" }}>
          White Admin
        </h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {sidebarLinks.map((link, index) => (
              <motion.li
                key={index}
                style={{
                  marginBottom: 20,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: "16px",
                  padding: "10px 15px",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#e3f2fd",
                  color: "#1976d2",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span style={{ fontSize: "18px" }}>{link.icon}</span>
                <Link
                  href={link.path}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {link.name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
      </motion.aside>

      {/* Main content */}
      <main style={mainContentStyle}>
        {/* Other Payments Line Chart */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h3 style={{ marginBottom: 16, color: "#1e88e5" }}>
            Other Payments by Type
          </h3>
          <div style={{ ...graphBoxStyle, borderTop: "4px solid #1e88e5" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={otherPayments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" tick={{ fill: "#555" }} />
                <YAxis tick={{ fill: "#555" }} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#42a5f5" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#42a5f5"
                  strokeWidth={4}
                  dot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: "#fff",
                    fill: "#42a5f5",
                  }}
                  activeDot={{ r: 9, fill: "#1e88e5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Loan Payments LineBar Chart */}
        {(loanStatus.pending > 0 || loanStatus.closed > 0) && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 style={{ marginBottom: 16, color: "#ef5350" }}>
              Loan Payments Status
            </h3>
            <div style={{ ...graphBoxStyle, borderTop: "4px solid #ef5350" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[{ name: "Loans", ...loanStatus }]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barSize={45}
                  barCategoryGap="25%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="name" tick={{ fill: "#555" }} />
                  <YAxis tick={{ fill: "#555" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pending" fill="#ff7043" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="closed" fill="#26c6da" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="pending" stroke="#ff7043" strokeWidth={3} />
                  <Line type="monotone" dataKey="closed" stroke="#26c6da" strokeWidth={3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
