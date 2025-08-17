"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Addpayment = ({ id }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paymentType: "",
      amount: "",
      note: "",
    },
  });

  const formDataWatch = watch();

  useEffect(() => {
    const fetchPaymentTypes = async () => {
      setLoading(true);
      const res = await fetch("/api/payments");
      const data = await res.json();

      const allTypes = data.flatMap((p) =>
        Array.isArray(p.paymentType) ? p.paymentType : [p.paymentType]
      );
      const uniqueTypes = Array.from(new Set(allTypes));
      setPaymentTypes(uniqueTypes);
      setLoading(false);
    };

    fetchPaymentTypes();

    if (id) {
      const fetchPayment = async () => {
        setLoading(true);
        const res = await fetch(`/api/payments/${id}`);
        if (res.ok) {
          const payment = await res.json();
          setValue("paymentType", payment.paymentType);
          setValue("amount", payment.amount);
          setValue("note", payment.note || "");
          setIsEditing(true);
        }
        setLoading(false);
      };

      fetchPayment();
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    if (isEditing) {
      await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      alert("Payment updated");
      router.push(`/home`);
    } else {
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      alert("Payment added");
      router.push(`/home`);
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
            {...register("paymentType", { required: "Payment Type is required" })}
            className={`w-full px-4 py-3 border rounded ${
              errors.paymentType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Payment Type</option>
            {paymentTypes.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.paymentType && (
            <span className="text-red-500 text-sm">{errors.paymentType.message}</span>
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
          {errors.amount && <span className="text-red-500 text-sm">{errors.amount.message}</span>}
        </div>

        {/* Note */}
        <div>
          <textarea
            placeholder="Note (optional, max 250 chars)"
            {...register("note", {
              maxLength: { value: 250, message: "Note cannot exceed 250 characters" },
            })}
            className={`w-full px-4 py-3 border rounded ${
              errors.note ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
          />
          {errors.note && <span className="text-red-500 text-sm">{errors.note.message}</span>}
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {isEditing ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Addpayment;
