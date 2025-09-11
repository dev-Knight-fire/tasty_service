import Hero from "@/components/hero/Hero";
import LatestPromotions from "@/components/promotionSection/LatestPromotions";
import Services from "@/components/servicesSection/Services";
import GreenBanner from "@/components/greenBanner/GreenBanner";
import Influencers from "@/components/influencers/Influencers";


export default function Home() {
  return (
    <>
      <Hero />
      <Services/>
      <LatestPromotions/>
      <Influencers/>
      <GreenBanner/>
      
    </>
  );
}
