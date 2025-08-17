"use client";

import React from "react";
import Addpayment from "../../components/Addpayment";

export default function EditPaymentPage({ params }) {
  // React.use() वापरून params unwrap करा
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  return <Addpayment id={id} />;
}
