"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminContoll = () => {
  const [loading, setLoading] = useState(false);
  const [allPayments, setAllPayments] = useState([]); // raw data
  const [payments, setPayments] = useState([]); // filtered view
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { paymentType: "" },
  });

  // 🔧 helpers
  const str = (v) => String(v ?? "");
  const normalizeForCompare = (v) =>
    str(v).toLowerCase().replace(/\s+/g, "").trim();
  const normalizeHuman = (v) => {
    const s = str(v).trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  // 🔹 fetch + filter
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payments", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();

      setAllPayments(data);

      // ✅ फक्त paymentType + status असलेले आणि note === null असलेले
      const filtered = data.filter(
        (p) =>
          p.paymentType &&
          p.status === "Pending" &&
          (p.note === null || p.note === undefined)
      );

      setPayments(filtered);
    } catch (err) {
      console.error("Error fetching payments:", err);
      toast.error("Error fetching payments");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/hew");
      return;
    }
    fetchPayments();
  }, []);

  // 🔹 Add / Update payment method
  const onSubmit = async (data) => {
    const raw = str(data.paymentType);
    if (!raw.trim()) return;

    const formattedPaymentType = normalizeHuman(raw);

    const newKey = normalizeForCompare(formattedPaymentType);
    const exists = allPayments.some(
      (p) => normalizeForCompare(p.paymentType) === newKey && p._id !== editId
    );
    if (exists) {
      toast.error("This payment method already exists!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let userId = null;
      if (token) {
        const decoded = jwtDecode(token);
        userId = decoded.id;
      }

      const url = editId ? `/api/payments/${editId}` : "/api/payments";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentType: formattedPaymentType.trim(),
          userId,
        }),
      });

      if (res.ok) {
        toast.success(editId ? "Payment method updated" : "Payment method added");
        reset();
        setEditId(null);
        await fetchPayments();
      } else {
        toast.error("Failed to save payment method");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Edit handler
  const handleEdit = (payment) => {
    setValue("paymentType", str(payment.paymentType));
    setEditId(payment._id);
  };

  // 🔹 Delete handler
  const handleDelete = async (id, index) => {
    if (!confirm(`Are you sure you want to delete payment ${index + 1}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/payments?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Payment deleted");
        await fetchPayments();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting payment");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">
        {editId ? "Edit Payment Method" : "Add Payment Method"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          placeholder="Enter payment method"
          {...register("paymentType", {
            required: "Please enter a payment method",
            setValueAs: (v) => str(v),
          })}
          className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.paymentType ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.paymentType && (
          <span className="text-red-500 text-sm">
            {errors.paymentType.message}
          </span>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded transition disabled:opacity-50"
        >
          {loading
            ? editId
              ? "Updating..."
              : "Adding..."
            : editId
            ? "Update Payment Method"
            : "Add Payment Method"}
        </button>
      </form>

      {/* List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Payment Methods
        </h3>
        {payments.length === 0 ? (
          <p className="text-gray-500">No payment methods found</p>
        ) : (
          <div className="max-h-60 overflow-y-auto pr-2">
            <ul className="space-y-2">
              {payments.map((p, index) => (
                <li
                  key={p._id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded"
                >
                  <div>
                    <span className="font-medium">
                      {str(p.paymentType).trim()}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, index)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContoll;
