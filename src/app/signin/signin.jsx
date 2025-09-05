"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, AtSign, Eye, EyeOff, Facebook, Lock } from 'lucide-react';
import Logo from "../../components/header/logo/Logo";

import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useLang } from "@/contexts/LangContext";

// Validation functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length > 0;
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const {messages} = useLang();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    let valid = true;

    if (!email) {
      setEmailError(messages['fillallfieldsTitle'] || "Please fill in all fields.");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError(messages['invalidemailTitle'] || "Invalid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError(messages['fillallfieldsTitle'] || "Please fill in all fields.");
      valid = false;
    }

    if (!valid) return;

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // or your desired post-login page
    } catch (err) {
      setError(messages['invalidsigninTitle'] || "Invalid email or password. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if the user already exists in Firestore
      const userDocRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          enabled: true,
          isAdministrator: false,
          setList: false,
          role: "",
          status: "pending",
          username: user.displayName,
          userid: user.email,
        });
      }
      router.push("/");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-[#0077C8] to-[#0099FF] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/10"></div>
            <h1 className="text-3xl font-bold text-white relative z-10">
              {messages['welcomebackTitle']}
            </h1>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Social Sign In */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <Image
                  src="/icons/google.png"
                  alt="Google"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {messages['signinwithgoogleTitle']}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-8">
              <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {messages['orTitle']}
              </span>
              <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
            </div>

            {/* Email Form */}
          

            {/* Sign Up Link */}
            {/* <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {messages['donotaccountTitle']}{" "}
                <Link
                  href="/signup"
                  className="font-medium text-[#0077C8] dark:text-[#3b9ede] hover:underline"
                >
                  {messages['signupTitle']}
                </Link>
              </p>
            </div> */}
          </div>
        </div>

        {/* Brand */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center">
            <Logo />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
