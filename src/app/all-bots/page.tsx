"use client";

import { useState, useEffect } from "react";
// 1. นำเข้า ProfileDropdown แทน TopUserButton
import ProfileDropdown from "@/components/ProfileDropdown"; 
import BotCard from "@/components/BotCard";

export default function AllBotsPage() {
  const [bots, setBots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllBots = async () => {
      try {
        // ดึงข้อมูลบอททั้งหมดของทุกคนในระบบสำหรับ Admin
        const response = await fetch("http://localhost:3001/api/admin/bots");
        const data = await response.json();
        setBots(data);
      } catch (error) {
        console.error("Error fetching all bots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBots();
  }, []);

  const botCount = bots.length;

  return (
    <section className="min-h-screen w-full bg-white">
      <div className="flex">
        <div className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
            <div className="flex items-center px-8 py-4">
              <h1 className="text-[30px] font-extrabold text-black">
                <span className="bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6]
                                 bg-clip-text text-transparent">
                  All Bots
                </span>
                <span className="ml-2 font-semibold text-black/60">
                  ({botCount} Bot)
                </span>
              </h1>

              <div className="ml-auto">
                {/* 2. เปลี่ยนมาใช้ ProfileDropdown ซึ่งจะแสดงเฉพาะปุ่ม Logout สำหรับ Admin */}
                <ProfileDropdown />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400 animate-pulse">
                Fetching system bots...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {bots.map((b: any, i: number) => (
                  <BotCard
                    key={`${b.id_bot}-${i}`}
                    ticker={b.ticker}
                    id={b.id_bot}
                    strategy={b.strategy}
                    // เพิ่ม Logic เพื่อให้ Admin ทราบว่าเป็นบอทของ User คนไหน
                    onClick={() => console.log("Owner User ID:", b.id_user)}
                  />
                ))}
              </div>
            )}

            {!isLoading && bots.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                No bots active in the system.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}