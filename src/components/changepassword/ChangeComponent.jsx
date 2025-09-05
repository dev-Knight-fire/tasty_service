"use client";

import { useState, useEffect } from "react";
import {
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase/auth"; // Adjust path if needed
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const passwordRequirements = [
  { regex: /.{8,}/, message: "At least 8 characters" },
  { regex: /[A-Z]/, message: "At least one uppercase letter" },
  { regex: /[a-z]/, message: "At least one lowercase letter" },
  { regex: /[0-9]/, message: "At least one number" },
  { regex: /[^A-Za-z0-9]/, message: "At least one special character" },
];

const validatePassword = (password) => {
  return passwordRequirements.every((req) => req.regex.test(password));
};

const getPasswordErrors = (password) => {
  return passwordRequirements
    .filter((req) => !req.regex.test(password))
    .map((req) => req.message);
};

const ChangePasswordComponent = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const { user, loading, switchAvatar } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user.email) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!validatePassword(newPassword)) {
      setError("Password does not meet the requirements.");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is signed in.");

      // Re-authenticate
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Changed password successfully!");
    } catch (err) {
      setError(err.message == "Firebase: Error (auth/invalid-credential)."?"Incorrect password!" :"Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordErrors = newPassword ? getPasswordErrors(newPassword) : [];

  return (
    <form
      onSubmit={handleChangePassword}
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow space-y-5 my-40"
    >
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <div>
        <label className="block mb-1 font-medium">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {passwordRequirements.map((req, idx) => (
            <li
              key={idx}
              className={
                req.regex.test(newPassword) ? "text-green-600" : "text-red-600"
              }
            >
              {req.message}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label className="block mb-1 font-medium">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={isloading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-bold"
      >
        {isloading ? "Saving..." : "Change Password"}
      </button>
    </form>
  );
};

export default ChangePasswordComponent;
