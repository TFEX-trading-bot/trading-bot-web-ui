"use client";

import React, { useEffect, useState, useCallback } from "react";
import { User, Mail, Calendar, Loader2, AlertCircle, Menu } from "lucide-react";
import DashboardHeader from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function AdminClientPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ 1. กรองเฉพาะ Role 'user'
      const onlyUsers = response.data.filter(
        (client: any) => client.role?.toLowerCase() === "user"
      );

      // ✅ 2. เรียงลำดับ: คนที่สร้างล่าสุด (Newest) อยู่บน, คนที่สร้างก่อน (Oldest) อยู่ล่างสุด
      const sortedUsers = onlyUsers.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setClients(sortedUsers);
      
    } catch (err: any) {
      console.error("Fetch Clients Error:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("Unauthorized: Account is not Admin");
        router.push("/");
      } else {
        setError("Failed to load data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#8200DB] mb-4" size={40} />
        <p className="text-slate-500 font-bold tracking-tight">Loading client database...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative">
      {/* Backdrop สีดำโปร่งแสงสำหรับมือถือ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Hamburger Menu Drawer สำหรับมือถือ) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white text-black">
        {/* แถบด้านบนสำหรับมือถือ พร้อมปุ่ม Hamburger Menu */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 rounded-xl bg-purple-50 text-[#8200DB] hover:bg-purple-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="ml-4 text-[24px] font-black bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6] bg-clip-text text-transparent leading-normal tracking-tight pb-1">
              Clients
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title="Clients" />
        </div>

        <div className="p-6 lg:p-10 max-w-[1800px] w-full mx-auto overflow-y-auto font-sans">
          {error ? (
            <div className="flex flex-col items-center py-20 text-red-500">
              <AlertCircle size={48} className="mb-4" />
              <p className="font-bold tracking-tight">{error}</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-black uppercase tracking-[0.2em]">
              No clients found in the system
            </div>
          ) : (
            /* Layout 4 คอลัมน์ (xl:grid-cols-4) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="group relative rounded-[2rem] p-6 border-2 bg-[#F3E8FF] border-[#E9D5FF] transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50"
                >
                  {/* Role Tag มุมขวาบน */}
                  <div className="absolute top-6 right-6">
                    <div className="px-3 py-1 text-white rounded-full text-[9px] font-black uppercase tracking-widest bg-[#6A0DAD] shadow-sm">
                      {client.role}
                    </div>
                  </div>

                  {/* Header: Avatar + Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-[#A855F7] text-[#A855F7] shadow-sm flex-shrink-0">
                      <User size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] mb-2 font-black uppercase text-[#A855F7] opacity-70 tracking-tighter">
                        ID : {client.id}
                      </p>
                      <h3 className="text-lg font-black text-[#6A0DAD] truncate pr-10 tracking-tight leading-none">
                        {client.name || client.username}
                      </h3>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-6 px-1">
                    <p className="text-xs text-slate-500 font-bold flex items-center gap-2 truncate opacity-80">
                      <Mail size={14} className="text-[#A855F7]" /> {client.email}
                    </p>
                  </div>

                  {/* Footer: Date Joined */}
                  <div className="pt-4 border-t border-white/50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#A855F7] bg-white/40 p-2.5 rounded-xl border border-white/80">
                      <Calendar size={12} />
                      <span className="opacity-70 font-black uppercase text-[9px] tracking-tighter">Joined:</span> 
                      {new Date(client.createdAt).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}