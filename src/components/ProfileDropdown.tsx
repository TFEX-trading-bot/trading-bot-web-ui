"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // ดึง Role มาเช็กเพื่อเลือกแสดงเมนู
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setRole(user.role);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // เรียก API และล้างข้อมูลเพื่อออกจากระบบ
      await fetch("http://localhost:3001/api/auth/sign-out", { method: "POST" });
      localStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* ส่วนของปุ่มโปรไฟล์สีม่วง */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full bg-[#8200DB] px-6 py-2.5 text-white shadow-lg transition-all hover:bg-[#7100BD]"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
          <UserCircle size={22} />
        </div>
        <span className="font-semibold">
          {role === 'admin' ? 'Admin User' : 'Cornellia Hubbert'}
        </span>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-3 z-20 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
            
            {/* แสดง Manage Account เฉพาะ User ทั่วไป (Client) */}
            {role !== 'admin' && (
              <>
                <button
                  onClick={() => { router.push('/profile'); setIsOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Settings size={18} className="text-gray-400" />
                  Manage Account
                </button>
                <div className="my-1 border-t border-gray-100"></div>
              </>
            )}
            
            {/* ปุ่ม Logout ที่มีทั้ง Admin และ Client */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
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