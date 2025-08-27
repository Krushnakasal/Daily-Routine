"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

export default function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/auth/login", data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        router.push("/home");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {/* Main Card */}
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Image */}
        <div className="w-full md:w-1/2 h-48 md:h-auto">
          <img
            src="https://plus.unsplash.com/premium_photo-1681987447977-5fed5b3caefa?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0"
            alt="Daily Routine"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Login
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <input
                {...register("username", { required: true })}
                placeholder="Username"
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 outline-none p-2 transition"
              />
              <input
                {...register("password", { required: true })}
                type="password"
                placeholder="Password"
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 outline-none p-2 transition"
              />
              <button
                type="submit"
                className="w-full p-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Login
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
