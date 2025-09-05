"use client";
import React, { useState, useRef, useEffect } from "react";
import { Mail, Phone, MapPin, Leaf } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import Image from "next/image";
import {
  doc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/firebase/firestore";
import { storage } from "@/firebase/storage";
import toast from "react-hot-toast";
import GreenBanner from "../greenBanner/GreenBanner";

export default function ContactUs() {
  const { messages } = useLang();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: "",
    consent: false,
  });
  const [settings, setSettings] = useState({});
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDocRef = doc(db, "settings", "supportTeam_Info");
        const settingsDocSnap = await getDoc(settingsDocRef);
        setSettings(settingsDocSnap.data() || {});
      } catch (error) {
        // Fallback: ignore
      }
    };
    fetchSettings();
  }, []);

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Please enter a valid email.";
    if (!form.inquiryType) errs.inquiryType = "Please select an inquiry type.";
    if (!form.message.trim()) errs.message = "Message cannot be empty.";
    if (!form.consent) errs.consent = "Consent is required.";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      console.log('hahahoho..')
      const photoURLs = await Promise.all(
        photos.map(async (photo) => {
          console.log(photo.path);
          const photoRef = ref(
            storage,
            `messages/${Date.now()}_${photo.name}`
          );
          await uploadBytes(photoRef, photo);
          return getDownloadURL(photoRef);
        })
      );

      const submissionData = {
        ...form,
        photos: photoURLs,
      };

      await addDoc(collection(db, "messages"), {
        ...submissionData,
        viewed: false,
        createdAt: new Date().toISOString(),
      });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        inquiryType: "",
        message: "",
        consent: false,
      });
      setPhotos([]);
      setPhotoPreview([]);
      toast.success("Thank you for reaching out to Plantilo! We will reply soon.");
    } catch (error) {
      console.log(error);
      toast.error("Failed to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    setPhotoPreview([...photoPreview, ...newPreviews]);
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    const updatedPreviews = [...photoPreview];

    updatedPhotos.splice(index, 1);
    URL.revokeObjectURL(updatedPreviews[index]); // Clean up the URL
    updatedPreviews.splice(index, 1);

    setPhotos(updatedPhotos);
    setPhotoPreview(updatedPreviews);
  };

  const renderError = (field) =>
    errors[field] && (
      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    );

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white to-[#f3f3ef] border-b">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center mb-4">
              <Leaf className="w-9 h-9 text-[#2c6d3c]" />
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2c6d3c] mb-3">
              {messages["contactusmainTitle"]}
            </h1>
            <p className="text-lg md:text-xl text-[#68543a] mb-4">
              {messages["contactusmainContent"]}
            </p>
            <p className="text-base text-[#68543a]">
              {messages["contactussubContent"]}
            </p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-[#f7faf6] rounded-xl p-6 shadow border border-[#e5e5e5]">
              <h2 className="text-xl font-bold text-[#2c6d3c] mb-6">
                {messages["supportteamTitle"]}
              </h2>
              <div className="space-y-6 text-[#3a3935]">
                <div className="flex items-start">
                  <span className="bg-[#b4a885] rounded-full p-3 mr-4">
                    <Phone className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-[#2c6d3c] font-medium mt-1">
                      {settings.phone || "+00 123 456 789"}
                    </div>
                    <div className="text-xs text-[#68543a] mt-1">
                      Mon-Fri, 9am–5pm (EET)
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-[#b4a885] rounded-full p-3 mr-4">
                    <Mail className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-[#2c6d3c] font-medium mt-1">
                      {settings.email || "hello@plantilo.com"}
                    </div>
                    <div className="text-xs text-[#68543a] mt-1">
                      {messages["supportteamSubContent"]}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-[#b4a885] rounded-full p-3 mr-4">
                    <MapPin className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-[#2c6d3c] mt-1">
                      {settings.address || "Green Avenue 12, Cluj-Napoca, Romania"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Contact Form */}
          <section className="lg:col-span-2">
            <form
              className="bg-white rounded-xl p-6 md:p-10 shadow border border-[#e5e5e5] space-y-6"
              onSubmit={handleSubmit}
              noValidate
            >
              <h2 className="text-2xl font-bold text-[#2c6d3c] mb-2">
                {messages['contactusformTitle']}
              </h2>
              <p className="text-[#68543a] mb-6">
                {messages['contactusformSubContent']}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#68543a] mb-1">
                    {messages['firstnameLabel']}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#c2c2b6] bg-[#f9faf6] text-[#2c6d3c] focus:ring-2 focus:ring-[#2c6d3c] focus:bg-white"
                    required
                    placeholder="e.g. Anna"
                  />
                  {renderError("firstName")}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#68543a] mb-1">
                    {messages['lastnameLabel']}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#c2c2b6] bg-[#f9faf6] text-[#2c6d3c] focus:ring-2 focus:ring-[#2c6d3c] focus:bg-white"
                    required
                    placeholder="e.g. Popescu"
                  />
                  {renderError("lastName")}
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#68543a] mb-1">
                  {messages['emailaddressLabel']}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#c2c2b6] bg-[#f9faf6] text-[#2c6d3c] focus:ring-2 focus:ring-[#2c6d3c] focus:bg-white"
                  required
                  placeholder="you@email.com"
                />
                {renderError("email")}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#68543a] mb-1">
                  {messages['phonenumberLabel']}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#c2c2b6] bg-[#f9faf6] text-[#2c6d3c] focus:ring-2 focus:ring-[#2c6d3c] focus:bg-white"
                  placeholder="+40 712 345 678"
                />
              </div>
              <div>
                <label htmlFor="inquiryType" className="block text-sm font-medium text-[#68543a] mb-1">
                  {messages['typeofinquiryLabel']}
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={form.inquiryType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#c2c2b6] bg-[#f9faf6] text-[#2c6d3c] focus:ring-2 focus:ring-[#2c6d3c] focus:bg-white"
                  required
                >
                  <option value="">{messages['messageboxcategoryPlaceholder']}</option>
                  <option value="new_place">{messages['messageboxcategoryoption1']}</option>
                  <option value="partnership">{messages['messageboxcategoryoption2']}</option>
                  <option value="press">{messages['messageboxcategoryoption3']}</option>
                  <option value="support">{messages['messageboxcategoryoption4']}</option>
                  <option value="feedback">{messages['messageboxcategoryoption5']}</option>
                  <option value="other">{messages['messageboxcategoryoption6']}</option>
                </select>
                {renderError("inquiryType")}
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#68543a] mb-1">
                  {messages['messageboxinputLabel']}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#c2c2b6] bg-[#f9faf6] text-[#2c6d3c] focus:ring-2 focus:ring-[#2c6d3c] focus:bg-white"
                  required
                  placeholder={messages['messageboxinputPlaceholder']}
                ></textarea>
                {renderError("message")}
              </div>
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
              <div className="flex items-start mt-2">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={handleChange}
                  className="h-5 w-5 mt-1 text-[#2c6d3c] border-[#b4a885] rounded focus:ring-[#2c6d3c]"
                  required
                />
                <label
                  htmlFor="consent"
                  className="ml-3 text-sm text-[#68543a]"
                >
                  {messages['messageboxagreeTitle']}
                </label>
              </div>
              {renderError("consent")}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-4 bg-[#2c6d3c] hover:bg-[#39834d] text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#b4a885] text-lg"
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
                      {messages['sendingmessageTitle']}
                    </span>
                  ) : (
                    messages['sendmessageTitle']
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Call to Action / Mission */}
        <GreenBanner />
      </main>
    </div>
  );
}