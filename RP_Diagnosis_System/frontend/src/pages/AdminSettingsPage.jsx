import { useEffect, useState } from "react";
import { getAppSettings, updateAppSettings } from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";

/**
 * Professional AdminSettingsPage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - Card-wrapped form sections
 * - FormField components for all inputs
 * - Professional Alert messages
 * - Loading state while fetching settings
 * - Responsive form layout
 */
export default function AdminSettingsPage() {
  const { token, user } = useAuth();

  const [form, setForm] = useState({
    hospital_name: "",
    logo_path: "",
    support_email: "",
    report_disclaimer: "",
    default_report_footer: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!token || user?.role !== "admin") return;

    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        const data = await getAppSettings(token);

        setForm({
          hospital_name: data.hospital_name || "",
          logo_path: data.logo_path || "",
          support_email: data.support_email || "",
          report_disclaimer: data.report_disclaimer || "",
          default_report_footer: data.default_report_footer || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [token, user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
    if (error) setError("");
  }

  const validateForm = () => {
    const errors = {};
    if (!form.hospital_name.trim()) {
      errors.hospital_name = "Hospital/System name is required.";
    }
    if (form.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.support_email)) {
      errors.support_email = "Please enter a valid email address.";
    }
    return errors;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError("Please fix the errors below before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateAppSettings(form, token);
      setSuccess("Settings updated successfully!");
      setFormErrors({});
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="page-container">
        <PageHeader 
          title="System Settings"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="Only administrators can access system settings."
          dismissible={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="System Settings"
          subtitle="Configure application parameters"
        />
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="System Settings"
        subtitle="Configure application parameters and organization details"
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
          dismissible={true}
          onDismiss={() => setSuccess("")}
        />
      )}

      <Card title="Organization Information">
        <form onSubmit={handleSubmit}>
          <FormField
            label="Hospital / System Name"
            type="text"
            name="hospital_name"
            value={form.hospital_name}
            onChange={handleChange}
            placeholder="Enter your organization name"
            error={formErrors.hospital_name}
            required
            helpText="This name will appear in reports and system communications"
          />

          <FormField
            label="Logo Path"
            type="text"
            name="logo_path"
            value={form.logo_path}
            onChange={handleChange}
            placeholder="e.g., /assets/logo.png"
            helpText="Path to your organization's logo file"
          />

          <FormField
            label="Support Email"
            type="email"
            name="support_email"
            value={form.support_email}
            onChange={handleChange}
            placeholder="support@example.com"
            error={formErrors.support_email}
            helpText="Email address for user support requests"
          />

          <FormField
            label="Report Disclaimer"
            type="textarea"
            name="report_disclaimer"
            value={form.report_disclaimer}
            onChange={handleChange}
            placeholder="Enter any legal disclaimers or warnings for reports..."
            rows="5"
            helpText="This text will be included in all generated diagnostic reports"
          />

          <FormField
            label="Default Report Footer"
            type="textarea"
            name="default_report_footer"
            value={form.default_report_footer}
            onChange={handleChange}
            placeholder="Enter footer text for reports (e.g., copyright, contact info)..."
            rows="3"
            helpText="Footer content will appear at the bottom of all reports"
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
              style={{ flex: '1', minWidth: '150px' }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
              disabled={saving}
              style={{ flex: '1', minWidth: '150px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}