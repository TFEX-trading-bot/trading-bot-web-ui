"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** ทำให้ปุ่มกินเต็มความกว้างคอนเทนเนอร์ */
  fullWidth?: boolean;
  /** ความกว้างของปุ่ม เช่น 'w-[140px]' (ดีฟอลต์ 140px) */
  width?: string;
  /** เลือกชุดสีเกรเดียนต์ */
  gradient?: "violet" | "brand";
};

export default function GradientButton({
  className,
  fullWidth,
  width = "w-[140px]",            // ← กำหนดความกว้างเท่ากันเป็นดีฟอลต์
  gradient = "violet",            // ← เกรเดียนต์ใหม่เป็นค่าเริ่มต้น
  children,
  ...rest
}: ButtonProps) {
  const widthClass = fullWidth ? "w-full" : width;

  const gradientClass =
    gradient === "brand"
      ? "bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6]"
      : "bg-gradient-to-r from-[#9F5DD5] to-[#7D38B2]"; // ← สีใหม่

  return (
    <button
      {...rest}
      className={
        `${widthClass} rounded-full px-6 py-2.5 text-white font-semibold ` +
        `${gradientClass} ` +
        "shadow-[0_8px_18px_rgba(124,31,215,0.25)] hover:opacity-95 transition " +
        (className ?? "")
      }
    >
      {children}
    </button>
  );
}
