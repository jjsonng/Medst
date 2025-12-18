"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthRecordCard } from "@/components/health-record-card";
import { FileUpload } from "@/components/file-upload";
import { healthRecordsAPI } from "@/lib/api";
import { Plus, AlertCircle } from "lucide-react";
import AuthChecker from "@/components/auth-checker";

export default function Page() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthRecordsAPI.getRecords();
      setRecords(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      setError(null);
      const newRecord = await healthRecordsAPI.uploadRecord(file);
      setRecords(prev => [newRecord, ...prev]);
      setShowUpload(false);
    } catch (err) {
      setError(err.message);
      console.error("Failed to upload record:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = (recordId) => {
    console.log('Parent: handleDeleteRecord called with recordId:', recordId);
    console.log('Parent: Current records before deletion:', records.length);
    setRecords(prev => {
      const filtered = prev.filter(record => record.id !== recordId);
      console.log('Parent: Records after filtering:', filtered.length);
      return filtered;
    });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <AuthChecker>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          </header>
          
          <div className="flex flex-col items-center justify-left h-20 text-center">
            <h1 className="text-5xl font-bold">
              My Health Records
            </h1>
            <h2 className="text-lg mt-5">
              A view of your health journey.
            </h2>
          </div>

          <div className="flex flex-1 flex-col p-4 pt-0">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Section */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-end">
                <Button
                  onClick={() => setShowUpload(!showUpload)}
                  disabled={uploading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showUpload ? 'Cancel Upload' : 'Add Record'}
                </Button>
              </div>
              
              {showUpload && (
                <FileUpload
                  onFileSelect={() => {}} // We handle file selection in the upload component
                  onUpload={handleFileUpload}
                  loading={uploading}
                />
              )}
            </div>

            {/* Records List - Takes remaining space */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Your Records ({records.length})
                </h3>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Plus className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No health records yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your first health record to get started
                    </p>
                    <Button onClick={() => setShowUpload(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Your First Record
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {records.map((record) => (
                    <HealthRecordCard 
                      key={record.id} 
                      record={record} 
                      onDelete={handleDeleteRecord}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthChecker>
  );
}
