"use client";

import React, { useState, useEffect } from 'react'; // เพิ่ม useEffect สำหรับดึงข้อมูลผู้ใช้
import PricingCard from '@/components/PricingCard'; 
import ProfileDropdown from "@/components/ProfileDropdown"; // เปลี่ยนจาก TopUserButton เป็น ProfileDropdown

const pricingData = {
  monthly: [
    { title: 'Basic', price: '99.00 ฿', description: 'Monthly for beginners' },
    { title: 'Pro', price: '199.00 ฿', description: 'Monthly for general traders' },
    { title: 'Premium', price: '299.00 ฿', description: 'Monthly full feature set' },
  ],
  yearly: [
    { title: 'Basic', price: '990.00 ฿', description: 'Yearly (Save 17%)' },
    { title: 'Pro', price: '1,990.00 ฿', description: 'Yearly (Save 17%)' },
    { title: 'Premium', price: '2,990.00 ฿', description: 'Yearly (Save 17%)' },
  ]
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // ดึงข้อมูลราคาตาม Cycle ที่เลือก
  const currentPlans = pricingData[billingCycle];

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
              Pricing
            </h1>
            <div className="ml-auto">
              {/* เปลี่ยนมาใช้ ProfileDropdown เพื่อรองรับ Manage Account และ Logout */}
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Tab Toggle (Monthly / Yearly) */}
        <div className="mb-8 flex justify-center p-8">
          <div className="relative flex items-center rounded-full bg-slate-200 p-1 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 w-32 rounded-full py-2 text-sm font-bold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-[#8200DB] text-white shadow-md' // ใช้สีม่วงตาม Theme หลัก
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 w-32 rounded-full py-2 text-sm font-bold transition-all duration-300 ${
                billingCycle === 'yearly'
                  ? 'bg-[#8200DB] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Grid แสดงการ์ดราคา */}
        <div className="flex flex-wrap justify-center gap-8 px-8 pb-12">
          {currentPlans.map((plan, index) => (
            <PricingCard
              key={`${billingCycle}-${index}`}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              // จำลองฟังก์ชันการเลือกแผนสมาชิก
              onGetStarted={() => alert(`Redirecting to payment for ${plan.title} (${billingCycle})`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}