import React, { useState } from "react";
import { useLang } from "@/contexts/LangContext";

export default function EditDescriptionModal({ open, onClose, initialValue = "", onSave }) {
  const [description, setDescription] = useState(initialValue);
  const [error, setError] = useState("");
  const { messages } = useLang();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim().length < 100) {
      setError(messages['descriptioncharactersError']);
      return;
    }
    onSave(description);
    onClose();
  };

  // Reset when modal opens
  React.useEffect(() => {
    if (open) {
      setDescription(initialValue);
      setError("");
    }
  }, [open, initialValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{messages['editdescriptionTitle']}</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[100px]"
            value={description}
            onChange={e => {
              setDescription(e.target.value);
              if (error && e.target.value.trim().length >= 100) setError("");
            }}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
            >
              {messages['cancelTitle']}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#206645] text-white font-semibold"
            >
              {messages['saveTitle']}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
