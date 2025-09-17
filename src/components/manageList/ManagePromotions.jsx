"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, getDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ManagePromotionsPage = () => {
  // State for promotions data
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for filters and pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for modals and actions
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const { user, loading } = useAuth();
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
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);
        const promotionsQuery = query(collection(db, "promotions"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(promotionsQuery);
        
        // Fetch place data for each promotion
        const promotionsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const promotionData = { id: doc.id, ...doc.data() };
            
            // Fetch related place data
            if (promotionData.placeId) {
              try {
                const placeSnap = await getDoc(doc(db, 'places', promotionData.placeId));
                if (placeSnap.exists()) {
                  promotionData.place = { id: placeSnap.id, ...placeSnap.data() };
                }
              } catch (placeErr) {
                console.error('Error fetching place for promotion:', placeErr);
              }
            }
            
            return {
              ...promotionData,
              name: promotionData.place?.venueName || 'Unknown Venue',
              contactEmail: promotionData.userId || 'No email',
              contactPhone: promotionData.phoneNumber || 'No phone',
              address: promotionData.place?.address || 'No address',
              city: promotionData.place?.city || 'No city',
              description: promotionData.description,
              photos: promotionData.photos || [],
              status: promotionData.status || 'pending',
              createdAt: promotionData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              startDateTime: promotionData.startDateTime,
              endDateTime: promotionData.endDateTime,
            };
          })
        );
        
        setPromotions(promotionsData);
        setFilteredPromotions(promotionsData);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Apply filters
  useEffect(() => {
    let results = [...promotions];

    // Filter by status
    if (statusFilter !== "all") {
      results = results.filter((promotion) => promotion.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (promotion) =>
          promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          promotion.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          promotion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          promotion.id.toString().includes(searchQuery)
      );
    }

    setFilteredPromotions(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [statusFilter, searchQuery, promotions]);

  // Get current promotions for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromotions = filteredPromotions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

  // Handle pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle status change
  const handleStatusChange = async (promotionId, newStatus) => {
    try {
      const updatedPromotions = promotions.map((promotion) =>
        promotion.id === promotionId ? { ...promotion, status: newStatus } : promotion
      );

      const promotionDocRef = doc(db, "promotions", promotionId);
      await updateDoc(promotionDocRef, {
        status: newStatus,
      });
      
      toast.success(`Promotion ${promotionId} ${newStatus}!`);
      setPromotions(updatedPromotions);

      // Close any open modals
      setIsViewModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating promotion status:", error);
      toast.error("Failed to update promotion status");
    }
  };

  // Open view modal
  const openViewModal = (promotion) => {
    setSelectedPromotion(promotion);
    setIsViewModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (promotion) => {
    setSelectedPromotion(promotion);
    setEditFormData({ ...promotion });
    setIsEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const updatedData = {
        description: editFormData.description,
        phoneNumber: editFormData.contactPhone,
        status: editFormData.status,
      };
      
      const promotionDocRef = doc(db, "promotions", editFormData.id);
      await updateDoc(promotionDocRef, updatedData);

      const updatedPromotions = promotions.map((promotion) =>
        promotion.id === editFormData.id ? { ...editFormData } : promotion
      );

      setPromotions(updatedPromotions);
      setIsEditModalOpen(false);
      toast.success(`Promotion ${editFormData.id} has been updated`);
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Failed to update promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format datetime for display
  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not set';
    const date = dateTime.toDate ? dateTime.toDate() : new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Promotions
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {filteredPromotions.length} Promotions
            </span>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search promotions..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#206645] focus:border-[#206645] sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div>
                  <label
                    htmlFor="status-filter"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status-filter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#206645] focus:border-[#206645] sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645]"
                >
                  Clear Filters
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-[#206645] hover:bg-[#185536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645]"
                >
                  View Pending
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-[#206645]">
                    {
                      promotions.filter((promotion) => promotion.status === "pending")
                        .length
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#206645]"></div>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No promotions found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Venue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPromotions.map((promotion, index) => (
                    <tr key={promotion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Image
                              className="h-10 w-10 rounded-full object-cover"
                              src={promotion.photos?.[0] || "/placeholder.svg"}
                              alt=""
                              height={40}
                              width={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {promotion.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {promotion.contactEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {promotion.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {renderStatusBadge(promotion.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(promotion.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-4 items-center">
                          <button
                            onClick={() => openViewModal(promotion)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                            title="View"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => openEditModal(promotion)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>Edit</span>
                          </button>

                          {promotion.status === "pending" && (
                            <button
                              onClick={() =>
                                handleStatusChange(promotion.id, "active")
                              }
                              className="flex items-center space-x-1 text-green-600 hover:text-green-900"
                              title="Activate"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
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
                              <span>Activate</span>
                            </button>
                          )}

                          {promotion.status === "active" ? (
                            <button
                              onClick={() =>
                                handleStatusChange(promotion.id, "inactive")
                              }
                              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                              title="Deactivate"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                              </svg>
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            promotion.status === "inactive" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(promotion.id, "active")
                                }
                                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                                title="Activate"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                <span>Activate</span>
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && filteredPromotions.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredPromotions.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredPromotions.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? "z-10 bg-[#206645] border-[#206645] text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* View Modal */}
      {isViewModalOpen && selectedPromotion && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setIsViewModalOpen(false)}
              ></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedPromotion.name}
                      </h3>
                      <div className="flex items-center">
                        {renderStatusBadge(selectedPromotion.status)}
                        <button
                          onClick={() => setIsViewModalOpen(false)}
                          className="ml-3 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <Image
                          src={selectedPromotion.photos?.[0] || "/placeholder.svg"}
                          alt={selectedPromotion.name}
                          className="object-cover rounded-md"
                          width={200}
                          height={100}
                        />
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Created: {formatDate(selectedPromotion.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        {selectedPromotion.description}
                      </p>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Contact Email
                          </h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedPromotion.contactEmail}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Contact Phone
                          </h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedPromotion.contactPhone}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Start Date
                          </h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDateTime(selectedPromotion.startDateTime)}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            End Date
                          </h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDateTime(selectedPromotion.endDateTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedPromotion.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(selectedPromotion.id, "active")
                      }
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Activate
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(selectedPromotion.id, "inactive")
                      }
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Deactivate
                    </button>
                  </>
                )}

                {selectedPromotion.status === "active" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(selectedPromotion.id, "inactive")
                    }
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Deactivate
                  </button>
                )}

                {selectedPromotion.status === "inactive" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(selectedPromotion.id, "active")
                    }
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Activate
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openEditModal(selectedPromotion)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setIsEditModalOpen(false)}
              ></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Edit Promotion
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsEditModalOpen(false)}
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 space-y-6">
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={editFormData.description}
                            onChange={handleEditFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#206645] focus:ring-[#206645]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="contactPhone"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="contactPhone"
                            id="contactPhone"
                            value={editFormData.contactPhone}
                            onChange={handleEditFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#206645] focus:ring-[#206645]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={editFormData.status}
                            onChange={handleEditFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#206645] focus:ring-[#206645]"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`m-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-[#206645] text-white font-medium hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
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
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="m-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#206645] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePromotionsPage;