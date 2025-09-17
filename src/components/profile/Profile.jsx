"use client"
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import PleaseLogin from '../PleaseLogin/PleaseLogin';
import { Loader, User, Home, Edit, Trash2, Eye, Save, X, Camera, Upload, RotateCcw, Calendar } from 'lucide-react';
import { db } from '@/firebase/firestore';
import { storage } from '@/firebase/storage';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PromotionDetailModal from '@/components/promotionSection/PromotionDetailModal';
import AddPromotionModal from '@/components/map/AddPromotionModal';

const UserProfile = () => {
   const { user, loading } = useAuth();
   const router = useRouter();
   const [activeTab, setActiveTab] = useState('account');
   const [userData, setUserData] = useState(null);
   const [userPromotions, setUserPromotions] = useState([]);
   const [isEditing, setIsEditing] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [editForm, setEditForm] = useState({
      username: '',
      phone: '',
      photoURL: ''
   });
   const [photoEditor, setPhotoEditor] = useState({
      isOpen: false,
      selectedFile: null,
      preview: null,
      isUploading: false,
      dragActive: false
   });
   const [selectedPromotion, setSelectedPromotion] = useState(null);
   const [showPromotionModal, setShowPromotionModal] = useState(false);
   const [showEditPromotionModal, setShowEditPromotionModal] = useState(false);
   const fileInputRef = useRef(null);
   const dropZoneRef = useRef(null);

   const openPromotionModal = (promotion) => {
      setSelectedPromotion(promotion);
      setShowPromotionModal(true);
   };

   const closePromotionModal = () => {
      setShowPromotionModal(false);
      setSelectedPromotion(null);
   };

   const openEditPromotionModal = (promotion) => {
      setSelectedPromotion(promotion);
      setShowEditPromotionModal(true);
   };

   const closeEditPromotionModal = () => {
      setShowEditPromotionModal(false);
      setSelectedPromotion(null);
   };

   const handleEditPromotionSubmit = ({ place, promotion }) => {
      setUserPromotions(prev => prev.map(p => p.id === promotion.id ? { ...p, ...promotion, place } : p));
      closeEditPromotionModal();
   };

   // Fetch user data from Firestore
   const fetchUserData = async () => {
      try {
         if (user?.email) {
            const userDoc = await getDoc(doc(db, 'users', user.email));
            if (userDoc.exists()) {
               const data = userDoc.data();
               setUserData(data);
               setEditForm({
                  username: data.username || '',
                  phone: data.phone || '',
                  photoURL: data.photoURL || ''
               });
            }
         }
      } catch (error) {
         console.error('Error fetching user data:', error);
      }
   };

   // Fetch user properties
   const fetchUserPromotions = async () => {
      try {
         if (user?.email) {
            const promotionsRef = collection(db, 'promotions');
            // Sort by latest (descending by createdAt)
            const q = query(
               promotionsRef,
               where('userId', '==', user.email),
               orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const promotions = await Promise.all(
               querySnapshot.docs.map(async (snap) => {
                  const data = { id: snap.id, ...snap.data() };
                  // Attach related place
                  if (data.placeId) {
                     try {
                        const placeSnap = await getDoc(doc(db, 'places', data.placeId));
                        if (placeSnap.exists()) {
                           data.place = { id: placeSnap.id, ...placeSnap.data() };
                        }
                     } catch (placeErr) {
                        console.error('Error fetching place for promotion:', placeErr);
                     }
                  }
                  return data;
               })
            );
            setUserPromotions(promotions);
         }
      } catch (error) {
         console.error('Error fetching promotions:', error);
      }
   };

   useEffect(() => {
      if (user?.email) {
         Promise.all([fetchUserData(), fetchUserPromotions()])
            .finally(() => setIsLoading(false));
      }
   }, [user, loading]);

   // Save user data
   const handleSaveUserData = async () => {
      try {
         setIsSaving(true);
         const userRef = doc(db, 'users', user.email);
         await updateDoc(userRef, {
            username: editForm.username,
            phone: editForm.phone,
            photoURL: editForm.photoURL,
            updatedAt: new Date()
         });

         setUserData(prev => ({ ...prev, ...editForm }));
         setIsEditing(false);
      } catch (error) {
         console.error('Error updating user data:', error);
      } finally {
         setIsSaving(false);
      }
   };

   // Photo Editor Functions
   const handleFileSelect = (file) => {
      if (file && file.type.startsWith('image/')) {
         const reader = new FileReader();
         reader.onload = (e) => {
            setPhotoEditor(prev => ({
               ...prev,
               selectedFile: file,
               preview: e.target.result
            }));
         };
         reader.readAsDataURL(file);
      }
   };

   const handleDragOver = (e) => {
      e.preventDefault();
      setPhotoEditor(prev => ({ ...prev, dragActive: true }));
   };

   const handleDragLeave = (e) => {
      e.preventDefault();
      setPhotoEditor(prev => ({ ...prev, dragActive: false }));
   };

   const handleDrop = (e) => {
      e.preventDefault();
      setPhotoEditor(prev => ({ ...prev, dragActive: false }));
      const files = e.dataTransfer.files;
      if (files.length > 0) {
         handleFileSelect(files[0]);
      }
   };

   const uploadPhoto = async () => {
      if (!photoEditor.selectedFile) {
         return;
      }

      try {
         setPhotoEditor(prev => ({ ...prev, isUploading: true }));

         // Create a unique filename
         const timestamp = Date.now();
         const fileName = `profile-photos/${user.email}/${timestamp}_${photoEditor.selectedFile.name}`;
         const storageRef = ref(storage, fileName);

         // Upload the file
         const snapshot = await uploadBytes(storageRef, photoEditor.selectedFile);
         const downloadURL = await getDownloadURL(snapshot.ref);

         // Update user data
         const userRef = doc(db, 'users', user.email);
         await updateDoc(userRef, {
            photoURL: downloadURL,
            updatedAt: new Date()
         });

         // Update local state
         setUserData(prev => ({ ...prev, photoURL: downloadURL }));
         setEditForm(prev => ({ ...prev, photoURL: downloadURL }));

         // Close editor
         setPhotoEditor({
            isOpen: false,
            selectedFile: null,
            preview: null,
            isUploading: false,
            dragActive: false
         });

      } catch (error) {
         console.error('Error uploading photo:', error);
      } finally {
         setPhotoEditor(prev => ({ ...prev, isUploading: false }));
      }
   };

   const openPhotoEditor = () => {
      setPhotoEditor(prev => ({ ...prev, isOpen: true }));
   };

   const closePhotoEditor = () => {
      setPhotoEditor({
         isOpen: false,
         selectedFile: null,
         preview: null,
         isUploading: false,
         dragActive: false
      });
   };

   // Toggle promotion status
   const handleTogglePromotionStatus = async (propertyId, currentStatus) => {
      try {
         const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
         await updateDoc(doc(db, 'promotions', propertyId), {
            status: newStatus,
            updatedAt: new Date()
         });
         
         // Update local state
         setUserPromotions(prev => prev.map(p => 
            p.id === propertyId ? { ...p, status: newStatus } : p
         ));
      } catch (error) {
         console.error('Error updating promotion status:', error);
      }
   };

   if (!user?.email && !loading) {
      router.push("/signin");
   }

   if (loading || isLoading) {
      return (
         <div className="min-h-screen bg-gradient-to-b from-green-50 to-[#8B4513]/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="flex flex-col lg:flex-row gap-8">
                  {/* Sidebar skeleton */}
                  <div className="lg:w-80">
                     <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                        <div className="h-7 w-32 bg-gray-200 rounded mb-6" />
                        <div className="space-y-2">
                           <div className="h-10 w-full bg-gray-100 rounded" />
                           <div className="h-10 w-full bg-gray-100 rounded" />
                        </div>
                     </div>
                  </div>

                  {/* Main content skeleton */}
                  <div className="flex-1">
                     {/* Account card */}
                     <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                           <div className="h-7 w-40 bg-gray-200 rounded" />
                           <div className="h-9 w-28 bg-gray-100 rounded" />
                        </div>

                        <div className="space-y-6">
                           {/* Profile row */}
                           <div className="flex items-center space-x-6">
                              <div className="h-24 w-24 rounded-full bg-gray-200" />
                              <div className="space-y-3">
                                 <div className="h-5 w-48 bg-gray-100 rounded" />
                                 <div className="h-4 w-32 bg-gray-100 rounded" />
                              </div>
                           </div>

                           {/* Info grid */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="h-16 bg-gray-50 border border-gray-200 rounded-lg" />
                              <div className="h-16 bg-gray-50 border border-gray-200 rounded-lg" />
                              <div className="h-16 bg-gray-50 border border-gray-200 rounded-lg" />
                              <div className="h-16 bg-gray-50 border border-gray-200 rounded-lg" />
                           </div>
                        </div>
                     </div>

                     {/* Properties card */}
                     <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
                        <div className="flex items-center justify-between mb-6">
                           <div className="h-7 w-40 bg-gray-200 rounded" />
                           <div className="h-9 w-32 bg-gray-100 rounded" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {[0,1,2].map((i) => (
                              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                 <div className="h-48 w-full bg-gray-200 rounded-lg mb-4" />
                                 <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
                                 <div className="h-4 w-1/2 bg-gray-100 rounded mb-4" />
                                 <div className="flex items-center justify-between">
                                    <div className="h-8 w-24 bg-green-100 rounded" />
                                    <div className="h-8 w-20 bg-red-100 rounded" />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-[#8B4513]/10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
               {/* Sidebar */}
               <div className="lg:w-80">
                  <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <User className="w-6 h-6 mr-2 text-green-600" />
                        My Profile
                     </h2>

                     <nav className="space-y-2">
                        <button
                           onClick={() => setActiveTab('account')}
                           className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'account'
                                 ? 'bg-green-600 text-white shadow-md'
                                 : 'text-[#6f3410] hover:bg-[#8B4513]/10'
                              }`}
                        >
                           <User className="w-5 h-5 mr-3" />
                           My Account
                        </button>
                        {user.role === "admin" ?
                           <button
                              onClick={() => router.push('/admin/allproperties')}
                              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'properties'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-[#6f3410] hover:bg-[#8B4513]/10'
                                 }`}
                           >
                              <Home className="w-5 h-5 mr-3" />
                              All Properties
                           </button> :
                           <button
                              onClick={() => setActiveTab('properties')}
                              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'properties'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-[#6f3410] hover:bg-[#8B4513]/10'
                                 }`}
                           >
                              <Home className="w-5 h-5 mr-3" />
                              My Promotions
                           </button>
                        }
                     </nav>
                  </div>
               </div>

               {/* Main Content */}
               <div className="flex-1">
                  {activeTab === 'account' && (
                     <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-2xl font-bold text-gray-800">My Account</h3>
                           {!isEditing && (
                              <button
                                 onClick={() => setIsEditing(true)}
                                 className="flex items-center px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#6f3410] transition-colors"
                              >
                                 <Edit className="w-4 h-4 mr-2" />
                                 Edit Profile
                              </button>
                           )}
                        </div>

                        {isEditing ? (
                           <div className="space-y-6">
                              {/* Profile Photo */}
                              <div className="flex items-center space-x-6">
                                 <div className="relative group">
                                    <img
                                       src={editForm.photoURL || userData?.img || "/user.jpg"}
                                       alt="Profile"
                                       className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                                    />
                                    <button
                                       onClick={openPhotoEditor}
                                       className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                       <Camera className="w-6 h-6 text-white" />
                                    </button>
                                 </div>
                                 <div className="flex-1 space-y-3">
                                    <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Profile Photo
                                       </label>
                                       <div className="flex space-x-2">
                                          <button
                                             onClick={openPhotoEditor}
                                             className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                          >
                                             <Upload className="w-4 h-4 mr-2" />
                                             Upload Photo
                                          </button>
                                          <button
                                             onClick={() => fileInputRef.current?.click()}
                                             className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                          >
                                             <Camera className="w-4 h-4 mr-2" />
                                             Choose File
                                          </button>
                                       </div>
                                       <input
                                          ref={fileInputRef}
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleFileSelect(e.target.files[0])}
                                          className="hidden"
                                       />
                                    </div>
                                    <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Or enter photo URL
                                       </label>
                                       <input
                                          type="url"
                                          value={editForm.photoURL}
                                          onChange={(e) => setEditForm(prev => ({ ...prev, photoURL: e.target.value }))}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                          placeholder="Enter photo URL"
                                       />
                                    </div>
                                 </div>
                              </div>

                              {/* Name */}
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                 </label>
                                 <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                    placeholder="Enter your full name"
                                 />
                              </div>

                              {/* Phone */}
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                 </label>
                                 <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                    placeholder="Enter your phone number"
                                 />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-4 pt-4">
                                 <button
                                    onClick={handleSaveUserData}
                                    disabled={isSaving}
                                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                 >
                                    {isSaving ? (
                                       <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                       <Save className="w-4 h-4 mr-2" />
                                    )}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                 </button>
                                 <button
                                    onClick={() => {
                                       setIsEditing(false);
                                       setEditForm({
                                          username: userData?.username || '',
                                          phone: userData?.phone || '',
                                          photoURL: userData?.photoURL || ''
                                       });
                                    }}
                                    className="flex items-center px-6 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#6f3410] transition-colors"
                                 >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-6">
                              {/* Profile Photo */}
                              <div className="flex items-center space-x-6">
                                 <img
                                    src={userData?.photoURL || userData?.img || "/user.jpg"}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                                 />
                                 <div>
                                    <h4 className="text-xl font-semibold text-gray-800">{userData?.username || 'No Name'}</h4>
                                    <p className="text-gray-600">{userData?.role || 'User'}</p>
                                 </div>
                              </div>

                              {/* User Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                    <p className="text-gray-800">{userData?.phone || 'No phone number'}</p>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                                    <p className="text-gray-800">
                                       {userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                    </p>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                                    <p className="text-gray-800">
                                       {userData?.updatedAt?.toDate?.()?.toLocaleDateString() || 'Never'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'properties' && (
                     <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-2xl font-bold text-gray-800">My Promotions</h3>
                           <Link
                              href="/map/all"
                              className="flex items-center px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#6f3410] transition-colors"
                           >
                              <Home className="w-4 h-4 mr-2" />
                              Add Promotion
                           </Link>
                        </div>

                        {userPromotions.length === 0 ? (
                           <div className="text-center py-12">
                              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <h4 className="text-xl font-semibold text-gray-600 mb-2">No Properties Yet</h4>
                              <p className="text-gray-500 mb-6">You have not added any properties yet.</p>
                              <Link
                                 href="/map/all"
                                 className="inline-flex items-center px-6 py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#6f3410] transition-colors"
                              >
                                 <Home className="w-4 h-4 mr-2" />
                                 Add Your First Property
                              </Link>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                              {userPromotions.map((property) => (
                                 <div
                                    key={property.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                 >
                                    {/* Image */}
                                    <div className="relative h-48 w-full">
                                       <img
                                          src={property.photos?.[0] || "placeholder.svg"}
                                          alt={property.title || 'Promotion image'}
                                          className="h-48 w-full object-cover"
                                       />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                       <h4 className="text-[15px] font-semibold text-gray-900 mb-2 line-clamp-2">
                                          {property.description}
                                       </h4>
                                       {property.location && (
                                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                             {property.location}
                                          </p>
                                       )}

                                       {/* Meta row (date) */}
                                       {(property.startDateTime || property.endDateTime) && (
                                          <div className="flex items-center gap-4 text-sm mb-4">
                                             {property.endDateTime && (
                                                <div className="flex items-center gap-1 text-gray-500">
                                                   <Calendar className="h-4 w-4" />
                                                   {new Date(property.endDateTime?.toDate?.() || property.endDateTime).toLocaleDateString()}
                                                </div>
                                             )}
                                          </div>
                                       )}

                                       {/* Actions */}
                                       <div className="flex items-center justify-between">
                                          <div className="flex space-x-2">
                                             <button
                                                type="button"
                                                onClick={() => openPromotionModal(property)}
                                                className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                                             >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                             </button>
                                             <Link
                                                href={`#`}
                                                onClick={(e) => { e.preventDefault(); openEditPromotionModal(property); }}
                                                className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
                                             >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                             </Link>
                                          </div>
                                          {/* <button
                                             onClick={() => handleTogglePromotionStatus(property.id, property.status)}
                                             className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                                                property.status === 'active' 
                                                   ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                                   : 'bg-green-100 text-green-700 hover:bg-green-200'
                                             }`}
                                          >
                                             {property.status === 'active' ? 'Deactivate' : 'Activate'}
                                          </button> */}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Photo Editor Modal */}
         {photoEditor.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Update Profile Photo</h3>
                        <button
                           onClick={closePhotoEditor}
                           className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                           <X className="w-6 h-6" />
                        </button>
                     </div>

                     {/* Drag & Drop Zone */}
                     <div
                        ref={dropZoneRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${photoEditor.dragActive
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                           }`}
                     >
                        {photoEditor.preview ? (
                           <div className="space-y-4">
                              <img
                                 src={photoEditor.preview}
                                 alt="Preview"
                                 className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-100"
                              />
                              <p className="text-sm text-gray-600">
                                 {photoEditor.selectedFile?.name}
                              </p>
                              <button
                                 onClick={() => setPhotoEditor(prev => ({ ...prev, selectedFile: null, preview: null }))}
                                 className="flex items-center justify-center mx-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                 <RotateCcw className="w-4 h-4 mr-2" />
                                 Choose Different Photo
                              </button>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <div>
                                 <p className="text-lg font-medium text-gray-700 mb-2">
                                    Drop your photo here
                                 </p>
                                 <p className="text-sm text-gray-500 mb-4">
                                    or click to browse files
                                 </p>
                                 <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                 >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Choose File
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* File Input */}
                     <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                     />

                     {/* Action Buttons */}
                     <div className="flex space-x-3 mt-6">
                        <button
                           onClick={closePhotoEditor}
                           className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={uploadPhoto}
                           disabled={!photoEditor.selectedFile || photoEditor.isUploading}
                           className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                           {photoEditor.isUploading ? (
                              <>
                                 <Loader className="w-4 h-4 mr-2 animate-spin" />
                                 Uploading...
                              </>
                           ) : (
                              <>
                                 <Save className="w-4 h-4 mr-2" />
                                 Upload Photo
                              </>
                           )}
                        </button>
                     </div>

                     {/* Tips */}
                     <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Tips for best results:</h4>
                        <ul className="text-xs text-green-700 space-y-1">
                           <li>• Use a square image for best results</li>
                           <li>• Recommended size: 400x400 pixels or larger</li>
                           <li>• Supported formats: JPG, PNG, GIF</li>
                           <li>• Maximum file size: 5MB</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Promotion Detail Modal */}
         {showPromotionModal && selectedPromotion && (
            <PromotionDetailModal
               promotion={selectedPromotion}
               onClose={closePromotionModal}
            />
         )}

         {/* Promotion Edit Modal */}
         {showEditPromotionModal && selectedPromotion && (
            <AddPromotionModal
               isOpen={showEditPromotionModal}
               onClose={closeEditPromotionModal}
               location={{ lat: selectedPromotion?.place?.lat, lng: selectedPromotion?.place?.lng }}
               restaurant={selectedPromotion?.place ? { id: selectedPromotion.place.id, venueName: selectedPromotion.place.venueName, lat: selectedPromotion.place.lat, lng: selectedPromotion.place.lng } : null}
               mode="edit"
               initialPromotion={selectedPromotion}
               initialPlace={selectedPromotion?.place || null}
               onSubmit={handleEditPromotionSubmit}
            />
         )}
      </div>
   );
};

export default UserProfile;