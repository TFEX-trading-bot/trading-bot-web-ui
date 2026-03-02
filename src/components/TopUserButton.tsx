// components/TopUserButton.tsx
import { User2, ChevronDown } from "lucide-react";
import * as React from "react";

type Props = {
  name: string;
  onClick?: () => void;
  className?: string;
};

export default function TopUserButton({ name, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-3 rounded-full " +
        "bg-[linear-gradient(135deg,#7C1FD7,#6E11B0)] " +
        "px-5 py-3 text-base font-medium text-white " +
        "shadow-[0_6px_16px_rgba(110,17,176,.28)] hover:brightness-105 " +
        (className ?? "")
      }
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
        <User2 className="size-6" />
      </span>
      <span className="pr-1">{name}</span>
      <ChevronDown className="size-6 opacity-90" />
    </button>
  );
}
