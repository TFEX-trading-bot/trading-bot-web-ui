"use client";

import React, { useState, useEffect } from 'react'
import BotDisplayCard from '@/components/BotDisplayCard'
import AddBotCard from '@/components/AddBotCard'
// 1. เปลี่ยนการ Import จาก TopUserButton เป็น ProfileDropdown
import ProfileDropdown from "@/components/ProfileDropdown"; 

export default function MyBotPage() {
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // ดึงชื่อจาก Email มาแสดงผลเบื้องต้น
      setUserName(user.email.split('@')[0] || "Cornellia Hubbert"); 
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-800">
      <main className="flex flex-col w-full bg-white">
        
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
          <div className="flex items-center px-8 py-4">
            <h1
                className="text-[30px] font-extrabold 
                bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6]
                bg-clip-text text-transparent"
            >
                My Bot
            </h1>
            <div className="ml-auto">
                {/* 2. เปลี่ยนมาใช้ ProfileDropdown เพื่อให้กดแล้วมีเมนู Popup */}
                <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Grid Layout: แสดงรายการบอทที่มีอยู่ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 p-8">
          <BotDisplayCard
            name="PTT"
            price={155.77}
            change="+1.27"
            changePct="1.20%"
            currency="THB"
            variant="green"
            botKind="ai"
          />

          <BotDisplayCard
            name="PTT"
            price={155.77}
            change="-1.27"
            changePct="1.20%"
            currency="THB"
            variant="red"
            botKind="ai"
          />

          <BotDisplayCard
            name="PTT"
            price={155.77}
            change="+1.27"
            changePct="1.20%"
            currency="THB"
            variant="green"
            botKind="manual"
          />

          <BotDisplayCard
            name="PTT"
            price={155.77}
            change="0.00"
            changePct="0.00%"
            currency="THB"
            variant="gray"
            botKind="manual"
          />
          
          <AddBotCard />
        </div>
      </main>
    </div>
  )
}