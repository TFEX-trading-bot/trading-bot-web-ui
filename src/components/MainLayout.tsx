"use client";

import { usePathname } from "next/navigation";
import Client_Sidebar from "@/components/Client_Sidebar";
import Admin_Sidebar from "@/components/Admin_Sidebar";
import { useState, useEffect } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // อ่านค่า Role จาก localStorage เพื่อสลับ Sidebar ตามสิทธิ์
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setRole(user.role);
    }
  }, [pathname]);

  // กำหนดเส้นทางที่ไม่ต้องการให้แสดง Sidebar
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="flex min-h-screen">
      {/* แสดง Sidebar เฉพาะเมื่อไม่ใช่หน้า Login/Register */}
      {!isAuthPage && (
        role === "admin" ? <Admin_Sidebar /> : <Client_Sidebar />
      )}

      {/* ถ้าเป็นหน้า Auth ให้เอา padding (p-6) ออก เพื่อให้คอนเทนต์อยู่กึ่งกลางหน้าจอได้เป๊ะตามดีไซน์ */}
      <main className={`flex-1 ${isAuthPage ? "" : "p-6"}`}>
        {children}
      </main>
    </div>
  );
}