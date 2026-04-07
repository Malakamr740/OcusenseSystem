import { useState } from "react";
import { uploadCase } from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Alert from "../components/Alert";

/**
 * Professional UploadCasePage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - Professional file input with feedback
 * - Success message with uploaded case details
 * - Alert components for errors
 * - Loading state on submit button
 */
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
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadedCase(null);

    if (!selectedFile) {
      setError("Please choose a fundus image first.");
      return;
    }

    setLoading(true);

    try {
      const data = await uploadCase(selectedFile, token);
      setUploadedCase(data);
      setSuccess("Fundus image uploaded successfully! Your case is ready for analysis.");
      setSelectedFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message || "Failed to upload fundus image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (user?.role !== "patient") {
    return (
      <div className="page-container">
        <PageHeader 
          title="Upload Fundus Image"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="Only patients can upload fundus images for diagnosis."
          dismissible={false}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Upload Fundus Image"
        subtitle="Select a high-quality fundus image for diagnosis and analysis"
      />

      {error && (
        <Alert 
          type="danger" 
          message={error}
          dismissible={true}
          onDismiss={() => setError("")}
        />
      )}

      {success && (
        <Alert 
          type="success" 
          message={success}
          dismissible={false}
        />
      )}

      <Card title="Image Upload">
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="file" style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#333' }}>
              Select Fundus Image
              <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              id="file"
              type="file"
              className="form-control"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              style={{ padding: '0.75rem', borderRadius: '4px' }}
            />
            {selectedFile && (
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#28a745', fontWeight: '500' }}>
                ✓ Selected: {selectedFile.name}
              </small>
            )}
            <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
              Supported formats: JPG, PNG. Recommended: High-resolution fundus photos for accurate diagnosis.
            </small>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={loading}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '500' }}
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </Card>

      {uploadedCase && (
        <Card title="Case Created" style={{ marginTop: '2rem', backgroundColor: '#f0f8ff', borderColor: '#28a745' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Case ID</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: '#333' }}>
                {uploadedCase.id}
              </p>
            </div>
            <div>
              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Modality</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: '#333' }}>
                {uploadedCase.modality || "Fundus"}
              </p>
            </div>
            <div>
              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Status</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: '#007bff', fontWeight: '500' }}>
                {uploadedCase.status || "Pending Analysis"}
              </p>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
            Your fundus image has been successfully uploaded and is queued for AI analysis. You will be notified when results are ready.
          </p>
        </Card>
      )}
    </div>
  );
}