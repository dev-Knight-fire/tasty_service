import React, { useState, useRef } from "react";
import { useLang } from "@/contexts/LangContext";
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { storage } from "@/firebase/storage";
import { useAuth } from "@/contexts/AuthContext";

export default function EditPhotosModal({
  open,
  onClose,
  initialValues = [],
  onSave,
}) {
  const [photos, setPhotos] = useState([]);
  const [currentphotos, setCurrentPhotos] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { messages } = useLang();
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(initialValues);
  const { user } = useAuth();

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("hahahah");
    if (true) {
      setIsSubmitting(true);

      try {
        // Upload photos to Firebase Storage and get their URLs
        const photoURLs = await Promise.all(
          photos.map(async (photo) => {
            const photoRef = ref(
              storage,
              `listings/${Date.now()}_${photo.name}`
            );
            await uploadBytes(photoRef, photo);
            return getDownloadURL(photoRef);
          })
        );

        // Prepare data for Firestore
        const submissionData = {
          photos: [...currentphotos, ...photoURLs],
        };

        // Add document to Firestore
        await updateDoc(doc(db, "lists", user.email), submissionData);
        setPhotoPreview(submissionData.photos);
        setPhotos([]);
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors({ submit: "Failed to submit the form. Please try again." });
      } finally {
        setIsSubmitting(false);
        onSave(photoPreview);
        onClose();
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 10) {
      alert("You can upload a maximum of 10 photos");
      return;
    }

    setPhotos([...photos, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    console.log(newPreviews);
    setPhotoPreview([...photoPreview, ...newPreviews]);
  };

  const renderError = (field) => {
    return errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;
  };

  const removePhoto = (index) => {
    const length = currentphotos.length;
    const updatedPhotos = [...photos];
    const updatedPreviews = [...photoPreview];
    const updatedcurrentphotos = [...currentphotos];

    if (index < length) {
      updatedcurrentphotos.splice(index, 1);
      updatedPreviews.splice(index, 1);
    } else {
      updatedPhotos.splice(index - length, 1);
      URL.revokeObjectURL(updatedPreviews[index]); // Clean up the URL
      updatedPreviews.splice(index, 1);
    }
    setCurrentPhotos(updatedcurrentphotos);
    setPhotos(updatedPhotos);
    setPhotoPreview(updatedPreviews);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">{messages['uploadphotosTitle']}</h2>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {messages["photosLabel"]}
          </h2>
          <p className="text-gray-600 mb-4">{messages["photossubTitle"]}</p>

          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#206645] hover:text-[#185536] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#206645]"
                >
                  <span>{messages["uploadphotosTitle"]}</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">{messages["draganddropTitle"]}</p>
              </div>
              <p className="text-xs text-gray-500">{messages["pngjpgTitle"]}</p>
            </div>
          </div>
          {renderError("photos")}

          {/* Photo Previews */}
          {photoPreview.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {messages["uploadphotosTitle"]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photoPreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="object-cover"
                        width={200}
                        height={200}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-500 hover:text-red-500"
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
                  </div>
                ))}
              </div>
            </div>
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
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#206645] hover:bg-[#185536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645] ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {messages['saveTitle']}
              </span>
            ) : (
              messages['saveTitle']
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
