"use client";

import { Star } from "lucide-react";

export default function ClinicResults({ results }) {

  return (
    <div className="h-[500px] w-full mt-6 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <div className="grid gap-4">
        {results.map((clinic) => (
          <div
            key={clinic.place_id}
            className="w-full p-4 border rounded-lg shadow hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer bg-white dark:bg-neutral-800"
          >
            <div className="mb-2">
              <h3 className="text-xl font-semibold">{clinic.name}</h3>
              <p className="text-sm text-muted-foreground">{clinic.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500 h-4 w-4" />
              <span>{clinic.rating ?? "N/A"}</span>
              <span className="text-sm text-muted-foreground">
                ({clinic.user_ratings_total ?? 0} reviews)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
