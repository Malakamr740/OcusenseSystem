/**
 * StatCard - Display metric/statistic card
 * 
 * Improves UX by:
 * - Professional display of key metrics
 * - Consistent styling for admin dashboards
 * - Clear visual hierarchy between value and label
 * - Icon support for visual interest
 */
export default function StatCard({ title, value, icon, trend, className = "" }) {
  return (
    <div className={`stat-card ${className}`}>
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-content">
        <div className="stat-card-label">{title}</div>
        <div className="stat-card-value">{value}</div>
        {trend && <div className={`stat-card-trend ${trend.type}`}>{trend.text}</div>}
      </div>
    </div>
  );
}
