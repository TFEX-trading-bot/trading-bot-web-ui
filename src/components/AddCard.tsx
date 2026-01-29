// components/AddCard.tsx
import { Plus } from "lucide-react";
import * as React from "react";

type Props = {
  onClick?: () => void;
  className?: string;
};

export default function AddCard({ onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex h-[100px] w-full items-center justify-center rounded-[12px] " +
        "border-2 border-dashed border-[#8200DB] bg-[#EDDDFF] px-7 text-[#8200DB] " +
        "shadow-[0_6px_18px_rgba(124,31,215,0.10)] transition " +
        "hover:border-[#7C1FD7] hover:shadow-[0_10px_22px_rgba(124,31,215,0.14)] " +
        (className ?? "")
      }
    >
      <Plus className="size-8" />
    </button>
  );
}
