"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Settings, LogOut, ChevronDown } from "lucide-react";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  // ตั้งค่าเริ่มต้นเป็น "Guest" หรือ "User" จนกว่าข้อมูลจะโหลดเสร็จ
  const [userName, setUserName] = useState<string>("User"); 
  const router = useRouter();

  useEffect(() => {
    // 1. ลองดึงจากคีย์ 'username' ก่อน (ตามที่คุณ set ไว้ในหน้า Login)
    const storedUsername = localStorage.getItem("username");
    
    // 2. ลองดึงจากคีย์ 'user' (กรณีเก็บเป็น Object ในอนาคต)
    const savedUser = localStorage.getItem("user");

    if (storedUsername) {
      setUserName(storedUsername);
    } else if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.name || user.username || user.email?.split("@")[0] || "User");
      } catch (error) {
        console.error("ProfileDropdown: Parse error", error);
      }
    }
  }, []);

  const handleLogout = () => {
    // ล้างข้อมูลเพื่อความปลอดภัย
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user");
    
    setIsOpen(false);
    // ใช้ window.location เพื่อล้าง state ของแอปทั้งหมดให้กลับไปหน้าแรก
    window.location.href = "/"; 
  };

  return (
    <div className="relative inline-block text-left text-black">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full bg-[#6A0DAD] px-6 py-2.5 text-white shadow-xl shadow-purple-200 transition-all hover:bg-[#5D0CA1] hover:scale-105 active:scale-95"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
          <UserCircle size={22} strokeWidth={2.5} />
        </div>
        {/* แสดงชื่อที่ดึงมา */}
        <span className="font-black text-sm tracking-tight truncate max-w-[100px]">
          {userName}
        </span>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-3 z-20 w-60 origin-top-right rounded-[2rem] bg-white p-3 shadow-[0_20px_50px_rgba(106,13,173,0.15)] border border-purple-50 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => { router.push("/manage-account"); setIsOpen(false); }}
              className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-slate-600 transition-colors hover:bg-purple-50 hover:text-[#6A0DAD]"
            >
              <Settings size={18} />
              Manage Account
            </button>

            <div className="my-2 border-t border-slate-50"></div>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-rose-500 transition-colors hover:bg-rose-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}