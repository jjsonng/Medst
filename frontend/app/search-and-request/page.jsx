"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthChecker from "@/components/auth-checker";
import SearchBar from "@/components/search-bar";
import ClinicResults from "@/components/clinic-results";

export default function Page() {
  const [results, setResults] = useState([]);

  return (
    <AuthChecker>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-20 text-center mt-20 mb-10">
            <h1 className="text-5xl font-bold">
              Find your Healthcare Providers
            </h1>
            <h2 className="text-lg mt-5">
              Search for doctors and clinics, then request your health records securely
            </h2>
          </div>
          <SearchBar onResults={setResults} />
          <ClinicResults results={results} />
        </SidebarInset>
      </SidebarProvider>
    </AuthChecker>
  );
}
