/**
 * StatusBadge - Display status with appropriate color/styling
 * 
 * Improves UX by:
 * - Consistent status display across tables and pages
 * - Color-coded status for quick scanning
 * - Professional appearance
 */
export default function StatusBadge({ status, variant = "default" }) {
  const variantMap = {
    active: "badge-success",
    inactive: "badge-secondary",
    pending: "badge-warning",
    completed: "badge-success",
    failed: "badge-danger",
    processing: "badge-info",
    default: "badge-secondary",
  };

  const variantClass = variantMap[status] || variantMap.default;

  return <span className={`badge ${variantClass}`}>{status}</span>;
}
