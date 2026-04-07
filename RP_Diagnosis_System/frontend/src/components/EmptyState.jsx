/**
 * EmptyState - Display when no data is available
 * 
 * Improves UX by:
 * - Clear message when data is empty
 * - Empathetic design
 * - Consistent styling
 * - Optional call-to-action
 */
export default function EmptyState({ 
  icon = "📭",
  title = "No data found",
  description = "There's nothing to display here.",
  action = null,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
