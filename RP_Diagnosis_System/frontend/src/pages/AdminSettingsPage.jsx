import { useEffect, useState } from "react";
import { getAppSettings, updateAppSettings } from "../api";
import { useAuth } from "../auth/AuthContext";

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
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateAppSettings(form, token);
      setSuccess("Settings updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  if (user?.role !== "admin") {
    return <p>Only admins can view this page.</p>;
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>App Settings</h2>

      {loading && <p>Loading settings...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {!loading && (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label>
            Hospital / System Name
            <input
              type="text"
              name="hospital_name"
              value={form.hospital_name}
              onChange={handleChange}
            />
          </label>

          <label>
            Logo Path
            <input
              type="text"
              name="logo_path"
              value={form.logo_path}
              onChange={handleChange}
            />
          </label>

          <label>
            Support Email
            <input
              type="email"
              name="support_email"
              value={form.support_email}
              onChange={handleChange}
            />
          </label>

          <label>
            Report Disclaimer
            <textarea
              name="report_disclaimer"
              rows="5"
              value={form.report_disclaimer}
              onChange={handleChange}
            />
          </label>

          <label>
            Default Report Footer
            <textarea
              name="default_report_footer"
              rows="3"
              value={form.default_report_footer}
              onChange={handleChange}
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
}