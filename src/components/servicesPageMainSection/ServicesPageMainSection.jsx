"use client"
import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useLang } from "@/contexts/LangContext"
import { useAuth } from "@/contexts/AuthContext"



const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const ServicesPageMainSection = () => {
  const { messages } = useLang();
  const { user, loading } = useAuth();

  const categories = messages['addlistCategories'];

  return (
    <div className="bg-white dark:bg-gray-900 pt-16 md:pt-24">
      <div className="container mx-auto px-4">
        {/* Intro Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {messages["ecoactionsTitle"]}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            {messages["ecoactionsContent"]}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user?.setList ? (
              <Link
                href="/profile"
                className="inline-flex items-center px-6 py-3 bg-[#206645] hover:bg-[#185536] text-white font-medium rounded-lg transition-colors duration-300"
              >
                {messages["profileTitle"]}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0012 20c3.042 0 5.824-1.01 8.001-2.715M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/add-list/localFood"
                className="inline-flex items-center px-6 py-3 bg-[#206645] hover:bg-[#185536] text-white font-medium rounded-lg transition-colors duration-300"
              >
                {messages["addlistTitle"]}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </Link>
            )}
            <Link
              href="/map/all"
              className="inline-flex items-center px-6 py-3 border border-[#206645] text-[#206645] hover:bg-[#206645]/5 font-medium rounded-lg transition-colors duration-300"
            >
              {messages["exploremapTitle"]}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Categories Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
            {categories.map(cat => (
              <motion.div
                key={cat.key}
                variants={fadeIn}
                className="flex flex-col md:flex-row gap-8 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="relative h-[240px] md:h-[200px] md:w-1/3 flex-shrink-0">
                  <Image 
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-[#206645] dark:text-green-400 mb-2">{cat.title}</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{cat.subtitle}</p>
                  <ul className="mb-6 list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm">
                    {cat.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <Link
                    href={cat.cta.href}
                    className="inline-flex items-center px-5 py-2.5 bg-[#206645] hover:bg-[#185536] text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    {cat.cta.label}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default ServicesPageMainSection