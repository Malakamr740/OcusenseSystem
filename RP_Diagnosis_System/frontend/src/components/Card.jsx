/**
 * Card - Reusable card component for content sections
 * 
 * Improves UX by:
 * - Consistent card styling across all pages
 * - Professional shadows and borders
 * - Flexible content layout
 * - Medical design language
 */
export default function Card({ title, subtitle, children, className = "", fullWidth = false }) {
  return (
    <div className={`card ${className} ${fullWidth ? "card-full" : ""}`}>
      {title && (
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
