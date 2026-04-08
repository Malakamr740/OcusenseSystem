import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getAllModels, deleteModel, createModel, updateModel } from "../api";
import { useAuth } from "../auth/AuthContext";

const defaultModelForm = {
  task_type: "classification",
  model_name: "",
  model_version: "",
  framework: "",
  is_active: true,
  notes: "",
};

export default function AdminModelRegistryPage() {
  const { token } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modelForm, setModelForm] = useState(defaultModelForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getAllModels(token);
        setModels(data);
      } catch (err) {
        setError(err.message || "Failed to load models");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchModels();
    }
  }, [token]);

  const handleDelete = async (modelId) => {
    try {
      await deleteModel(modelId, token);
      setModels(models.filter((m) => m.id !== modelId));
    } catch (err) {
      setError(err.message || "Failed to delete model");
    }
  };

  const openConfirmToggle = (model) => {
    setSelectedModel(model);
    setConfirmAction(model.is_active ? "deactivate" : "activate");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedModel(null);
    setConfirmAction("");
  };

  const handleConfirmToggle = async () => {
    if (!selectedModel) return;
    try {
      const updatedModel = await updateModel(
        selectedModel.id,
        { is_active: !selectedModel.is_active },
        token
      );
      setModels((current) =>
        current.map((item) => (item.id === updatedModel.id ? updatedModel : item))
      );
      closeConfirm();
    } catch (err) {
      setError(err.message || "Failed to update model status");
      closeConfirm();
    }
  };

  const openDialog = () => {
    setFormError("");
    setModelForm(defaultModelForm);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field, value) => {
    setModelForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmitModel = async () => {
    setFormError("");
    setSaving(true);
    try {
      const newModel = await createModel(modelForm, token);
      setModels((current) => [newModel, ...current]);
      closeDialog();
    } catch (err) {
      setFormError(err.message || "Failed to register new model");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Model Registry">
        <PageHeader
          eyebrow="Admin"
          title="Model registry"
          subtitle="Track deployed model names, versions, purposes, and operational status."
          actions={
            <Button variant="contained" onClick={openDialog}>
              Register model
            </Button>
          }
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }
  return (
    <MainLayout title="Model Registry">
      <PageHeader
        eyebrow="Admin"
        title="Model registry"
        subtitle="Track deployed model names, versions, purposes, and operational status."
        actions={
          <Button variant="contained" onClick={openDialog}>
            Register model
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {models.length === 0 && !error && (
        <Alert severity="info">No models registered yet.</Alert>
      )}

      <Card>
        <CardContent sx={{ p: 1.5 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {models.map((row) => (
                  <TableRow key={`${row.id}`} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{row.model_name}</Typography>
                      {row.framework ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {row.framework}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{row.model_version}</TableCell>
                    <TableCell>{row.task_type}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.is_active ? "Active" : "Inactive"} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={row.is_active ? "Deactivate model" : "Activate model"}>
                        <IconButton
                          size="small"
                          onClick={() => openConfirmToggle(row)}
                          sx={{
                            color: row.is_active ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {row.is_active ? (
                            <ToggleOnOutlinedIcon />
                          ) : (
                            <ToggleOffOutlinedIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Button variant="text" size="small" color="error" onClick={() => handleDelete(row.id)}>
                        <DeleteOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Register new model</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="task-type-label">Task type</InputLabel>
              <Select
                labelId="task-type-label"
                value={modelForm.task_type}
                label="Task type"
                onChange={(event) => handleFormChange("task_type", event.target.value)}
              >
                <MenuItem value="classification">Classification</MenuItem>
                <MenuItem value="severity">Severity</MenuItem>
                <MenuItem value="gradcam">GradCAM</MenuItem>
                <MenuItem value="segmentation">Segmentation</MenuItem>
                <MenuItem value="retargeting">Retargeting</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Model name"
              value={modelForm.model_name}
              onChange={(event) => handleFormChange("model_name", event.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Model version"
              value={modelForm.model_version}
              onChange={(event) => handleFormChange("model_version", event.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Framework"
              value={modelForm.framework}
              onChange={(event) => handleFormChange("framework", event.target.value)}
              fullWidth
            />

            <TextField
              label="Notes"
              value={modelForm.notes}
              onChange={(event) => handleFormChange("notes", event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={modelForm.is_active}
                  onChange={(event) => handleFormChange("is_active", event.target.checked)}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmitModel} variant="contained" disabled={saving}>
            {saving ? "Registering..." : "Register model"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={closeConfirm} fullWidth maxWidth="xs">
        <DialogTitle>
          {confirmAction === "deactivate" ? "Confirm deactivation" : "Confirm activation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedModel ? (
              `Are you sure you want to ${confirmAction} the model "${selectedModel.model_name}"?`
            ) : (
              "Are you sure you want to change the model status?"
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button onClick={handleConfirmToggle} variant="contained">
            {confirmAction === "deactivate" ? "Deactivate" : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}