import React from "react";
import ContactUs from "@/components/contactUs/ContactUs";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "TASTYSERVICE | Contact Us",
  description:
    "Get in touch with our senior care specialists. We're here to help you and your loved ones.",
};

export default function ContactPage() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              border: "1px solid #206645",
              padding: "16px",
              color: "#206645",
            },
            iconTheme: {
              primary: "#206645",
              secondary: "#F0FDF4",
            },
          },
          error: {
            style: {
              border: "1px solid #DC2626",
              padding: "16px",
              color: "#DC2626",
            },
            iconTheme: {
              primary: "#DC2626",
              secondary: "#FEE2E2",
            },
          },
        }}
      />
      <ContactUs />
    </>
  );
}
