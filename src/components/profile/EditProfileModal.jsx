import React, { useState, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";

// Simple phone and email validators
function isValidPhone(phone) {
  return /^(\+?\d{1,4}[\s-]?)?(\d{9,15})$/.test(phone.replace(/\s/g, ""));
}
function isValidEmail(email) {
  // Basic email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EditProfileModal({ open, onClose, initialValues = {}, onSave }) {
  const { messages } = useLang();
  const [fields, setFields] = useState({
    city: "",
    address: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFields({
        city: initialValues.city || "",
        address: initialValues.address || "",
        phone: initialValues.phone || "",
        email: initialValues.email || "",
      });
      setErrors({});
    }
  }, [open, initialValues]);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const newErrors = {};
    if (!fields.city.trim()) {
      newErrors.city = messages["cityrequiredError"];
    }
    if (!fields.address.trim()) {
      newErrors.address = messages["addressrequiredError"];
    }
    if (!fields.phone.trim()) {
      newErrors.phone = messages["phonerequriedError"];
    } else if (!isValidPhone(fields.phone)) {
      newErrors.phone = messages["phoneinvalidError"];
    }
    if (!fields.email.trim()) {
      newErrors.email = messages["emailrequiredError"];
    } else if (!isValidEmail(fields.email)) {
      newErrors.email = messages["emailvalidError"];
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSave(fields);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{messages['editprofileTitle']}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{messages['cityLabel']}</label>
            <input
              type="text"
              name="city"
              value={fields.city}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{messages['addressLabel']}</label>
            <input
              type="text"
              name="address"
              value={fields.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{messages['phoneTitle']}</label>
            <input
              type="tel"
              name="phone"
              value={fields.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="text"
              name="email"
              value={fields.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
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
