"use client";

import * as React from "react";

export type SubscriptionFormState = {
  name: string;
  price: string;
  description: string;
  maxBot: string;
  planDuration: string;
  duration: "monthly" | "yearly";
};

type Props = {
  value: SubscriptionFormState;
  onChange: (next: SubscriptionFormState) => void;
  className?: string;
};

export default function SubscriptionFormCard({ value, onChange, className }: Props) {
  const set =
    (k: keyof SubscriptionFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [k]: e.target.value });

  return (
    <div
      className={
        "w-full max-w-[1000px] mx-auto " +
        "rounded-[25px] border border-black/10 bg-white p-8 md:p-12 shadow-sm " +
        (className ?? "")
      }
    >
      {/* Grid ส่วนบน: Name, Price, Description, Max Bot, Plan Duration */}
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-[20px] font-bold text-gray-800">Name</label>
          <input
            value={value.name}
            onChange={set("name")}
            className="w-full rounded-xl bg-[#E8EBF0] px-5 py-3.5 outline-none font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[20px] font-bold text-gray-800">Price</label>
          <input
            value={value.price}
            onChange={set("price")}
            className="w-full rounded-xl bg-[#E8EBF0] px-5 py-3.5 outline-none font-medium"
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[20px] font-bold text-gray-800">Description</label>
          <textarea
            value={value.description}
            onChange={set("description")}
            rows={5}
            className="w-full resize-none rounded-xl bg-[#E8EBF0] px-5 py-4 outline-none font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[20px] font-bold text-gray-800">Max Bot</label>
          <input
            value={value.maxBot}
            onChange={set("maxBot")}
            className="w-full rounded-xl bg-[#E8EBF0] px-5 py-3.5 outline-none font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[20px] font-bold text-gray-800">Plan Duration</label>
          <input
            value={value.planDuration}
            onChange={set("planDuration")}
            className="w-full rounded-xl bg-[#E8EBF0] px-5 py-3.5 outline-none font-medium"
          />
        </div>
      </div>

      {/* ⬇️ ส่วน Duration: เอาเส้นคั่นออก, คำว่า Duration ชิดซ้ายเท่า Max Bot, ปุ่มกดอยู่กึ่งกลางบรรทัดถัดไป */}
      <div className="mt-8 flex flex-col gap-6">
        {/* หัวข้อชิดซ้ายตรงกับ Label ด้านบน */}
        <span className="text-[20px] font-bold text-gray-800">Duration</span>
        
        {/* กลุ่มปุ่มเลือกจัดวางไว้กึ่งกลาง */}
        <div className="flex items-center justify-center gap-16 md:gap-32">
          {/* Monthly */}
          <label className="flex cursor-pointer items-center gap-4 group">
            <input
              type="radio"
              name="duration"
              value="monthly"
              checked={value.duration === "monthly"}
              onChange={() => onChange({ ...value, duration: "monthly" })}
              className="size-7 cursor-pointer accent-[#7E22CE]" 
            />
            <span className="text-[20px] font-bold text-gray-700 group-hover:text-[#7E22CE] transition-colors">
              Monthly
            </span>
          </label>

          {/* Yearly */}
          <label className="flex cursor-pointer items-center gap-4 group">
            <input
              type="radio"
              name="duration"
              value="yearly"
              checked={value.duration === "yearly"}
              onChange={() => onChange({ ...value, duration: "yearly" })}
              className="size-7 cursor-pointer accent-[#7E22CE]"
            />
            <span className="text-[20px] font-bold text-gray-700 group-hover:text-[#7E22CE] transition-colors">
              Yearly
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}