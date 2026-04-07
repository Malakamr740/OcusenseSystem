import { useEffect, useState } from "react";
import {
  getAllModels,
  createModel,
  updateModel,
  deleteModel,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import FormField from "../components/FormField";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";

/**
 * Professional AdminModelsPage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - Two Card sections: form (add/edit) and table (list)
 * - FormField components for all inputs
 * - DataTable component for model list
 * - Professional Alert messages
 * - Loading state handling
 * - StatusBadge for active/inactive status
 */
export default function AdminModelsPage() {
  const { token, user } = useAuth();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

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
    setFormErrors({});
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
    if (error) setError("");
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
    setFormErrors({});
  }

  const validateForm = () => {
    const errors = {};
    if (!form.task_type.trim()) {
      errors.task_type = "Task type is required.";
    }
    if (!form.model_name.trim()) {
      errors.model_name = "Model name is required.";
    }
    if (!form.model_version.trim()) {
      errors.model_version = "Model version is required.";
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
    return (
      <div className="page-container">
        <PageHeader 
          title="Model Registry"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="Only administrators can manage the model registry."
          dismissible={false}
        />
      </div>
    );
  }

  const tableColumns = [
    { key: "task_type", label: "Task Type" },
    { key: "model_name", label: "Model Name" },
    { key: "model_version", label: "Version" },
    { key: "framework", label: "Framework" },
    { key: "is_active", label: "Status", render: (value) => (
      <StatusBadge status={value ? "active" : "inactive"} />
    )},
  ];

  const tableActions = [
    {
      label: "Edit",
      onClick: (model) => handleEdit(model),
      variant: "primary",
    },
    {
      label: "Delete",
      onClick: (model) => handleDelete(model.id),
      variant: "danger",
    },
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Model Registry"
        subtitle="Manage ML models and their configurations"
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

      <Card title={editingId ? "Edit Model" : "Add New Model"}>
        <form onSubmit={handleSubmit}>
          <FormField
            label="Task Type"
            type="text"
            name="task_type"
            placeholder="e.g., classification, segmentation"
            value={form.task_type}
            onChange={handleChange}
            error={formErrors.task_type}
            required
            helpText="Type of machine learning task (classification / segmentation / detection)"
          />

          <FormField
            label="Model Name"
            type="text"
            name="model_name"
            placeholder="e.g., ResNet50, U-Net"
            value={form.model_name}
            onChange={handleChange}
            error={formErrors.model_name}
            required
            helpText="Name identifier for the model"
          />

          <FormField
            label="Model Version"
            type="text"
            name="model_version"
            placeholder="e.g., 1.0.0"
            value={form.model_version}
            onChange={handleChange}
            error={formErrors.model_version}
            required
            helpText="Version number (semantic versioning recommended)"
          />

          <FormField
            label="Framework"
            type="text"
            name="framework"
            placeholder="e.g., PyTorch, TensorFlow, ONNX"
            value={form.framework}
            onChange={handleChange}
            helpText="ML framework used (PyTorch / TensorFlow / ONNX / etc.)"
          />

          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              style={{ marginRight: '0.5rem', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="is_active" style={{ cursor: 'pointer', fontWeight: '500', color: '#333' }}>
              Model is Active
            </label>
            <span style={{ fontSize: '0.875rem', color: '#666', marginLeft: '0.5rem' }}>
              Active models are available for prediction tasks
            </span>
          </div>

          <FormField
            label="Notes"
            type="textarea"
            name="notes"
            placeholder="Enter any additional notes about this model..."
            value={form.notes}
            onChange={handleChange}
            rows="4"
            helpText="Additional documentation or implementation notes"
          />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
              style={{ flex: '1', minWidth: '150px' }}
            >
              {saving ? "Saving..." : (editingId ? "Update Model" : "Create Model")}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={saving}
                style={{ flex: '1', minWidth: '150px' }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title="All Models" style={{ marginTop: '2rem' }}>
        {loading && <LoadingState message="Loading models..." />}

        {!loading && models.length === 0 && (
          <p style={{ color: '#666', padding: '2rem', textAlign: 'center' }}>
            No models registered yet. Create your first model above.
          </p>
        )}

        {!loading && models.length > 0 && (
          <DataTable 
            columns={tableColumns}
            data={models}
            actions={tableActions}
          />
        )}
      </Card>
    </div>
  );
}