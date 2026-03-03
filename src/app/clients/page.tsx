"use client";

import React, { useEffect, useState, useCallback } from "react";
import { User, Mail, Calendar, Shield, Loader2, AlertCircle } from "lucide-react";
import DashboardHeader from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function AdminClientPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // ✅ แก้ไข: กรองข้อมูลเพื่อเอาเฉพาะคนที่มี role เป็น 'user' เท่านั้น
      // วิธีนี้จะทำให้ ID: 6 (Admin) หายไปจากหน้าจอการจัดการลูกค้านี้
      const onlyUsers = response.data.filter(
        (client: any) => client.role?.toLowerCase() === "user"
      );

      setClients(onlyUsers);
      
    } catch (err: any) {
      console.error("Fetch Clients Error:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("สิทธิ์ไม่เพียงพอ: บัญชีของคุณไม่ใช่ Admin");
        router.push("/my-bot");
      } else {
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
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
        <p className="text-slate-500 font-bold">กำลังโหลดรายชื่อลูกค้า...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="sticky top-0 h-screen hidden md:block z-50">
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white text-black">
        <DashboardHeader title="Clients" />

        <div className="p-10 max-w-[1600px] w-full mx-auto overflow-y-auto">
          {error ? (
            <div className="flex flex-col items-center py-20 text-red-500">
              <AlertCircle size={48} className="mb-4" />
              <p className="font-bold">{error}</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold">ไม่พบข้อมูลลูกค้าในระบบ</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="group relative rounded-[2.5rem] p-8 border-2 bg-[#F3E8FF] border-[#E9D5FF] transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200/50"
                >
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-[#A855F7] text-[#A855F7] shadow-sm flex-shrink-0">
                      <User size={32} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A855F7]">
                        ID : {client.id}
                      </p>
                      <h3 className="text-xl font-black text-[#6A0DAD] truncate tracking-tight">
                        {client.name || client.username}
                      </h3>
                    </div>
                  </div>

                  <div className="mb-8 px-2">
                    <p className="text-sm text-slate-500 font-bold flex items-center gap-2 truncate">
                      <Mail size={16} className="text-[#A855F7]" /> {client.email}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Shield size={10} /> Role
                        </p>
                        <div className="inline-block px-3 py-1 text-white rounded-full text-[10px] font-black uppercase tracking-wider bg-[#6A0DAD]">
                          {client.role}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-black text-emerald-600">Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#A855F7] bg-white/50 p-3 rounded-2xl border border-white/80">
                      <Calendar size={14} />
                      Joined: {new Date(client.createdAt).toLocaleDateString('th-TH')}
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