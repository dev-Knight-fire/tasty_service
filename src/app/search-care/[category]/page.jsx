import SearchCarePage from "@/components/searchCarePage/SearchCarePage"

export const metadata = {
  title: "TASTYSERVICE | Search for Care",
  description:
    "Find the perfect care solution for your loved ones. Search through verified care homes, caregivers, and support services.",
}

export default function SearchCare({params}) {
  const {category} = params;
  return <SearchCarePage category = {category}/>
}