"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Stethoscope,
  Download,
  Clock,
  Trash2,
} from "lucide-react";
import { healthRecordsAPI } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function HealthRecordCard({ record, onDelete }) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();

  const handleOpenRecord = () => {
    router.push(`/records/${record.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getDocumentTypeColor = (docType) => {
    switch (docType?.toLowerCase()) {
      case "pathology_report":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "referral":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "gp_note":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDocumentTypeLabel = (docType) => {
    switch (docType?.toLowerCase()) {
      case "pathology_report":
        return "Pathology Report";
      case "referral":
        return "Referral";
      case "gp_note":
        return "GP Note";
      default:
        return docType || "Health Record";
    }
  };

  const generateMeaningfulTitle = (record) => {
    const docType = getDocumentTypeLabel(record.document_type);
    const provider = record.provider_name || record.provider_clinic;
    const visitDate = record.visit_date;

    if (provider && visitDate) {
      return `${docType} - ${provider} (${formatDate(visitDate)})`;
    } else if (provider) {
      return `${docType} - ${provider}`;
    } else if (visitDate) {
      return `${docType} (${formatDate(visitDate)})`;
    } else {
      return `${docType} - Record #${record.id}`;
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await healthRecordsAPI.downloadRecord(record.id);
    } catch (error) {
      console.error("Download failed:", error);
      // You could add a toast notification here
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      console.log("Attempting to delete record:", record.id);
      const result = await healthRecordsAPI.deleteRecord(record.id);
      console.log("Delete result:", result);
      onDelete?.(record.id);
      console.log("Record deleted successfully, calling onDelete callback");
      setDialogOpen(false); // Close the dialog after successful deletion
    } catch (error) {
      console.error("Delete failed:", error);
      alert(`Delete failed: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getContextSummary = (record) => {
    const sections = record.structured_data?.sections || {};
    const diagnosis = record.structured_data?.diagnosis || [];
    const medications = record.structured_data?.medications || [];

    // Build context from available information
    const contextParts = [];

    if (diagnosis.length > 0) {
      contextParts.push(`Diagnosis: ${diagnosis.slice(0, 2).join(", ")}`);
    }

    if (medications.length > 0) {
      contextParts.push(`Medications: ${medications.slice(0, 2).join(", ")}`);
    }

    if (sections.assessment) {
      contextParts.push(
        `Assessment: ${sections.assessment.substring(0, 100)}...`
      );
    } else if (sections.presenting_complaint) {
      contextParts.push(
        `Complaint: ${sections.presenting_complaint.substring(0, 100)}...`
      );
    }

    return contextParts.length > 0
      ? contextParts.join(" . ")
      : "Health record document";
  };

  return (
    <Card
      onClick={handleOpenRecord}
      className="w-full hover:shadow-md transition-shadow"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg truncate">
              {generateMeaningfulTitle(record)}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={getDocumentTypeColor(record.document_type)}>
              {getDocumentTypeLabel(record.document_type)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={downloading}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Health Record</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this health record? This
                    action cannot be undone. The file will be permanently
                    removed from storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async (e) => {
                      console.log("AlertDialogAction clicked");
                      e.stopPropagation();
                      e.preventDefault();
                      await handleDelete();
                    }}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Uploaded on {formatDate(record.created_at)}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {getContextSummary(record)}
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider Information */}
        {(record.provider_name ||
          record.provider_clinic ||
          record.provider_specialty) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Provider Information
            </h4>
            <div className="space-y-1">
              {record.provider_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{record.provider_name}</span>
                </div>
              )}
              {record.provider_clinic && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{record.provider_clinic}</span>
                </div>
              )}
              {record.provider_specialty && (
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>{record.provider_specialty}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visit Date */}
        {record.visit_date && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Visit Date
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(record.visit_date)}</span>
            </div>
          </div>
        )}

        {/* Structured Data Preview */}
        {record.structured_data &&
          Object.keys(record.structured_data).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Key Information
              </h4>
              <div className="space-y-1">
                {record.structured_data.diagnosis &&
                  record.structured_data.diagnosis.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Diagnoses: </span>
                      <span>{record.structured_data.diagnosis.join(", ")}</span>
                    </div>
                  )}
                {record.structured_data.medications &&
                  record.structured_data.medications.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Medications: </span>
                      <span>
                        {record.structured_data.medications.join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
