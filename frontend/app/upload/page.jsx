"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";

export default function UploadPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success" | "error" | ""

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8000/records/tupload?token=${token}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Upload successful.");
        setStatus("success");
        setFile(null);
      } else {
        setMessage(data.detail || "Upload failed. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <Card className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
            <Upload className="w-6 h-6 text-white" />
            Upload Patient Records
          </CardTitle>
          <p className="text-sm text-zinc-400 mt-1">
            Securely upload files using your unique link
          </p>
        </CardHeader>

        <CardContent>
          {token ? (
            <form onSubmit={handleUpload} className="space-y-5 mt-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Select a file
                </label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="bg-zinc-900 border-zinc-700 text-white cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                disabled={!file}
                className="w-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {file ? "Upload File" : "Choose a File First"}
              </Button>

              {message && (
                <div
                  className={`mt-4 flex items-center gap-2 text-sm rounded-md px-3 py-2 border ${
                    status === "success"
                      ? "border-zinc-700 bg-zinc-900 text-zinc-200"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-white" />
                  )}
                  <span>{message}</span>
                </div>
              )}
            </form>
          ) : (
            <div className="text-center py-6">
              <AlertTriangle className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="font-medium text-zinc-300">
                Invalid or missing upload token.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
