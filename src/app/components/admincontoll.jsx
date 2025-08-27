"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {jwtDecode}  from "jwt-decode";

const AdminContoll = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paymentType: "",
    },
  });
useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/"); // ❌ Token नाही → redirect
      return;
    }
},[])
  const onSubmit = async (data) => {
    if (!data.paymentType.trim()) {
      return;
    }

    // Format the payment type: first letter capital, rest lowercase
    const formattedPaymentType =
      data.paymentType.charAt(0).toUpperCase() + data.paymentType.slice(1).toLowerCase();

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
   let userId = null;

if (token) {
  const decoded = jwtDecode(token);
  userId = decoded.id;   // ✅ JWT payload मधून id मिळाला
}
      const res = await fetch("/api/payments", {
        method: "POST",
       headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentType: formattedPaymentType,userId }),
      });

      if (res.ok) {
        alert("Payment method added successfully");
        reset();
        router.push("/new");
      } else {
        alert("Failed to add payment method");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">
        Add Payment Method
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          placeholder="Enter payment method"
          {...register("paymentType", { required: "Please enter a payment method" })}
          className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.paymentType ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.paymentType && (
          <span className="text-red-500 text-sm">{errors.paymentType.message}</span>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Payment Method"}
        </button>
      </form>
    </div>
  );
};

export default AdminContoll;
