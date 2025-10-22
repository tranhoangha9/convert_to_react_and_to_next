"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header/page";
import Footer from "./Footer/page";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}
