"use client"; // पहिल्या ओळीत

import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashbord from "./components/Dashbord";



export default function AppRoutes() {
  return (
   <>
   {/* <Navbar/> */}
   <Dashbord/>
   </>
  );
}
