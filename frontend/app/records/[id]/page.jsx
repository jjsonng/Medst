"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { healthRecordsAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RecordDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await healthRecordsAPI.getRecord(id);
        setRecord(data);
      } catch (err) {
        console.error("Failed to fetch record:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (loading) return <Skeleton className="w-full h-64" />;
  if (!record) return <p className="text-center mt-8 text-muted-foreground">Record not found.</p>;

  const {
    provider_name,
    provider_clinic,
    provider_specialty,
    visit_date,
    document_type,
    structured_data,
  } = record;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/my-records">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Record Details</h1>
      </div>

      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-2xl font-semibold text-primary">
            {document_type?.replace(/_/g, " ") || "Health Record"}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Visit Date: {visit_date || "Not available"}
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* Provider Information */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-foreground/90">Provider Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Provider Name" value={provider_name} />
              <InfoField label="Clinic" value={provider_clinic} />
              <InfoField label="Specialty" value={provider_specialty} />
            </div>
          </section>

          {/* Medical Details */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-foreground/90">Medical Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField
                label="Diagnosis"
                value={structured_data?.diagnosis?.join(", ")}
              />
              <InfoField
                label="Medications"
                value={structured_data?.medications?.join(", ")}
              />
            </div>

            <div className="mt-4">
              <InfoField
                label="Assessment"
                value={structured_data?.sections?.assessment}
                multiline
              />
            </div>
          </section>

          {/* Raw Data Fallback */}
          {record.content_text && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-foreground/90">Extracted Text</h2>
              <div className="bg-muted/30 p-3 rounded-md text-sm text-muted-foreground whitespace-pre-wrap max-h-60 overflow-y-auto">
                {record.content_text}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoField({ label, value, multiline = false }) {
  return (
    <div className="flex flex-col">
      <Label className="font-medium text-sm text-muted-foreground mb-1">
        {label}
      </Label>
      {multiline ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/20 p-2 rounded-md min-h-[60px]">
          {value || "Not available"}
        </p>
      ) : (
        <p className="text-sm bg-muted/20 p-2 rounded-md min-h-[36px] flex items-center">
          {value || "Not available"}
        </p>
      )}
    </div>
  );
}
