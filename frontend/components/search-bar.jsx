"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [serviceType, setServiceType] = useState("doctor");
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Debounce helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearch = async (currentQuery = query) => {
    if (!currentQuery) {
      setResults([]);
      return;
    }

    const params = new URLSearchParams({ name: currentQuery });
    if (location) params.append("location", location);

    try {
      const res = await fetch(
        `http://localhost:8000/clinics/search?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch clinics");
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching clinics");
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), [location]);

  const handleClinicClick = (clinic) => {
    setSelectedClinic(clinic);
    setShowModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!email || !selectedClinic) return alert("Please enter an email.");

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("http://localhost:8000/requests/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinic_name: selectedClinic.name,
          service_type: serviceType,
          email: email,
        }),
      });

      if (!res.ok) throw new Error("Failed to send email");

      alert(`Email sent to ${email} with upload link.`);
      setShowModal(false);
      setEmail("");
      setServiceType("doctor");
    } catch (err) {
      console.error(err);
      alert("Error sending email");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-4">
      {/* Search Inputs */}
      <div className="p-3 flex items-center gap-2 flex-shrink-0">
        <Input
          placeholder="Clinic name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 h-14 text-base"
        />
        <Input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-72 h-14 text-base"
        />
        <Button onClick={() => handleSearch()} className="h-14 px-6 text-base">
          <Search />
        </Button>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center mt-3 text-muted-foreground">
          No results yet. Try searching for a doctor or clinic.
        </div>
      ) : (
        <div className="h-[600px] overflow-y-auto space-y-3">
          {results.map((clinic) => (
            <div
              key={clinic.place_id}
              onClick={() => handleClinicClick(clinic)}
              className="p-4 border rounded-lg shadow-sm bg-gray-50 dark:bg-neutral-800 cursor-pointer hover:shadow-md hover:scale-[0.995] transition-all"
            >
              <p className="font-semibold text-lg">{clinic.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {clinic.address}
              </p>
              {clinic.rating && (
                <p className="flex items-center gap-1 text-sm mt-1 text-yellow-600">
                  <Star size={16} /> {clinic.rating} (
                  {clinic.user_ratings_total ?? 0} reviews)
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedClinic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg w-96 space-y-4">
            <h2 className="text-xl font-semibold">{selectedClinic.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedClinic.address}
            </p>

            {/* Dropdown for service type */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Select Service</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="doctor">Doctor</option>
                <option value="pathology">Pathology</option>
                <option value="radiology">Radiology</option>
                <option value="physiotherapy">Physiotherapy</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Email input */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Email to send request
              </label>
              <Input
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest}>Send Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
