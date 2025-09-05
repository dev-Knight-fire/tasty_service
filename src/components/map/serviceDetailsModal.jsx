import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import toast from 'react-hot-toast';


export default function ServiceDetailsModal({ service, onClose, services }) {
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [selectedService, setSelectedService] = useState(service);
    const [rservices, setRservices] = useState(services);
    const [newReview, setNewReview] = useState({
        author: "",
        rating: 5,
        text: ""
    });

    // Helper to render a field if it exists
    const renderField = (label, value) =>
      value ? (
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">{label}:</span>{" "}
          {typeof value === "string" || typeof value === "number"
            ? value
            : Array.isArray(value)
            ? value.join(", ")
            : JSON.stringify(value)}
        </div>
      ) : null;

    // Render phone as clickable link
    const renderPhone = (phone) =>
      phone ? (
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Phone:</span>{" "}
          <a href={`tel:${phone}`} className="text-blue-600 underline">
            {phone}
          </a>
        </div>
      ) : null;

    const renderLink = (link) =>
      link ? (
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Link:</span>{" "}
          <a href={link} className="text-blue-600 underline">
            {link}
          </a>
        </div>
      ) : null;

    // Render email as clickable link
    const renderEmail = (email) =>
      email ? (
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Email:</span>{" "}
          <a href={`mailto:${email}`} className="text-blue-600 underline">
            {email}
          </a>
        </div>
      ) : null;

    // Render coordinates if present
    const renderCoordinates = (service) => {
      let lat, lng;
      if (service.location && typeof service.location.lat === "number" && typeof service.location.lng === "number") {
        lat = service.location.lat;
        lng = service.location.lng;
      } else if (typeof service.lat === "number" && typeof service.lng === "number") {
        lat = service.lat;
        lng = service.lng;
      }
      if (typeof lat === "number" && typeof lng === "number") {
        return (
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">Coordinates:</span>{" "}
            <span className="font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
          </div>
        );
      }
      return null;
    };

    // Render images if present
    const renderImages = (images) =>
      images && Array.isArray(images) && images.length > 0 ? (
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Photos:</span>
          <div className="flex flex-wrap mt-1 gap-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Service image ${i + 1}`}
                className="w-40 h-40 object-cover rounded border"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      ) : null;

    // Add review handler
    const handleAddReview = async (serviceId) => {
      setSubmittingReview(true);
      setReviewError("");
      try {
        // Find the service in the list
        const serviceIndex = rservices.findIndex(s => s.id === serviceId);
        if (serviceIndex === -1) throw new Error("Service not found");

        // Prepare new review object
        const reviewToAdd = {
          ...newReview,
          date: new Date().toISOString().split("T")[0]
        };

        // Get current reviews, append new, and update
        const currentReviews = rservices[serviceIndex].reviews || [];
        const updatedReviews = [...currentReviews, reviewToAdd];

        // Update Firestore document using updateDoc
        const serviceDocRef = doc(db, "lists", serviceId);
        await updateDoc(serviceDocRef, { reviews: updatedReviews });

        // Update local state
        const updatedServices = [...rservices];
        updatedServices[serviceIndex] = {
          ...updatedServices[serviceIndex],
          reviews: updatedReviews
        };
        setRservices(updatedServices);
        setSelectedService({
          ...selectedService,
          reviews: updatedReviews
        });

        // Reset form
        setNewReview({
          author: "",
          rating: 5,
          text: ""
        });
      } catch (err) {
        setReviewError("Failed to add review. Please try again.");
        console.error(err);
      } finally {
        toast.success("Review submitted successfully");
        setSubmittingReview(false);
      }
    };

    // Render reviews and add review form
    const renderReviews = (reviews, serviceId) => (
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Reviews:</span>
        <div className="flex flex-col mt-1 gap-2">
          {reviews && Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((review, i) => (
              <div key={i} className="bg-gray-100 rounded p-2 text-gray-800">
                {review.author && (
                  <div className="text-sm font-semibold mb-1">{review.author}</div>
                )}
                {review.rating !== undefined && (
                  <div className="text-yellow-600 text-xs mb-1">
                    {"★".repeat(Math.round(review.rating))}{" "}
                    <span className="text-gray-500">({review.rating})</span>
                  </div>
                )}
                <div className="text-sm">{review.text || review.comment || review.review}</div>
                {review.date && (
                  <div className="text-xs text-gray-500 mt-1">{review.date}</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No reviews yet.</div>
          )}
        </div>
        {/* Add Review Form */}
        <form
          className="mt-4 bg-gray-50 rounded p-3 flex flex-col gap-2"
          onSubmit={e => {
            e.preventDefault();
            handleAddReview(serviceId);
          }}
          autoComplete="off"
        >
          <div className="flex gap-2">
            <input
              type="text"
              className="border rounded px-2 py-1 flex-1"
              placeholder="Your name"
              value={newReview.author}
              onChange={e => {
                e.preventDefault();
                setNewReview({ ...newReview, author: e.target.value });
              }}
              required
              disabled={submittingReview}
              autoComplete="off"
            />
            <select
              className="border rounded px-2 py-1"
              value={newReview.rating}
              onChange={e => {
                e.preventDefault();
                setNewReview({ ...newReview, rating: Number(e.target.value) });
              }}
              required
              disabled={submittingReview}
            >
              {[5,4,3,2,1].map(n => (
                <option key={n} value={n}>{n}★</option>
              ))}
            </select>
          </div>
          <textarea
            className="border rounded px-2 py-1"
            placeholder="Your review"
            value={newReview.text}
            onChange={e => {
              e.preventDefault();
              setNewReview({ ...newReview, text: e.target.value });
            }}
            required
            rows={2}
            disabled={submittingReview}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-3 py-1 mt-1 hover:bg-blue-700 disabled:opacity-50"
            disabled={submittingReview}
          >
            {submittingReview ? "Submitting..." : "Add Review"}
          </button>
          {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
        </form>
      </div>
    );

    // Render custom fields (any not already rendered)
    const renderedKeys = [
      "name",
      "address",
      "entryType",
      "description",
      "website",
      "phone",
      "email",
      "openingHours",
      "tags",
      "location",
      "lat",
      "lng",
      "images",
      "social",
      "photos",
      "reviews"
    ];

    const customFields = Object.entries(service)
      .filter(
        ([key, value]) =>
          !renderedKeys.includes(key) &&
          value !== undefined &&
          value !== null &&
          value !== ""
      );

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-start bg-black bg-opacity-40">
        <div
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md h-full overflow-y-auto relative"
          style={{ maxWidth: "400px", minWidth: "320px" }}
        >
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-2">{service.name || "Service"}</h2>
          {renderImages(service.photos)}
          {renderField("Address", service.address)}
          {renderField("Category", service.entryType)}
          {renderField("Description", service.description)}
          {renderPhone(service.phone)}
          {renderEmail(service.email)}
          {renderLink(service.website)}
          {renderLink(service.facebook)}
          {renderLink(service.instagram)}
          {renderCoordinates(service)}
          {renderReviews(service.reviews, service.id)}
        </div>
      </div>
    );
}