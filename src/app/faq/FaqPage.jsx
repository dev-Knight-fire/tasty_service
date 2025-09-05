"use client";

import FAQcomponent from '@/components/faq/FaqComponent';
import GreenBanner from '@/components/greenBanner/GreenBanner';
import PageHeader from '@/components/pageHeader/PageHeader';
import React from 'react';
import { useLang } from "@/contexts/LangContext";

const AboutUs = () => {
  const { messages } = useLang();

  return (
    <>
      {/* <PageHeader
        bgImg="/images/222.jpeg?auto=compress&cs=tinysrgb&w=600"
        pageTitle={messages["faqTitle"]}
      /> */}
      <FAQcomponent />
      <GreenBanner />
    </>
  );
};

export default AboutUs;
