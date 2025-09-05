import React from "react";
import { Star } from "lucide-react";
import { Separator } from "../ui/separator";
import { useLang } from "@/contexts/LangContext";

export default function DetailsModal({
  isOpen,
  onClose,
  item,
  title = "Details",
}) {

    const {messages} = useLang();
  if (!isOpen) return null;

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Sliding panel */}
      <aside
        className="fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out w-[28rem]"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 focus:outline-none"
            aria-label="Close details modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <div className="p-6 overflow-y-auto h-[calc(100%-64px)] space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">{messages['nameTitle']}</h3>
            <p className="text-gray-900">{item.name}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">{messages['typeTitle']}</h3>
            <p className="text-gray-900 capitalize">{item.type}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">{messages['addressLabel']}</h3>
            <p className="text-gray-900">{item.address}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              {messages['descriptionTitle']}
            </h3>
            <p className="text-gray-900 whitespace-pre-line">
              {item.description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              {messages['reviewsTitle']}
            </h3>
            {item.reviews.length !== 0 &&
              item.reviews.map((review, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{review.name}</p>
                      <p className="text-xs text-gray-500">{review.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(5)} <b>5.0</b>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    &quot;{review.text}&quot;
                  </p>
                  {index < item.reviews.length - 1 && <Separator />}
                </div>
              ))}
          </div>
        </div>
      </aside>
    </>
  );
}
