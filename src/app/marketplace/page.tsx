"use client";

import React from 'react';
import PolicyCard from '@/components/PolicyCard'; 
// 1. เปลี่ยนการนำเข้าคอมโพเนนต์เป็น ProfileDropdown
import ProfileDropdown from "@/components/ProfileDropdown"; 

const policies = [
  { id: 1, name: 'Trend-Following', profit: '30.20%', users: 42 },
  { id: 2, name: 'Trend-Following', profit: '10.10%', users: 12 },
  { id: 3, name: 'Trend-Following', profit: '45.10%', users: 45 },
  { id: 4, name: 'Trend-Following', profit: '22.75%', users: 20 },
  { id: 5, name: 'Trend-Following', profit: '30.20%', users: 42 },
  { id: 6, name: 'Trend-Following', profit: '10.10%', users: 12 },
  { id: 7, name: 'Trend-Following', profit: '45.10%', users: 45 },
  { id: 8, name: 'Trend-Following', profit: '22.75%', users: 20 },
];

export default function MarketPlacePage() {
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
              Market Place
            </h1>
            <div className="ml-auto">
              {/* 2. เรียกใช้งาน ProfileDropdown เพื่อรองรับเมนู Popup ตามบทบาทผู้ใช้ */}
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Policies Grid: แสดงกลยุทธ์การเทรดที่ผู้ใช้สามารถเลือกใช้ได้ */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 p-8">
          {policies.map((policy) => (
            <PolicyCard 
              key={policy.id}
              name={policy.name}
              profit={policy.profit}
              users={policy.users}
            />
          ))}
        </div>

      </main>
    </div>
  );
}