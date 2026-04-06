import { useEffect, useState } from "react";
import {
  getAllModels,
  createModel,
  updateModel,
  deleteModel,
} from "../api";
import { useAuth } from "../auth/AuthContext";

export default function AdminModelsPage() {
  const { token, user } = useAuth();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    task_type: "",
    model_name: "",
    model_version: "",
    framework: "",
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    loadModels();
  }, [token, user]);

  async function loadModels() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllModels(token);
      setModels(data);
    } catch (err) {
      setError(err.message || "Failed to load models");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      task_type: "",
      model_name: "",
      model_version: "",
      framework: "",
      is_active: true,
      notes: "",
    });
    setEditingId(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleEdit(model) {
    setEditingId(model.id);
    setForm({
      task_type: model.task_type || "",
      model_name: model.model_name || "",
      model_version: model.model_version || "",
      framework: model.framework || "",
      is_active: model.is_active ?? true,
      notes: model.notes || "",
    });
    setSuccess("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await updateModel(editingId, form, token);
        setSuccess("Model updated successfully.");
      } else {
        await createModel(form, token);
        setSuccess("Model created successfully.");
      }

      resetForm();
      await loadModels();
    } catch (err) {
      setError(err.message || "Failed to save model");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(modelId) {
    if (!confirm("Are you sure you want to delete this model?")) return;

    try {
      setError("");
      setSuccess("");

      await deleteModel(modelId, token);
      setSuccess("Model deleted successfully.");
      await loadModels();
    } catch (err) {
      setError(err.message || "Failed to delete model");
    }
  }

  if (user?.role !== "admin") {
    return <p>Only admins can view this page.</p>;
  }

  return (
    <div>
      <h2>Model Registry</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
          background: "#fff",
          color: "#111",
        }}
      >
        <h3>{editingId ? "Edit Model" : "Add New Model"}</h3>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            type="text"
            name="task_type"
            placeholder="Task Type (classification / segmentation / ...)"
            value={form.task_type}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="model_name"
            placeholder="Model Name"
            value={form.model_name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="model_version"
            placeholder="Model Version"
            value={form.model_version}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="framework"
            placeholder="Framework (pytorch / tensorflow / onnx)"
            value={form.framework}
            onChange={handleChange}
          />

          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Active
          </label>

          <textarea
            name="notes"
            placeholder="Notes"
            rows="4"
            value={form.notes}
            onChange={handleChange}
          />

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Model" : "Create Model"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <h3>All Models</h3>

      {loading && <p>Loading models...</p>}

      {!loading && models.length === 0 && <p>No models found.</p>}

      {!loading && models.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Task</th>
              <th>Name</th>
              <th>Version</th>
              <th>Framework</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {models.map((model) => (
              <tr key={model.id} style={{ borderTop: "1px solid #ddd" }}>
                <td>{model.task_type}</td>
                <td>{model.model_name}</td>
                <td>{model.model_version}</td>
                <td>{model.framework || "-"}</td>
                <td>{model.is_active ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleEdit(model)}>Edit</button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}