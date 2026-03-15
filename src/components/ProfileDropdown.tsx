"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Settings, LogOut, ChevronDown, CreditCard } from "lucide-react";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string | null>(null); // ✅ เพิ่ม state เก็บ role
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role"); // ✅ ดึงสิทธิ์จาก storage
    const savedUser = localStorage.getItem("user");

    setUserRole(storedRole); // บันทึก role ลง state

    if (storedName) {
      setUserName(storedName);
    } else if (storedUsername) {
      setUserName(storedUsername);
    } else if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.name || user.username || "User");
      } catch (error) {
        console.error("ProfileDropdown: Parse error", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("role"); // ✅ ล้าง role
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user");
    
    setIsOpen(false);
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
        <span className="font-black text-sm tracking-tight truncate max-w-[100px]">
          {userName}
        </span>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-3 z-20 w-60 origin-top-right rounded-[2rem] bg-white p-3 shadow-[0_20px_50px_rgba(106,13,173,0.15)] border border-purple-50 animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-3 mb-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
               <p className="text-sm font-bold text-[#6A0DAD] truncate">{userName}</p>
            </div>

            {/* ✅ เงื่อนไข: ถ้าไม่ใช่ admin ถึงจะแสดงเมนู Manage Account */}
            {userRole?.toLowerCase() !== "admin" && (
              <>
                <button
                  onClick={() => { router.push("/manage-account"); setIsOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-purple-50 hover:text-[#6A0DAD]"
                >
                  <Settings size={18} />
                  Account Settings
                </button>
                
                <button
                  onClick={() => { router.push("/manage-account?tab=billing"); setIsOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-purple-50 hover:text-[#6A0DAD]"
                >
                  <CreditCard size={18} />
                  Billing History
                </button>
              </>
            )}

            {userRole?.toLowerCase() !== "admin" && <div className="my-2 border-t border-slate-50"></div>}
            
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