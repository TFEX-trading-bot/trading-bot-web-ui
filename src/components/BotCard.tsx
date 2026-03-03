"use client";

type BotCardProps = {
  ticker: string;      // เช่น "PTT"
  id: string;          // เช่น "001"
  strategy: string;    // เช่น "AI Strategy"
  onClick?: () => void;
  className?: string;
};

export default function BotCard({
  ticker, id, strategy, onClick, className,
}: BotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full rounded-[16px] border-2 border-[#8200DB] " +
        "bg-gradient-to-r from-[#F3ECFA] to-[#E8D4FF] " + // ← เปลี่ยนพื้นหลังเป็นไล่สี
        "px-8 py-6 text-left text-[#8200DB] " +
        "shadow-[0_6px_18px_rgba(130,0,219,0.10)] transition " +
        "hover:shadow-[0_10px_22px_rgba(130,0,219,0.18)] " +
        (className ?? "")
        }

    >
      {/* แถวเดียว: หุ้น + (ID + กลยุทธ์) วางถัดกัน */}
      <div className="flex items-center gap-8">
        {/* ตัวย่อหุ้น */}
        <div className="shrink-0 text-[24px] md:text-[26px] font-extrabold tracking-wide">
          {ticker}
        </div>

        {/* คอลัมน์ขวา: ID + กลยุทธ์ (ชิดซ้าย) */}
        <div className="min-w-0">
          <div className="text-md font-semibold ">ID : {id}</div>
          <div className="mt-1 text-base md:text-[20px] font-semibold leading-tight truncate">
            {strategy}
          </div>
        </div>
      </div>
    </button>
  );
}
