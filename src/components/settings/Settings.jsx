"use client";
import { useState, useEffect } from "react";
import { FaEnvelope, FaSave, FaTimes, FaCogs } from "react-icons/fa";
import { useLang } from "@/contexts/LangContext";
import { collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import {
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import Loading from "@/app/loading";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SettingsComponent() {
  const [initialSettings, setInitialSettings] = useState({});
  const [settings, setSettings] = useState(initialSettings);
  const [submitLoading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { messages } = useLang();
  const [isLoading, setIsLoading] = useState(true);
  const {user, loading} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user.email) {
      router.push("/signin");
    }
    if(!loading && !user.isAdmin) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const settingsDocRef = doc(db, "settings", "supportTeam_Info");
        const settingsDocSnap = await getDoc(settingsDocRef);
        // Combine data from both collections
        const data = settingsDocSnap.data();
        console.log(data);
        setInitialSettings(data);
        setSettings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  // Handle input changes
  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setSuccess(false);
    setError("");
  };

  // Save settings (simulate async API call)
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    setLoading(true);
    try {
      // Simulate API call
      const settingsDocRef = doc(db, "settings", "supportTeam_Info");
      await setDoc(settingsDocRef, settings);
      setSuccess(true);
    } catch {
      setError("Failed to save settings. Try again.");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    setError("");
    setSuccess(false);
  };

  return (
    <div className="max-w-3xl mx-auto my-20 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-800">
        <FaCogs className="text-blue-600" /> {messages["adminsettingsTitle"]}
      </h1>

      <form onSubmit={handleSave} className="space-y-10">
        {/* Contact Section */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-700">
            <FaEnvelope className="text-green-600" />
            {messages["supportcontactTitle"]}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                {messages["emailTitle"]}
              </label>
              <input
                name="email"
                type="email"
                className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-green-400"
                value={settings?.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                {messages["phoneTitle"]}
              </label>
              <input
                name="phone"
                type="tel"
                className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-green-400"
                value={settings?.phone}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-600 mb-1 font-medium">
                {messages["locationTitle"]}
              </label>
              <input
                name="address"
                className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-green-400"
                value={settings?.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <div className="text-red-700 bg-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-700 bg-green-100 rounded px-3 py-2">
            Settings saved successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            disabled={submitLoading}
          >
            <FaSave />
            {submitLoading ? (
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
                {messages["savechangesTitle"]}
              </span>
            ) : (
              messages["savechangesTitle"]
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
