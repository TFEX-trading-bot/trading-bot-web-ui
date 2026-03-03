"use client";

import React from "react";
import ProfileDropdown from "@/components/ProfileDropdown";

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    // DashboardHeader.tsx
    <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
    <div className="flex items-center px-8 h-20"> {/* ความสูงคงที่ h-20 คือคีย์หลัก */}
        <h1 className="text-[28px] font-black bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6] bg-clip-text text-transparent leading-none tracking-tight">
        {title}
        </h1>
        <div className="ml-auto flex items-center"> {/* ใส่ flex items-center ที่นี่ด้วย */}
        <ProfileDropdown />
        </div>
    </div>
    </header>
  );
}