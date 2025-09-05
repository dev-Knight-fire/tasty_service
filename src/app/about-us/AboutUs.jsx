"use client";

import AboutUsDetail from '@/components/mission/Mission';
import GreenBanner from '@/components/greenBanner/GreenBanner';
import React from 'react';
import { useLang } from "@/contexts/LangContext";

const AboutUs = () => {
  const { messages } = useLang();

  return (
    <>
      <AboutUsDetail />
      <GreenBanner />
    </>
  );
};

export default AboutUs;
