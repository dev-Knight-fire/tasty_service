import MapComponent from "@/components/map/MapComponent"
import { Toaster } from "react-hot-toast";
export const metadata = {
  title: "TASTYSERVICE | Map",
  description:
    "Explore eco-friendly places on an interactive map. Find local sustainable businesses, zero-waste shops, and community initiatives near you.",
}
export default function Map({ params }) {
  const { category } = params;
  return <>
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
    <MapComponent category={category} />
  </>
}