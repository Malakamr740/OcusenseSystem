/**
 * DataTable - Reusable table component with consistent styling
 * 
 * Improves UX by:
 * - Consistent table styling across all pages
 * - Professional borders and spacing
 * - Easy to scan rows
 * - Responsive for mobile
 */
export default function DataTable({ columns, data, renderRow, actions }) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`table-th ${col.className || ""}`}>
                {col.label}
              </th>
            ))}
            {actions && <th className="table-th">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {renderRow ? renderRow(row, idx) : null}
              {actions && (
                <td className="table-td table-actions">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => action.onClick(row)}
                      className={`table-action-btn ${action.variant || ""}`}
                      disabled={action.disabled?.(row)}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
