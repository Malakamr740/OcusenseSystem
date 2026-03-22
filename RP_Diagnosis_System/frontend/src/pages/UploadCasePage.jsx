import { useState } from "react";
import { uploadCase } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function UploadCasePage() {
  const { token, user } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedCase, setUploadedCase] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadedCase(null);

    if (!selectedFile) {
      setError("Please choose an image first.");
      return;
    }

    setLoading(true);

    try {
      const data = await uploadCase(selectedFile, token);
      setUploadedCase(data);
      setSuccess("Case uploaded successfully.");
      setSelectedFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (user?.role !== "patient") {
    return <p>Only patients can upload cases.</p>;
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Upload Fundus Image</h2>
      <p>Select a fundus image to create a new case.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Case"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {uploadedCase && (
        <div style={{ marginTop: 20, padding: 12, border: "1px solid #ddd" }}>
          <h3>Uploaded Case</h3>
          <p><strong>Case ID:</strong> {uploadedCase.id}</p>
          <p><strong>Modality:</strong> {uploadedCase.modality}</p>
          <p><strong>Status:</strong> {uploadedCase.status}</p>
          <p><strong>Image Path:</strong> {uploadedCase.image_path}</p>
        </div>
      )}
    </div>
  );
}