"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// 1. นำเข้า ProfileDropdown แทน TopUserButton
import ProfileDropdown from "@/components/ProfileDropdown"; 
import SubscriptionFormCard, {
  SubscriptionFormState,
} from "@/components/SubscriptionFormCard";

export default function EditSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subId = searchParams.get("id");

  const [form, setForm] = useState<SubscriptionFormState>({
    name: "",
    price: "",
    description: "",
    maxBot: "",
    duration: "monthly",
    planDuration: "",
  });

  const isFormValid = 
    form.name.trim() !== "" && 
    form.price.toString().trim() !== "" && 
    form.description.trim() !== "" && 
    form.maxBot.toString().trim() !== "" && 
    form.planDuration.trim() !== "";

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!subId) return;
      try {
        const response = await fetch(`http://localhost:3001/api/admin/subscription/${subId}`);
        if (response.ok) {
          const data = await response.json();
          setForm({
            name: data.name || "",
            price: data.price?.toString() || "",
            description: data.description || "",
            maxBot: data.bot_number?.toString() || "",
            duration: data.period || "monthly",
            planDuration: data.range || "",
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchSubscriptionData();
  }, [subId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subId || !isFormValid) return;

    const payload = {
      name: form.name,
      price: Number(form.price),
      bot_number: Number(form.maxBot),
      period: form.duration,
      description: form.description,
      range: form.planDuration,
    };

    try {
      const response = await fetch(`http://localhost:3001/api/admin/subscription/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // ใช้การแจ้งเตือนภาษาอังกฤษตามที่คุณต้องการ
        alert("Saved changes successfully!");
        router.push("/subscription");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error saving data");
    }
  };

  return (
    <section className="min-h-screen w-full bg-white">
      <div className="flex flex-col">
        {/* Header Area */}
        <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
          <div className="flex items-center px-8 py-4">
            <h1 className="text-[30px] font-extrabold bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6] bg-clip-text text-transparent">
              Edit Subscription
            </h1>
            <div className="ml-auto">
              {/* ระบบจะแสดงผลเฉพาะปุ่ม Logout สำหรับ Admin ตามที่คุณตั้งค่าไว้ */}
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-10 py-8 flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full space-y-10">
            <SubscriptionFormCard value={form} onChange={setForm} />

            <div className="flex justify-center gap-6 pb-12">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`min-w-[150px] rounded-[15px] py-3 text-[18px] font-bold text-white shadow-md transition-all 
                  ${isFormValid 
                    ? "bg-[#8200DB] hover:bg-[#7100BD] cursor-pointer" // ปรับสีม่วงหลัก #8200DB
                    : "bg-gray-300 cursor-not-allowed opacity-70"
                  }`}
              >
                Save
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="min-w-[150px] rounded-[15px] bg-[#8200DB] py-3 text-[18px] font-bold text-white shadow-md hover:bg-[#7100BD] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}