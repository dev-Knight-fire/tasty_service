"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Utensils,
  Star,
  MapPin,
  Clock,
  Users,
  Heart,
  Award,
  TrendingUp,
  ChefHat,
  Coffee,
  Pizza,
  Cake,
} from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const AboutUsDetail = () => {
  const { messages } = useLang();

  const foodCategories = [
    {
      id: "restaurants",
      icon: <Utensils className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['restaurantsTitle'],
      description: messages['restaurantsContent'],
    },
    {
      id: "cafes",
      icon: <Coffee className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['cafescoffeeshopsTitle'],
      description: messages['cafescoffeeshopsContent'],
    },
    {
      id: "fastfood",
      icon: <Pizza className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['fastfoodTitle'],
      description: messages['fastfoodContent'],
    },
    {
      id: "desserts",
      icon: <Cake className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['dessertsTitle'],
      description: messages['dessertsContent'],
    },
    {
      id: "streetfood",
      icon: <ChefHat className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['streetfoodTitle'],
      description: messages['streetfoodContent'],
    },
    {
      id: "fine-dining",
      icon: <Award className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['finediningTitle'],
      description: messages['finediningContent'],
    },
    {
      id: "food-markets",
      icon: <MapPin className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['foodmarketsTitle'],
      description: messages['foodmarketsContent'],
    },
    {
      id: "food-blogs",
      icon: <TrendingUp className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages['foodbloggersTitle'],
      description: messages['foodbloggersContent2'],
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeIn} className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {messages['ourmissionTitle']}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                {messages['ourmissionContent']}
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">{messages['verifiedreviewsTitle']}</span> — {messages['verifiedreviewsContent']}
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">{messages['livepromotionsTitle']}</span> — {messages['livepromotionsContent']}
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">{messages['foodinspirationTitle']}</span> — {messages['foodinspirationContent']}
                  </p>
                </div>
              </div>
              <Link
                href="/map/all"
                className="inline-flex items-center px-6 py-3 bg-[#206645] hover:bg-[#a66c44] text-white font-medium rounded-lg transition-colors duration-300"
              >
                {messages['exploremapTitle']}
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
            <motion.div variants={fadeIn} className="order-1 lg:order-2">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/homehero.png"
                  alt="TastyService - Restaurant Reviews and Food Discovery"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {messages['whoweserveTitle']}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {messages['whoweservesubTitle']}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeIn}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {messages['foodenthusiastsTitle']}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {messages['foodenthusiastsContent']}
              </p>
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mb-6">
                <Utensils className="w-8 h-8 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {messages['restaurantownersTitle']}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {messages['restaurantownersContent']}
              </p>
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {messages['foodbloggersTitle']}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {messages['foodbloggersContent']}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Food Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {messages['foodcategoriesTitle']}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {messages['foodcategoriesContent']}
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {foodCategories.map(cat => (
              <motion.div
                key={cat.id}
                variants={fadeIn}
                className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center">
                    {cat.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{cat.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {messages['ourvaluesTitle']}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {messages['ourvaluessubTitle']}
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Authenticity */}
            <motion.div variants={fadeIn} className="text-center">
              <div className="w-20 h-20 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {messages['authenticityTitle']}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {messages['authenticityContent']}
              </p>
            </motion.div>
            {/* Community */}
            <motion.div variants={fadeIn} className="text-center">
              <div className="w-20 h-20 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {messages['communityTitle']}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {messages['communityContent']}
              </p>
            </motion.div>
            {/* Innovation */}
            <motion.div variants={fadeIn} className="text-center">
              <div className="w-20 h-20 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {messages['realtimeTitle']}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {messages['realtimeContent']}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsDetail;
