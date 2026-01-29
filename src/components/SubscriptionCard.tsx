"use client";

import { useState } from "react";
import { SquarePen, X } from "lucide-react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

type Props = {
  id: string;
  name: string;    // << เพิ่ม prop name
  price: string;
  period: string;
  range: string;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
};

export default function SubscriptionCard({
  id,
  name,            // << รับค่า name
  price,
  period,
  range,
  onEdit,
  onRemove,
  className,
}: Props) {
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <>
      <div
        className={
          "relative rounded-[14px] md:rounded-[16px] border-2 border-[#8200DB] " +
          "bg-gradient-to-r from-[#F3ECFA] to-[#E8D4FF] px-4 py-4 md:px-6 md:py-5 " +
          "text-[#8200DB] shadow-[0_6px_18px_rgba(130,0,219,0.10)] " +
          "flex flex-col justify-between " + // ช่วยให้การจัดวางแนวตั้งสมดุล
          (className ?? "")
        }
      >
        {/* แถวบน: ID + ปุ่มจัดการ */}
        <div className="flex items-center mb-1">
          <div className="text-[14px] md:text-[15px] font-bold opacity-80 tracking-wider">
            ID : {id}
          </div>

          <div className="ml-auto flex items-center -space-x-1">
            <button
              type="button"
              onClick={onEdit}
              className="p-1 md:p-1.5 hover:scale-110 transition-transform disabled:opacity-40"
              disabled={!onEdit}
              title="Edit subscription"
            >
              <SquarePen className="size-5 md:size-6" />
            </button>

            <button
              type="button"
              onClick={() => setOpenConfirm(true)}
              className="p-1 md:p-1.5 hover:scale-110 hover:text-red-500 transition-all"
              title="Delete subscription"
            >
              <X className="size-6 md:size-7" />
            </button>
          </div>
        </div>

        {/* ส่วนเนื้อหาหลัก: Name + Price */}
        <div className="flex flex-col">
          {/* 1. Name (อยู่เหนือราคา) */}
          <div className="text-[16px] md:text-[18px] font-semibold opacity-90 leading-tight mb-0.5">
            {name}
          </div>

          {/* 2. ราคา + Period */}
          <div
            className="
              font-extrabold leading-tight
              text-[clamp(24px,5vw,32px)] md:text-[32px]
              flex items-baseline gap-x-2
            "
          >
            <span className="min-w-0 break-words">{price}</span>
            <span
              className="
                flex-none whitespace-nowrap
                text-[clamp(14px,3vw,18px)] md:text-lg
                font-bold opacity-80
              "
            >
              / {period}
            </span>
          </div>
        </div>

        {/* ส่วนล่าง: ช่วงวันที่ หรือ รายละเอียดเพิ่มเติม */}
        <div className="mt-3 pt-2 border-t border-[#8200DB]/10 font-medium tracking-wide opacity-80 text-xs md:text-sm italic">
          {range}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={openConfirm}
        title="Delete this subscription?"
        message={
          <>
            This action cannot be undone. Are you sure you want to delete
            <span className="font-bold text-[#8200DB]"> {name} </span> 
            (ID: {id})?
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() => {
          setOpenConfirm(false);
          onRemove?.();
        }}
      />
    </>
  );
}