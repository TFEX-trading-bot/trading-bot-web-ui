// components/StrategyCard.tsx
import { X, SquarePen } from "lucide-react";
import * as React from "react";

type Props = {
  title: string;
  onRemove?: () => void;
  className?: string;
};

export default function StrategyCard({ title, onRemove, className }: Props) {
  return (
    <button
      type="button"
      className={
        "group relative flex h-[100px] w-full items-center justify-between rounded-[12px] " +
        "border-2 border-[#8200DB] bg-gradient-to-r from-[#F3ECFA] to-[#E8D4FF] px-7 " +
        "shadow-[0_8px_22px_rgba(124,31,215,0.12)] transition " +
        "hover:shadow-[0_12px_26px_rgba(124,31,215,0.16)] " +
        (className ?? "")
      }
    >
      <span className="text-[20px] font-semibold text-[#8200DB]">
        {title}
      </span>

      {/* ไอคอนชิดกันทางขวา */}
      <div className="flex items-center -space-x-1"> {/* CHANGED: gap-1 ให้ชิดขึ้น */}
        {/* SquarePen: แสดงไอคอนอย่างเดียว ยังไม่ทำให้กดได้ */}
        <span
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg p-1.5 text-[#8200DB]"  /* CHANGED: p-1.5 เพื่อลดช่องว่างรอบไอคอน */
        >
          <SquarePen className="size-6 md:size-7" />            {/* CHANGED: คง size-6 ให้บาลานซ์ */}
        </span>

        {/* ปุ่มลบ (เดิม) */}
        <span
          role="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="rounded-lg p-1.5 text-[#8200DB] transition group-hover:rotate-90" /* CHANGED: p-1.5 ให้เท่ากัน */
        >
          <X className="size-6 md:size-7" />                    {/* CHANGED: คง size-6 ให้เท่ากัน */}
        </span>
      </div>
    </button>
  );
}
