// components/ConfirmDeleteModal.tsx
"use client";

import * as React from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title = "Delete this subscription?",
  message = "This action cannot be undone. Are you sure you want to delete this subscription?",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

      {/* Modal */}
      <div
        className="
          relative w-full max-w-xl rounded-2xl border-2 border-[#8200DB]
          bg-gradient-to-br from-[#F3ECFA] to-[#E8D4FF]
          shadow-[0_18px_44px_rgba(124,31,215,0.28)]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <h3 className="text-[20px] md:text-[22px] font-extrabold text-[#8200DB] tracking-wide">
            {title}
          </h3>

          {message ? (
            <div className="mt-2 text-[15px] md:text-base text-[#6c23a7] leading-relaxed">
              {message}
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-3">
            {/* Cancel */}
            <button
              type="button"
              onClick={onCancel}
              className="
                rounded-xl border-2 border-[#8200DB] bg-white/90 px-5 py-2.5
                font-semibold text-[#8200DB] shadow-sm hover:bg-white transition
              "
            >
              {cancelText}
            </button>

            {/* Confirm */}
            <button
              type="button"
              onClick={onConfirm}
              className="
                rounded-xl border-2 border-[#8200DB]
                bg-gradient-to-r from-[#901CFA] to-[#7111B6]
                px-5 py-2.5 font-semibold text-white shadow hover:brightness-110 transition
              "
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Accent bar */}
        <div className="pointer-events-none w-full border-t border-[#8200DB]/30 rounded-b-2xl" />
      </div>
    </div>
  );
}
