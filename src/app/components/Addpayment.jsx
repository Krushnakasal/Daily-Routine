"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Addpayment = ({ id }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paymentType: "",
      amount: "",
      note: "",
    },
  });

  // ✅ Token check (unauthorized -> redirect)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  // ✅ Fetch existing payment if editing
  useEffect(() => {
    if (id) {
      const fetchPayment = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/payments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const payment = await res.json();
          setValue("paymentType", payment.paymentType);
          setValue("amount", payment.amount);
          setValue("note", payment.note || "");
          setIsEditing(true);
        } else {
          console.error("Failed to fetch payment:", res.status);
        }

        setLoading(false);
      };

      fetchPayment();
    }
  }, [id, setValue]);

  // ✅ Fetch all unique paymentTypes for logged-in user
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const payments = await res.json();

          // ✅ unique + cleaned types
          const uniqueTypes = [
            ...new Set(
              (payments || [])
                .flatMap((p) => p.paymentType)
                .filter((t) => typeof t === "string" && t.trim() !== "")
                .map((t) => t.trim())
            ),
          ];
          setPaymentTypes(uniqueTypes);
        } else {
          setPaymentTypes([]);
        }
      } catch (err) {
        console.error("Error fetching payment types:", err);
        setPaymentTypes([]);
      }
    };

    fetchPaymentTypes();
  }, []);

  // ✅ Helper for capitalizing
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // ✅ Submit handler
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    let userId = null;

    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    }

    try {
      if (isEditing) {
        await fetch(`/api/payments/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data, userId }),
        });
        toast.success("✅ Payment updated successfully");
      } else {
        await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data, userId }),
        });
        toast.success("✅ Payment added successfully");
      }

      setTimeout(() => {
        router.push(`/home`);
      }, 1200);
    } catch (err) {
      toast.error("❌ Something went wrong!");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        {isEditing ? "Edit Payment" : "Add Payment"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Payment Type */}
        <div>
          <select
            {...register("paymentType", {
              required: "Payment Type is required",
            })}
            className={`w-full px-4 py-3 border rounded ${
              errors.paymentType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Payment Type</option>
            {paymentTypes.map((type, i) => (
              <option key={i} value={type}>
                {capitalize(type)}
              </option>
            ))}
          </select>
          {errors.paymentType && (
            <span className="text-red-500 text-sm">
              {errors.paymentType.message}
            </span>
          )}
        </div>

        {/* Amount */}
        <div>
          <input
            type="text"
            placeholder="Amount"
            {...register("amount", {
              required: "Amount is required",
              pattern: {
                value: /^\d{1,9}(\.\d{1,2})?$/,
                message: "Amount must be max 9 digits and up to 2 decimals",
              },
            })}
            className={`w-full px-4 py-3 border rounded ${
              errors.amount ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.amount && (
            <span className="text-red-500 text-sm">
              {errors.amount.message}
            </span>
          )}
        </div>

        {/* Note */}
        <div>
          <textarea
            placeholder="Note (optional, max 250 chars)"
            {...register("note", {
              maxLength: {
                value: 250,
                message: "Note cannot exceed 250 characters",
              },
            })}
            className={`w-full px-4 py-3 border rounded ${
              errors.note ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
          />
          {errors.note && (
            <span className="text-red-500 text-sm">{errors.note.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {isEditing ? "Update" : "Submit"}
        </button>
      </form>

      {/* Toastify container */}
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default Addpayment;
