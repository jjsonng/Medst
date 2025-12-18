const API_BASE_URL = "http://localhost:8000";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Authorization": `Bearer ${token}`,
  };
};

// Health Records API
export const healthRecordsAPI = {
  // Fetch all health records for the current user
  async getRecords() {
    const response = await fetch(`${API_BASE_URL}/records/`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.statusText}`);
    }

    return response.json();
  },

  // Upload a new health record file
  async uploadRecord(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/records/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Failed to upload record: ${response.statusText}`
      );
    }

    return response.json();
  },

  // Get a specific health record by ID
  async getRecord(recordId) {
    const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch record: ${response.statusText}`);
    }

    return response.json();
  },

  // Download a health record file
  async downloadRecord(recordId) {
    const response = await fetch(
      `${API_BASE_URL}/records/${recordId}/download`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download record: ${response.statusText}`);
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `health_record_${recordId}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Delete a health record
  async deleteRecord(recordId) {
    console.log("API: Deleting record with ID:", recordId);
    const url = `${API_BASE_URL}/records/${recordId}`;
    console.log("API: Making request to:", url);
    console.log("API: Request method: DELETE");
    console.log("API: Auth headers:", getAuthHeaders());

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      console.log("API: Delete response status:", response.status);
      console.log("API: Delete response ok:", response.ok);
      console.log(
        "API: Delete response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: response.statusText };
        }
        console.error("API: Delete error response:", errorData);
        throw new Error(
          errorData.detail || `Failed to delete record: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("API: Delete success result:", result);
      return result;
    } catch (error) {
      console.error("API: Delete request failed:", error);
      throw error;
    }
  },

  async getRecord(id) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`http://localhost:8000/records/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch record");
    return res.json();
  },
};
