"use client";
import { UserRound } from "lucide-react";

type ClientCardProps = {
  id: string;
  name: string;
  className?: string;
  onClick?: () => void;
};

export default function ClientCard({ id, name, className, onClick }: ClientCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-5 rounded-2xl border-2 border-[#8200DB] " +
        "bg-gradient-to-r from-[#F3ECFA] to-[#E8D4FF] px-8 py-6 text-left text-[#8200DB] " +
        "shadow-[0_6px_18px_rgba(130,0,219,0.10)] transition " +
        "hover:shadow-[0_10px_22px_rgba(130,0,219,0.18)] " +
        (className ?? "")
        }

    >
      <div className="flex size-12 items-center justify-center rounded-full border-2 border-[#8200DB]">
        <UserRound className="size-7" />
      </div>

      <div className="min-w-0">
        <div className="text-md font-semibold">ID : {id}</div>
        <div className="mt-1 text-xl font-semibold leading-tight">{name}</div>
      </div>
    </button>
  );
}
