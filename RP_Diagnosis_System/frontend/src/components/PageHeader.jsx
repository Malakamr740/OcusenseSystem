/**
 * PageHeader - Professional page title and description
 * 
 * Improves UX by:
 * - Consistent page header styling
 * - Clear hierarchy
 * - Professional appearance
 * - Optional action button
 */
export default function PageHeader({ 
  title, 
  subtitle,
  action = null,
}) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <div className="page-header-action">
          <button className={`btn ${action.variant || "btn-primary"}`} onClick={action.onClick}>
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
