"use client"
import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useLang } from "@/contexts/LangContext"
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
  ShoppingBag,
  Camera,
} from "lucide-react"

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

  const foodCategories = [
    {
      key: "restaurants",
      title: "Restaurants",
      subtitle: "Discover amazing dining experiences and authentic cuisines from around the world.",
      image: "/images/restaurants.jpg",
      features: [
        "Fine dining establishments",
        "Casual dining spots",
        "International cuisines",
        "Local favorites",
        "Family-friendly options"
      ],
      icon: <Utensils className="w-6 h-6 text-[#206645] dark:text-green-400" />
    },
    {
      key: "cafes",
      title: "Cafes & Coffee Shops",
      subtitle: "Find the perfect spot for your morning coffee or afternoon tea break.",
      image: "/images/cafes.jpg",
      features: [
        "Artisan coffee shops",
        "Cozy tea houses",
        "Work-friendly spaces",
        "Fresh pastries",
        "Specialty drinks"
      ],
      icon: <Coffee className="w-6 h-6 text-[#206645] dark:text-green-400" />
    },
    {
      key: "fastfood",
      title: "Fast Food & Quick Bites",
      subtitle: "Quick and delicious meals for when you are on the go.",
      image: "/images/fastfood.jpg",
      features: [
        "Burger joints",
        "Pizza places",
        "Sandwich shops",
        "Food trucks",
        "Drive-through options"
      ],
      icon: <Pizza className="w-6 h-6 text-[#206645] dark:text-green-400" />
    },
    {
      key: "desserts",
      title: "Desserts & Sweet Treats",
      subtitle: "Indulge in the finest desserts and sweet delicacies.",
      image: "/images/desserts.jpg",
      features: [
        "Ice cream parlors",
        "Bakeries",
        "Chocolate shops",
        "Candy stores",
        "Specialty desserts"
      ],
      icon: <Cake className="w-6 h-6 text-[#206645] dark:text-green-400" />
    },
    {
      key: "streetfood",
      title: "Street Food",
      subtitle: "Experience authentic local flavors from street vendors and food trucks.",
      image: "/images/streetfood.jpg",
      features: [
        "Food trucks",
        "Street vendors",
        "Local specialties",
        "Authentic flavors",
        "Budget-friendly options"
      ],
      icon: <ChefHat className="w-6 h-6 text-[#206645] dark:text-green-400" />
    },
    {
      key: "fine-dining",
      title: "Fine Dining",
      subtitle: "Upscale restaurants offering exceptional culinary experiences.",
      image: "/images/finedining.jpg",
      features: [
        "Michelin-starred restaurants",
        "Wine pairings",
        "Chef tasting menus",
        "Elegant ambiance",
        "Premium ingredients"
      ],
      icon: <Award className="w-6 h-6 text-[#206645] dark:text-green-400" />
    },
    {
      key: "food-markets",
      title: "Food Markets",
      subtitle: "Fresh ingredients and local produce from vibrant food markets.",
      image: "/images/foodmarkets.jpg",
      features: [
        "Fresh produce",
        "Local vendors",
        "Organic options",
        "Artisan products",
        "Seasonal specialties"
      ],
      icon: <ShoppingBag className="w-6 h-6 text-[#206645] dark:text-green-400" />
    },
    {
      key: "food-blogs",
      title: "Food Bloggers",
      subtitle: "Follow your favorite food influencers and discover new culinary trends.",
      image: "/images/foodblogs.jpg",
      features: [
        "Food photography",
        "Recipe sharing",
        "Restaurant reviews",
        "Culinary trends",
        "Food inspiration"
      ],
      icon: <Camera className="w-6 h-6 text-[#206645] dark:text-green-400" />
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 pt-16 md:pt-24">
      <div className="container mx-auto px-4">
        {/* Intro Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Discover Amazing Food Experiences
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            TastyService brings together authentic restaurant reviews, real-time promotions, and inspiring food content. 
            Whether you are looking for a quick bite, fine dining experience, or food inspiration, we have got you covered.
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              variants={fadeIn}
              className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Authentic Reviews
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Read genuine reviews from real customers who have experienced these restaurants firsthand.
              </p>
            </motion.div>
            
            <motion.div
              variants={fadeIn}
              className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Live Promotions
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Discover current deals, special offers, and limited-time menu items from restaurants near you.
              </p>
            </motion.div>
            
            <motion.div
              variants={fadeIn}
              className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-16 h-16 bg-[#206645]/10 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#206645] dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Food Inspiration
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Get inspired by food bloggers and discover new culinary trends and hidden gems.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Categories Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Food Categories
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Explore diverse culinary experiences across different types of dining establishments and food experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {foodCategories.map(cat => (
              <motion.div
                key={cat.key}
                variants={fadeIn}
                className="flex flex-col md:flex-row gap-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-[200px] md:h-[180px] md:w-1/3 flex-shrink-0">
                  <Image 
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center">
                      {cat.icon}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <h2 className="text-xl font-bold text-[#206645] dark:text-green-400 mb-2">{cat.title}</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">{cat.subtitle}</p>
                  <ul className="mb-4 list-disc ml-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                    {cat.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  {cat.features.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{cat.features.length - 3} more features
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Thousands of food lovers are already discovering amazing restaurants and sharing their experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div variants={fadeIn} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#206645] dark:text-green-400 mb-2">10K+</div>
              <div className="text-gray-700 dark:text-gray-300">Restaurants</div>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#206645] dark:text-green-400 mb-2">50K+</div>
              <div className="text-gray-700 dark:text-gray-300">Reviews</div>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#206645] dark:text-green-400 mb-2">5K+</div>
              <div className="text-gray-700 dark:text-gray-300">Active Promotions</div>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#206645] dark:text-green-400 mb-2">100+</div>
              <div className="text-gray-700 dark:text-gray-300">Food Bloggers</div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default ServicesPageMainSection