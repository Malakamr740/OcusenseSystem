/**
 * Alert - Display alerts, messages, errors, and success notifications
 * 
 * Improves UX by:
 * - Consistent alert styling across application
 * - Clear color coding for message types
 * - Professional appearance
 * - Dismissible option
 */
export default function Alert({ 
  type = "info", // info, success, warning, danger
  title,
  message,
  onClose,
  dismissible = true,
}) {
  const typeMap = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    danger: "alert-danger",
  };

  return (
    <div className={`alert ${typeMap[type] || typeMap.info}`}>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
      </div>
      {dismissible && onClose && (
        <button className="alert-close" onClick={onClose}>✕</button>
      )}
    </div>
  );
}
