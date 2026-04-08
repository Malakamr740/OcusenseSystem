import { Chip } from "@mui/material";

export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let color = "default";
  if (["completed", "active", "available", "success"].includes(normalized)) color = "success";
  else if (["pending", "warning", "processing"].includes(normalized)) color = "warning";
  else if (["error", "failed", "inactive"].includes(normalized)) color = "error";
  else if (["info"].includes(normalized)) color = "info";

  return <Chip label={status} color={color} size="small" />;
}