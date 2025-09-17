"use client";
import React, { useState, useEffect } from "react";
import Logo from "../header/logo/Logo";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Heart,
  Leaf,
  ShoppingBasket,
  Handshake,
  Recycle,
  Share2,
  FlaskConical,
  Wrench,
  BookOpen,
  TreePine,
  Landmark,
  PlusCircle,
  Map,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

const currentYear = new Date().getFullYear();



const Footer = () => {
  const { messages } = useLang();
  const footerAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const [settings, setSettings] = useState({});

  const ecoCategories = [
    { icon: <ShoppingBasket size={16} />, label: messages["localfoodTitle"], href: "/map/localFood" },
    { icon: <Handshake size={16} />, label: messages["fairtradeTitle"], href: "/map/fairTrade" },
    { icon: <Recycle size={16} />, label: messages["zerowasteTitle"], href: "/map/zeroWaste" },
    { icon: <Share2 size={16} />, label: messages["foodsharingTitle"], href: "/map/foodSharing" },
    { icon: <Wrench size={16} />, label: messages["repairpointsTitle"], href: "/map/repairPoints" },
    { icon: <BookOpen size={16} />, label: messages["givetakeTitle"], href: "/map/giveTake" },
    { icon: <TreePine size={16} />, label: messages["biowasteTitle"], href: "/map/bioWaste" },
    { icon: <Landmark size={16} />, label: messages["ecomarketsTitle"], href: "/map/ecoMarkets" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDocRef = doc(db, "settings", "supportTeam_Info");
        const settingsDocSnap = await getDoc(settingsDocRef);
        const data = settingsDocSnap.data();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching admin status:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-white dark:bg-gray-900 pt-16 pb-8 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={footerAnimation}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {/* Plantilo Info */}
          <motion.div variants={itemAnimation} className="space-y-6">
            <Logo />
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {messages["footerContent"]}
            </p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com/" target="_blank" className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-[#206645] dark:text-green-400 hover:bg-[#206645] hover:text-white dark:hover:bg-green-400 dark:hover:text-gray-900 transition-colors duration-300">
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://twitter.com/" target="_blank" className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-[#206645] dark:text-green-400 hover:bg-[#206645] hover:text-white dark:hover:bg-green-400 dark:hover:text-gray-900 transition-colors duration-300">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://instagram.com/" target="_blank" className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-[#206645] dark:text-green-400 hover:bg-[#206645] hover:text-white dark:hover:bg-green-400 dark:hover:text-gray-900 transition-colors duration-300">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://linkedin.com/" target="_blank" className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-[#206645] dark:text-green-400 hover:bg-[#206645] hover:text-white dark:hover:bg-green-400 dark:hover:text-gray-900 transition-colors duration-300">
                <Linkedin size={18} />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemAnimation} className="space-y-6">
            <h3 className="text-lg font-semibold text-[#206645] dark:text-green-400">
              {messages["quicklinksTitle"]}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-[#206645] dark:hover:text-green-400 transition-colors duration-300 flex items-center">
                  <Map className="h-4 w-4 mr-2" /> {messages["homeLabel"]}
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-gray-600 dark:text-gray-300 hover:text-[#206645] dark:hover:text-green-400 transition-colors duration-300 flex items-center">
                  <Leaf className="h-4 w-4 mr-2" /> {messages["aboutusTitle"]}
                </Link>
              </li>
              <li>
                <Link href="/map/all" className="text-gray-600 dark:text-gray-300 hover:text-[#206645] dark:hover:text-green-400 transition-colors duration-300 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> {messages["getintouchTitle"]}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 dark:text-gray-300 hover:text-[#206645] dark:hover:text-green-400 transition-colors duration-300 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" /> {messages["termsofuseTitle"]}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemAnimation} className="space-y-6">
            <h3 className="text-lg font-semibold text-[#206645] dark:text-green-400">
              {messages["servicesTitle"]}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#latest-reviews"
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-[#206645] dark:hover:text-green-400 transition-colors duration-300"
                  scroll={true}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {messages["homeserviceTitle1"] || "Latest Reviews"}
                </Link>
              </li>
              <li>
                <Link
                  href="/#latest-promotions"
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-[#206645] dark:hover:text-green-400 transition-colors duration-300"
                  scroll={true}
                >
                  <ShoppingBasket className="mr-2 h-4 w-4" />
                  {messages["promotionsTitle"] || "Promotions"}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemAnimation} className="space-y-6">
            <h3 className="text-lg font-semibold text-[#206645] dark:text-green-400">
              {messages["contactTitle"]}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#206645] dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{settings?.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-[#206645] dark:text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{settings?.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-[#206645] dark:text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{settings?.email}</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-1">
            © {currentYear} TastyService
            <Heart size={14} className="inline-block text-[#a66c44] mx-1" />
            {messages["copyboxContent"]}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
