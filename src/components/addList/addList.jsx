"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";
import { useRouter } from "next/navigation";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/storage";
import MapTilerLocationPicker from "./MapTilerLocationPicker";

const ENTRY_TYPES = [
  {
    id: "localFood",
    label: "Local & Organic Food",
    icon: "🛒",
  },
  {
    id: "fairTrade",
    label: "Fair Trade",
    icon: "🤝",
  },
  {
    id: "zeroWaste",
    label: "Zero Waste & Refill",
    icon: "♻️",
  },
  {
    id: "foodSharing",
    label: "Food Sharing",
    icon: "🍽️",
  },
  {
    id: "repairPoints",
    label: "Repair Points",
    icon: "🔧",
  },
  {
    id: "giveTake",
    label: "Give & Take",
    icon: "📚",
  },
  {
    id: "bioWaste",
    label: "Bio Waste",
    icon: "🌲",
  },
  {
    id: "ecoMarket",
    label: "E-Markets",
    icon: "🏛️",
  },
  {
    id: "resinWaste",
    label: "Resin Waste",
    icon: "🗑️",
  },
];

const AddListingPage = ({ category = "" }) => {
  const { messages } = useLang();
  const { user, loading, switchList, switchRole, switchAvatar } = useAuth();
  const router = useRouter();
  // entryType is now an array for multi-select
  const initialFormData = {
    entryType: category && Array.isArray(category) ? category : category ? [category] : [],
    name: "",
    email: user.email === "plantilo@proton.me" ? "" : user.email,
    phone: "",
    address: "",
    city: "",
    website: "",
    facebook: "",
    instagram: "",
    description: "",
    reviews: [],
    status: "pending",
  };
  const [location, setLocation] = useState({ lat: 52.237049, lng: 21.017532 }); // Default to Warsaw
  const MAPTILER_KEY = "CPbPF9KEBf1CDt78326q"; // Replace with your real MapTiler key

  useEffect(() => {
    if (!loading && !user.email) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // State for form data
  const [formData, setFormData] = useState(initialFormData);

  // State for photos
  const [photos, setPhotos] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);
  const fileInputRef = useRef(null);

  // State for form validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested properties for dynamic fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle entry type multi-select
  const handleEntryTypeToggle = (id) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.entryType) ? prev.entryType : [];
      if (current.includes(id)) {
        // Remove
        return { ...prev, entryType: current.filter((t) => t !== id) };
      } else {
        // Add
        return { ...prev, entryType: [...current, id] };
      }
    });
  };

  // Handle photo uploads
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 10) {
      alert("You can upload a maximum of 10 photos");
      return;
    }

    setPhotos([...photos, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreview([...photoPreview, ...newPreviews]);
  };

  // Remove a photo
  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    const updatedPreviews = [...photoPreview];

    updatedPhotos.splice(index, 1);
    URL.revokeObjectURL(updatedPreviews[index]); // Clean up the URL
    updatedPreviews.splice(index, 1);

    setPhotos(updatedPhotos);
    setPhotoPreview(updatedPreviews);
  };

  function isUrl(value) {
    if (typeof value !== "string") return false;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function isFloat(value) {
    if (typeof value !== "string") return false;
    // Accepts single number or range like 4500-6000 (with optional decimals)
    return /^(\d+(\.\d+)?)(-(\d+(\.\d+)?))?$/.test(value.trim());
  }

  function isNumber(value) {
    if (typeof value === "number" && isFinite(value)) return true;
    if (typeof value !== "string") return false;
    return /^-?\d+$/.test(value.trim());
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // General fields
    if (!formData.entryType || !Array.isArray(formData.entryType) || formData.entryType.length === 0)
      newErrors.entryType = messages['entrytypeError'];
    if (!formData.name.trim()) newErrors.name = messages['namerequiredError'];
    if (!formData.phone) newErrors.phone = messages['phonerequriedError'];
    else if (
      !/^(\+?\d{1,4}[\s-]?)?(\d{9,15})$/.test(formData.phone.replace(/\s/g, ""))
    )
      newErrors.phone = messages['phoneinvalidError'];
    if (!formData.address.trim()) newErrors.address = messages['addressrequriedError'];
    if (!formData.city.trim()) newErrors.city = messages['cityrequiredError'];
    if (!formData.description.trim()) {
      newErrors.description = messages['descriptionrequiredError'];
    } else if (formData.description.trim().length < 100) {
      newErrors.description = messages['descriptioncharactersError'];
    }

    // Photo validation
    if (photos.length === 0)
      newErrors.photos = messages['photouploadleastError'];

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    console.log(formErrors);
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
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
          ...formData,
          photos: photoURLs,
          avatar: 0,
          createdAt: serverTimestamp(),
          location: location
        };

        // Add document to Firestore
        await addDoc(collection(db, "lists"), submissionData);
        await updateDoc(doc(db, "users", user.email), {
          setList: true,
          // For multi-select, you may want to store the array or the first selected as role
          role: Array.isArray(formData.entryType) && formData.entryType.length > 0 ? formData.entryType[0] : "", // Update user role based on first entry type
        });

        if(user.email !== "plantilo@proton.me") {
          setSubmitSuccess(true);
          switchRole(Array.isArray(formData.entryType) && formData.entryType.length > 0 ? formData.entryType[0] : ""); // Update user role based on first entry type
          switchAvatar(photoURLs[0]);
        } else {
          setSubmitSuccess(true);
        }
        setFormData(initialFormData); // Reset form data
        setPhotos([]);
        setPhotoPreview([]);
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors({ submit: "Failed to submit the form. Please try again." });
      } finally {
        setIsSubmitting(false);
        switchList(true); // Update user context to reflect list submission
        if(user.email !== "plantilo@proton.me") {
          router.push("/");
        } else {
          router.push("/admin");
        }
      }
    }
  };

  // Render error message
  const renderError = (field) => {
    return errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-16 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {messages["addlistpageTitle1"]}{" "}
              <span className="text-[#206645]">
                {messages["addlistpageTitle2"]}
              </span>{" "}
              {messages["addlistpageTitle3"]}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {messages["addlistpagesubTitle"]}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {submitSuccess ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {messages["listingsubmitsuccessTitle"]}
              </h2>
              <p className="text-gray-600 mb-6">
                {messages["listingsubmitthankMessage"]}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="space-y-8">
                  {/* Entry Type Selection */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {messages["typeofentryTitle"]}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {messages["typeofentrysubTitle"]}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {ENTRY_TYPES.map((type) => {
                        const selected = Array.isArray(formData.entryType) && formData.entryType.includes(type.id);
                        return (
                          <div
                            key={type.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors flex items-center ${
                              selected
                                ? "border-[#206645] bg-[#206645]/10"
                                : "border-gray-200 hover:border-[#206645]/50 hover:bg-[#206645]/5"
                            }`}
                            onClick={() => handleEntryTypeToggle(type.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => handleEntryTypeToggle(type.id)}
                              className="mr-3 accent-[#206645] w-5 h-5"
                              id={`entryType-${type.id}`}
                              tabIndex={-1}
                              style={{ pointerEvents: "none" }}
                              readOnly
                            />
                            <label htmlFor={`entryType-${type.id}`} className="flex items-center cursor-pointer w-full">
                              <span className="text-2xl mr-3">{type.icon}</span>
                              <span className="font-medium text-gray-900">{type.label}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {renderError("entryType")}
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {messages["contactinformationTitle"]}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {messages["contactinformationsubTitle"]}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          label: messages["businessnameLabel"],
                          name: "name",
                          type: "text",
                        },
                        {
                          label: messages["phoneLabel"],
                          name: "phone",
                          type: "tel",
                        },
                        {
                          label: messages["addressLabel"],
                          name: "address",
                          type: "text",
                        },
                        {
                          label: messages["cityLabel"],
                          name: "city",
                          type: "text",
                        },
                        {
                          label: "Web Site",
                          name: "website",
                          type: "text",
                        },
                        {
                          label: "Facebook",
                          name: "facebook",
                          type: "text",
                        },
                        {
                          label: "Instagram",
                          name: "instagram",
                          type: "text",
                        }
                      ].map(({ label, name, type }) => (
                        <div key={name}>
                          <label
                            htmlFor={name}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                          >
                            {label}
                          </label>
                          <input
                            type={type}
                            id={name}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#206645] dark:focus:ring-[#3b9ede] focus:outline-none"
                          />
                          {renderError(name)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                    >
                      {messages["descriptionTitle"]}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {messages["descriptionsubTitle"]}
                    </p>
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={messages["descriptionPlaceholder"]}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#206645] dark:focus:ring-[#3b9ede] focus:outline-none transition duration-150"
                    />
                    {renderError("description")}
                  </div>

                  {/* Select location on map */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {messages["locationonmapTitle"] || "Select location on map"}
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      {messages["locationonmapSubtitle"] || "Click or drag the marker to set the precise location."}
                    </p>
                    <MapTilerLocationPicker
                      value={location}
                      onChange={setLocation}
                      mapKey={MAPTILER_KEY}
                    />
                    <div className="text-xs mt-2 text-gray-500">
                      {`Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`}
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {messages["photosLabel"]}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {messages["photossubTitle"]}
                    </p>

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
                        <p className="text-xs text-gray-500">
                          {messages["pngjpgTitle"]}
                        </p>
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
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3">
                <button
                  type="submit"
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
                      {messages["submittingTitle"]}
                    </span>
                  ) : (
                    messages["submitlistingTitle"]
                  )}
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645]"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to cancel? All your data will be lost."
                      )
                    ) {
                      window.location.href = "/";
                    }
                  }}
                >
                  {messages["cancelTitle"]}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddListingPage;