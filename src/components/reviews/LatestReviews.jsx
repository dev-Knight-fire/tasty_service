"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc as docRef,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { FaStar, FaPlus, FaUser, FaCamera, FaUtensils } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReviewDetailModal from "./ReviewDetailModal";
import { useLang } from "@/contexts/LangContext";

/**
 * LatestReviews.jsx
 * 
 * A polished, production-ready version of the LatestReviews component with:
 * - Parallel Firestore fetching for place docs (faster)
 * - Beautiful card UI, hover states, and subtle motion
 * - Robust empty/error/loading states (with shimmer skeletons)
 * - Accessible labels & keyboard focus
 * - Safe fallbacks when data is missing
 */

const SKELETON_COUNT = 6;

const LatestReviews = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { messages } = useLang();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ---- Data Fetch ----
  useEffect(() => {
    let mounted = true;

    const fetchLatestReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const reviewsQ = query(
          collection(db, "reviews"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const snap = await getDocs(reviewsQ);
        const base = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Fetch associated place docs in parallel where placeId exists
        const withPlaces = await Promise.all(
          base.map(async (rev) => {
            if (!rev.placeId) return { ...rev, place: null };
            try {
              const pDoc = await getDoc(docRef(db, "places", rev.placeId));
              return {
                ...rev,
                place: pDoc.exists() ? { id: pDoc.id, ...pDoc.data() } : null,
              };
            } catch (e) {
              console.error("Place fetch error:", e);
              return { ...rev, place: null };
            }
          })
        );

        if (mounted) setReviews(withPlaces);
      } catch (e) {
        console.error("Error fetching latest reviews:", e);
        if (mounted) setError("Couldn't load reviews. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLatestReviews();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Utils ----
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const now = new Date();
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const s = Math.max(0, Math.floor((now - d) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
    return `${Math.floor(s / 2592000)}mo ago`;
  };

  const getAverageRating = (ratings = {}) => {
    const keys = [
      "food",
      "cleanliness",
      "service",
      "valueForMoney",
      "wouldReturn",
    ];
    const vals = keys.map((k) => Number(ratings[k] ?? 0));
    const count = vals.filter((v) => v > 0).length || keys.length; // avoid NaN
    const total = vals.reduce((a, b) => a + b, 0);
    return total / count;
  };

  const truncate = (str, n = 120) => {
    if (!str) return "";
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  };

  const placeholderPhoto =
    "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop";

  // ---- Render helpers ----
  const Stars = ({ rating }) => (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
        />
      ))}
      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );

  const ReviewCard = ({ review }) => {
    const avg = useMemo(() => getAverageRating(review.ratings), [review.ratings]);
    const time = useMemo(() => getRelativeTime(review.createdAt), [review.createdAt]);
    const photo = review?.photos?.[0] || placeholderPhoto;
    const venue = review?.place?.venueName || review?.place?.name;
    const city = review?.place?.city || review?.place?.addressCity || review?.place?.cityName;

    return (
      <motion.article
        layout
        onClick={() => {
          setSelectedReview(review);
          setShowReviewModal(true);
        }}
        className="group relative rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all cursor-pointer focus-within:ring-2 focus-within:ring-green-500"
        whileHover={{ y: -2 }}
      >
        {/* Photo */}
        <div className="relative h-40 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={venue ? `${venue}${city ? ", " + city : ""}` : "Review photo"}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {venue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-gray-900/80 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-100 shadow">
                <FaUtensils className="w-3 h-3 text-red-600" /> {truncate(venue, 24)}
              </span>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <span className="rounded-full bg-black/70 text-white px-2 py-0.5 text-xs">{time}</span>
          </div>

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <FaUser className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {review.userDisplayName || review.userId || "Anonymous"}
                </p>
                {city && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{city}</p>
                )}
              </div>
            </div>
            <Stars rating={avg || 0} />
          </div>

          {review.comment && (
            <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">“{truncate(review.comment, 140)}”</p>
          )}
        </div>
      </motion.article>
    );
  };

  // ---- Layout ----
  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <header className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{messages['homeserviceTitle1']}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/map/all")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <FaPlus className="w-4 h-4" /> {messages['addreviewTitle']}
          </button>
        </div>
      </header>

      {/* Loading */}
      <AnimatePresence initial={false}>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-busy="true"
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <div className="h-40 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 animate-[shimmer_1.5s_infinite]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-10">
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && reviews.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <FaCamera className="w-12 h-12 mx-auto mb-4 opacity-60" />
          <p className="mb-6">{messages[reviewemptyTitle]}</p>
          <button
            onClick={() => router.push("/map/all")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            <FaPlus className="w-4 h-4" /> {messages[addreviewTitle]}
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && reviews.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} />
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <ReviewDetailModal
        review={selectedReview}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedReview(null);
        }}
      />

      <style jsx global>{`
        @keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }
      `}</style>
    </section>
  );
};

export default LatestReviews;
