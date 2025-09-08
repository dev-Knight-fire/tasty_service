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
import LatestReviews from "../reviews/LatestReviews";

const TargetAudienceSection = () => {
  const { messages } = useLang();

  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            
            <span className="text-[#208822] dark:text-green-300"> {messages["homeserviceTitle1"]} </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            {messages["homeservicesubTitle"]}
          </p>
        </div>

        {/* Latest Reviews Section */}
        <div className="mb-12">
          <LatestReviews />
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
