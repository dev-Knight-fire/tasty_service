"use client"
import PageHeader from '@/components/pageHeader/PageHeader'
import ServicesPageMainSection from '@/components/servicesPageMainSection/ServicesPageMainSection';
import GreenBanner from '@/components/greenBanner/GreenBanner';
import React from 'react';
import { useLang } from '@/contexts/LangContext';

const TermsOfUse = () => {
    const {messages} = useLang();
  return (
    <>
      <ServicesPageMainSection />
      <GreenBanner />
    </>
  );
}

export default TermsOfUse;