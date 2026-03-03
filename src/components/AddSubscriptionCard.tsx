import { Plus } from "lucide-react";

export default function AddSubscriptionCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full items-center justify-center rounded-[16px]
        /* ปรับความสูงให้สัมพันธ์กับการ์ดหลัก (ประมาณ 180px - 200px ตามเนื้อหาในรูป) */
        min-h-[190px] md:min-h-[210px] 
        border-2 border-dashed border-[#8200DB]
        bg-[#F3ECFA]/80 text-[#8200DB]
        shadow-[0_6px_18px_rgba(130,0,219,0.10)]
        transition-all duration-200
        hover:bg-[#E8D4FF] hover:border-[#7C1FD7] 
        hover:shadow-[0_10px_22px_rgba(124,31,215,0.14)]
        group
      "
    >
      <div className="flex flex-col items-center gap-2">
        <Plus className="size-10 transition-transform group-hover:scale-110" />
        <span className="text-sm font-bold opacity-80">Add New Subscription</span>
      </div>
    </button>
  );
}