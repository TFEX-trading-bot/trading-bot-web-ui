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

    // 🚩 1. ตรวจสอบเบื้องต้นว่ามี Token ไหม
    if (!token) {
      router.push("/");
      return;
    }

    try {
      // ✅ 2. ยิง API ไปที่ /users โดยตรง 
      // (Backend ต้องเขียนให้ API นี้เช็ค Token แล้วดูว่าคนขอเป็น Admin หรือไม่)
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ 3. กรองข้อมูลเฉพาะคนที่มี role เป็น admin (ถ้าต้องการแสดงเฉพาะ admin ในหน้านี้)
      // หรือถ้าต้องการแสดง "ทุกคน" เพื่อให้ admin จัดการ ก็ใช้ response.data ได้เลย
      setClients(response.data);
      
    } catch (err: any) {
      console.error("Fetch Clients Error:", err);
      
      // 🚩 4. ถ้า Backend ตอบกลับว่า 403 (Forbidden) แปลว่า Role ใน DB ไม่ใช่ admin
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("สิทธิ์ไม่เพียงพอ: บัญชีของคุณไม่ใช่ Admin");
        router.push("/my-bot"); // ส่งไปหน้า User ปกติ
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
        <p className="text-slate-500 font-bold">กำลังตรวจสอบสิทธิ์ Admin...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="sticky top-0 h-screen hidden md:block z-50">
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardHeader title="Admin: User Management" />

        <div className="p-10 max-w-[1600px] w-full mx-auto overflow-y-auto text-black">
          {error ? (
            <div className="flex flex-col items-center py-20 text-red-500">
              <AlertCircle size={48} className="mb-4" />
              <p className="font-bold">{error}</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold">ไม่พบข้อมูลผู้ใช้ในระบบ</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className={`group relative rounded-[2.5rem] p-8 border-2 transition-all duration-500 hover:shadow-2xl 
                    ${client.role?.toLowerCase() === 'admin' 
                      ? 'bg-amber-50 border-amber-200 hover:shadow-amber-200/50' 
                      : 'bg-[#F3E8FF] border-[#E9D5FF] hover:shadow-purple-200/50'}`}
                >
                  {/* Profile Section */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 shadow-sm flex-shrink-0
                      ${client.role?.toLowerCase() === 'admin' ? 'border-amber-500 text-amber-500' : 'border-[#A855F7] text-[#A855F7]'}`}>
                      <User size={32} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${client.role?.toLowerCase() === 'admin' ? 'text-amber-600' : 'text-[#A855F7]'}`}>
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

                  {/* Role & Status */}
                  <div className="pt-6 border-t border-white/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Shield size={10} /> Role
                        </p>
                        <div className={`inline-block px-3 py-1 text-white rounded-full text-[10px] font-black uppercase tracking-wider
                          ${client.role?.toLowerCase() === 'admin' ? 'bg-amber-500' : 'bg-[#6A0DAD]'}`}>
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