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
      
      // Save JWT token to localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      router.push("/home");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {/* Main Card */}
      <div className="flex w-[820px] h-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden md:flex-row flex-col">
        {/* Left Image */}
        <div className="w-[400px] h-[400px]">
          <img
            src="https://plus.unsplash.com/premium_photo-1681987447977-5fed5b3caefa?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Daily Routine"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="w-[400px] h-[400px] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
                className="w-full p-3 rounded bg-white border border-gray-300 text-gray-800 hover:bg-blue-600 hover:text-white transition font-semibold"
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
