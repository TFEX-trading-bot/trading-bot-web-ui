"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// 1. นำเข้า ProfileDropdown เพื่อให้แอดมินสามารถกด Logout ได้จากหน้านี้
import ProfileDropdown from "@/components/ProfileDropdown"; 
import SubscriptionFormCard, {
  SubscriptionFormState,
} from "@/components/SubscriptionFormCard";

export default function AddSubscriptionPage() {
  const router = useRouter();
  
  const [form, setForm] = useState<SubscriptionFormState>({
    name: "",
    price: "",
    description: "",
    maxBot: "",
    planDuration: "",
    duration: "monthly",
  });

  const isFormValid = 
    form.name.trim() !== "" && 
    form.price.trim() !== "" && 
    form.description.trim() !== "" && 
    form.maxBot.trim() !== "" && 
    form.planDuration.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      name: form.name,
      price: Number(form.price),
      bot_number: Number(form.maxBot),
      period: form.duration,
      description: form.description,
      range: form.planDuration,
      id_subscription: `sub_${Math.floor(Math.random() * 1000)}`, 
    };

    try {
      const response = await fetch("http://localhost:3001/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // ใช้การแจ้งเตือนภาษาอังกฤษตามมาตรฐานของระบบที่คุณต้องการ
        alert("Subscription plan added successfully!"); 
        router.push("/subscription"); // กลับไปหน้าจัดการแผนสมาชิก
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Unable to add subscription plan."}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("System Error: Unable to connect to the server.");
    }
  };

  return (
    <section className="min-h-screen w-full bg-white">
      <div className="flex flex-col">
        {/* Header Area */}
        <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
          <div className="flex items-center px-8 py-4">
            <h1 className="text-[30px] font-extrabold bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6] bg-clip-text text-transparent">
              Add New Subscription
            </h1>
            <div className="ml-auto">
              {/* เรียกใช้งาน ProfileDropdown ซึ่งจะตรวจสอบสิทธิ์ Admin อัตโนมัติ */}
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
                    ? "bg-[#8200DB] hover:bg-[#7100BD] cursor-pointer" // ใช้สีม่วงหลัก #8200DB
                    : "bg-gray-300 cursor-not-allowed opacity-70"
                  }`}
              >
                Create
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