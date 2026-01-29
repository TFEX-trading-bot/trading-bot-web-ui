"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// 1. เปลี่ยนมาใช้ ProfileDropdown แทน TopUserButton
import ProfileDropdown from "@/components/ProfileDropdown"; 
import SubscriptionCard from "@/components/SubscriptionCard";
import AddSubscriptionCard from "@/components/AddSubscriptionCard";

interface SubscriptionItem {
  id_subscription: string;
  name: string;
  price: number;
  bot_number: number;
  period: string;
  range: string;
  createdAt?: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันคำนวณช่วงวันที่ (DD/MM/YYYY)
  const calculateDateRange = (createdAt?: string, daysStr?: string) => {
    if (!createdAt || !daysStr) return "N/A";
    const startDate = new Date(createdAt);
    const days = parseInt(daysStr) || 0;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days);

    const formatDate = (date: Date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/subscription");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleRemove = async (id: string) => {
    // เพิ่มการยืนยันเป็นภาษาอังกฤษก่อนลบ
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/subscription/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id_subscription !== id));
        alert("Subscription plan removed successfully."); // แจ้งเตือนภาษาอังกฤษ
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <section className="min-h-screen w-full bg-white">
      <div className="flex">
        <div className="flex-1">
          {/* Header Area */}
          <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
            <div className="flex items-center px-8 py-4">
              <h1 className="text-[30px] font-extrabold bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6] bg-clip-text text-transparent">
                Subscription
              </h1>
              <div className="ml-auto">
                {/* 2. เรียกใช้งาน ProfileDropdown ซึ่งจะตรวจสอบสิทธิ์ Admin อัตโนมัติ */}
                <ProfileDropdown />
              </div>
            </div>
          </div>

          {/* Grid Area: แสดงผลแผนสมาชิกทั้งหมด */}
          <div className="px-8 py-8">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400 animate-pulse">
                Loading Subscriptions...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((s) => (
                  <SubscriptionCard
                    key={s.id_subscription}
                    id={s.id_subscription}
                    name={s.name} 
                    price={`฿${s.price.toLocaleString()}`}
                    period={s.period}
                    range={calculateDateRange(s.createdAt, s.range)} 
                    onEdit={() => router.push(`/edit-subscription?id=${s.id_subscription}`)}
                    onRemove={() => handleRemove(s.id_subscription)}
                  />
                ))}
                {/* ปุ่มเพิ่มแผนสมาชิกใหม่ */}
                <AddSubscriptionCard onClick={() => router.push("/add-new-subscription")} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}