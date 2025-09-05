"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBasket,
  Leaf,
  Handshake,
  Recycle,
  Share2,
  FlaskConical,
  Wrench,
  BookOpen,
  TreePine,
  Landmark,
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

  const ecoCategories = [
    {
      id: "localFood",
      icon: <ShoppingBasket className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][0]["title"],
      description: messages["ecoCategories"][0]["description"],
    },
    {
      id: "fairTrade",
      icon: <Handshake className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][1]["title"],
      description: messages["ecoCategories"][1]["description"],
    },
    {
      id: "zeroWaste",
      icon: <Recycle className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][2]["title"],
      description: messages["ecoCategories"][2]["description"],
    },
    {
      id: "foodSharing",
      icon: <Share2 className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][3]["title"],
      description: messages["ecoCategories"][3]["description"],
    },
    {
      id: "repairPoints",
      icon: <Wrench className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][4]["title"],
      description: messages["ecoCategories"][4]["description"],
    },
    {
      id: "giveTake",
      icon: <BookOpen className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][5]["title"],
      description: messages["ecoCategories"][5]["description"],
    },
    {
      id: "bioWaste",
      icon: <TreePine className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][6]["title"],
      description: messages["ecoCategories"][6]["description"],
    },
    {
      id: "ecoMarkets",
      icon: <Landmark className="text-[#206645] dark:text-green-400 h-5 w-5" />,
      title: messages["ecoCategories"][7]["title"],
      description: messages["ecoCategories"][7]["description"],
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
              {messages["ourmissionTitle"]}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              {messages["missionContent"]}
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">{messages["verifiedplacesTitle"]}</span> — {messages["verifiedplacesContent"]}
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">{messages["communitysourcedTitle"]}</span> — {messages["communitysourcedContent"]}
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">{messages["practicalpositiveTitle"]}</span> — {messages["practicalpositiveContent"]}
                </p>
              </div>
            </div>
            <Link
              href="/map/all"
              className="inline-flex items-center px-6 py-3 bg-[#206645] hover:bg-[#a66c44] text-white font-medium rounded-lg transition-colors duration-300"
            >
              {messages["exploremapTitle"]}
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
                alt="Plantilo Map and Marketplace"
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
            {messages["whoweserveTitle"]}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {messages["whoweservesubTitle"]}
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
              <Leaf className="w-8 h-8 text-[#206645] dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {messages["ecoconsciouslocalsTitle"]}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {messages["ecoconsciouslocalsContent"]}
            </p>
          </motion.div>
          <motion.div
            variants={fadeIn}
            className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mb-6">
              <Handshake className="w-8 h-8 text-[#206645] dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {messages["businessownersTitle"]}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {messages["businessownersContent"]}
            </p>
          </motion.div>
          <motion.div
            variants={fadeIn}
            className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mb-6">
              <Recycle className="w-8 h-8 text-[#206645] dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {messages["everyoneeverywhereTitle"]}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {messages["everyoneeverywhereContent"]}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* Categories / Our Services */}
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
            {messages["plantilocategoriesTitle"]}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {messages["plantilocategoriesContent"]}
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {ecoCategories.map(cat => (
            <motion.div
              key={cat.id}
              variants={fadeIn}
              className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md"
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
            {messages["ourvaluesTitle"]}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {messages["ourvaluessubTitle"]}
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Trust */}
          <motion.div variants={fadeIn} className="text-center">
            <div className="w-20 h-20 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {messages["trustsafetyTitle"]}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {messages["trustsafetyContent"]}
            </p>
          </motion.div>
          {/* Community */}
          <motion.div variants={fadeIn} className="text-center">
            <div className="w-20 h-20 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {messages["communityTitle"]}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {messages["communityContent"]}
            </p>
          </motion.div>
          {/* Positive Change */}
          <motion.div variants={fadeIn} className="text-center">
            <div className="w-20 h-20 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#206645] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {messages["positivechangeTitle"]}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {messages["positivechangeContent"]}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  </div>
  );
};

export default AboutUsDetail;
