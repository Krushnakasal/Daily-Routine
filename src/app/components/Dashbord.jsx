"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaHome, FaUserShield } from "react-icons/fa";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS2 = ['#ff7043', '#26c6da']; // Loan payments colors

const sidebarStyle = {
  width: '300px',
  backgroundColor: '#1E90FF',
  color: 'white',
  height: '100vh',
  padding: '20px',
  boxSizing: 'border-box',
};

const containerStyle = { display: "flex", height: "100vh" };
const mainContentStyle = { flex: 1, padding: 20, backgroundColor: "#eef3fb", overflowY: "auto" };
const graphBoxStyle = { width: "100%", height: 320, background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 20, marginBottom: 40 };

const sidebarLinks = [
  { name: "Dashboard", path: "/home", icon: <FaHome /> },
  { name: "Admincontroll", path: "/admin", icon: <FaUserShield /> },
];

const Dashboard = () => {
  const [otherPayments, setOtherPayments] = useState([{ name: "Placeholder", value: 0 }]);
  const [loanStatus, setLoanStatus] = useState({ pending: 0, closed: 0 });

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments/grafh/status-count");
      const data = await res.json();

      setLoanStatus({
        // pending value 1 ने कमी केली (minimum 0 ठेवली)
        pending: Math.max((data.loan?.pending || 0) -1, 0 ),
        closed: data.loan?.closed || 0,
      });

      const filteredOtherPayments = data.otherPayments.map(item => ({
  name: Array.isArray(item.paymentType)
    ? item.paymentType.join(",")
    : item.paymentType,
  value: Math.max((item.count || 0) -1,0),
      }));

      setOtherPayments(filteredOtherPayments);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const loanPieData = [
    { name: "Pending", value: loanStatus.pending },
    { name: "Closed", value: loanStatus.closed },
  ];

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <h1 style={{ marginBottom: '40px' }}>Admin Controller</h1>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {sidebarLinks.map((link, index) => (
              <li key={index} style={{ marginBottom: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                {link.icon}
                <Link href={link.path} style={{ color: "white", textDecoration: "none" }}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main style={mainContentStyle}>
        {/* Other Payments Line Chart */}
        <h3 style={{ marginBottom: 16, color: "#1e88e5" }}>Other Payments by Type</h3>
        <div style={{ ...graphBoxStyle, borderTop: "4px solid #1e88e5" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={otherPayments}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#42a5f5" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#42a5f5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" tick={{ fill: "#555" }} />
              <YAxis tick={{ fill: "#555" }} />
              <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#42a5f5" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#colorValue)"
                strokeWidth={4}
                dot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: "#42a5f5" }}
                activeDot={{ r: 9, fill: "#1e88e5" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Payments Pie Chart */}
        {(loanStatus.pending > 0 || loanStatus.closed > 0) && (
          <>
            <h3 style={{ marginBottom: 16, color: "#ef5350" }}>Loan Payments Status</h3>
            <div style={{ ...graphBoxStyle, borderTop: "4px solid #ef5350" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanPieData}
                    cx="50%"
                    cy="50%"
                    labelLine
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {loanPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
