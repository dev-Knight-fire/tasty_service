import React from "react";
import { useLang } from "@/contexts/LangContext";

export default function DeleteConfirmModal({ open, onClose, onConfirm }) {
  const { messages } = useLang();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
        <h2 className="text-lg font-semibold mb-4">{messages['deletereviewTitle']}</h2>
        <p className="mb-6">{messages['deletereviewContent']}</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onClose}>
            {messages['cancelTitle']}
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {messages['deleteTitle']}
          </button>
        </div>
      </div>
    </div>
  );
}
