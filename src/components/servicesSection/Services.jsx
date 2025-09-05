"use client";

import { motion } from "framer-motion";
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
  PlusCircle,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";


const TargetAudienceSection = () => {
  const { messages } = useLang();

  const plantiloCategories = [
    {
      icon: <ShoppingBasket className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["localfoodTitle"],
      description: "Small local shops with fruit, vegetables, bread, and handmade goods from nearby farmers.",
      img: "/images/localfood.jpg",
      href: "/map/localFood",
    },
    {
      icon: <Handshake className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["fairtradeTitle"],
      description: "Brands and shops that care about ethical sourcing and sustainable practices.",
      img: "/images/fair_trade.jpg",
      href: "/map/fairTrade",
    },
    {
      icon: <Recycle className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["zerowasteTitle"],
      description: "No-packaging zones, ugly veggies, and low-waste concepts.",
      img: "/images/zero_waste.jpg",
      href: "/map/zeroWaste",
    },
    {
      icon: <Share2 className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["foodsharingTitle"],
      description: "Community fridges and shelves where you can give or take edible food.",
      img: "/images/food_sharing.jpeg",
      href: "/map/foodSharing",
    },
    {
      icon: <Wrench className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["repairpointsTitle"],
      description: "From tailors and cobblers to electronic repair or tool-sharing workshops.",
      img: "/images/repair_points.jpg",
      href: "/map/repairPoints",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["givetakeTitle"],
      description: "Book shelves, clothing swaps, and local sharing corners.",
      img: "/images/clothing_swap.png",
      href: "/map/giveTake",
    },
    {
      icon: <TreePine className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["biowasteTitle"],
      description: "Drop-off points for kitchen scraps or compost.",
      img: "/images/bio_waste.jpg",
      href: "/map/bioWaste",
    },
    {
      icon: <Landmark className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["ecomarketsTitle"],
      description: "Local, seasonal eco-friendly markets and bazaars.",
      img: "/images/eco_market.jpeg",
      href: "/map/ecoMarkets",
    },
    {
      icon: <TrashIcon className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["resinwasteTitle"],
      description: "Drop-off points for resin waste.",
      img: "/images/resin_waste.jpeg",
      href: "/map/resinWaste",
    }
  ];

  const targetAudiences = [
    {
      icon: <Leaf className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["ecoconsciouslocalsTitle"],
      description: messages["ecoconsciouslocalsDescription"],
    },
    {
      icon: <Share2 className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["communitybuildersTitle"],
      description: messages["communitybuildersDescription"],
    },
    {
      icon: <PlusCircle className="h-6 w-6 text-[#206645] dark:text-green-400" />,
      title: messages["businessownersTitle"],
      description: messages["businessownersDescription"],
    },
  ];

  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {messages["homeserviceTitle1"]}
            <span className="text-[#206645] dark:text-green-400"> Plantilo </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            {messages["homeservicesubTitle"]}
          </p>
        </div>
        {/* Categories Grid */}
        <div className="flex flex-wrap justify-center gap-7 mb-12">
          {plantiloCategories.map(({ icon, title, description, img, href }) => (
            <Link
              key={title}
              href={href}
              className="w-64 bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#206645] flex flex-col"
            >
              <div className="relative h-40 w-full">
                <Image src={img} alt={title} fill className="object-cover" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#f3f7f3] dark:bg-green-900/20">
                {icon}
                <h3 className="text-lg font-semibold text-[#206645] dark:text-green-400">{title}</h3>
              </div>
              {/* <div className="px-4 pb-4 text-gray-600 dark:text-gray-300 text-sm">{description}</div> */}
            </Link>
          ))}
          {/* Add Your Place CTA */}
          <Link
            href="/add-list/localFood"
            className="flex flex-col items-center justify-center w-64 h-52 bg-[#a66c44] hover:bg-[#82522f] text-white font-semibold rounded-2xl shadow-md transition-colors text-center p-6"
          >
            <PlusCircle className="w-10 h-10 mb-3" />
            <span className="text-lg">{messages["addprofileTitle"]}</span>
            {/* <span className="text-sm mt-1 font-normal">Join Plantilo’s growing map</span> */}
          </Link>
        </div>
        {/* Target Audience Cards */}
        <div className="flex flex-wrap justify-center gap-7">
          {targetAudiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 w-full sm:w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md"
            >
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4 flex-shrink-0">
                  {audience.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                    {audience.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                    {audience.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
