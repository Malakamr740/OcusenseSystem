/**
 * FormField - Reusable form input wrapper
 * 
 * Improves UX by:
 * - Consistent form styling across all pages
 * - Clear labels and error messages
 * - Better accessibility (proper label-input linking)
 * - Consistent spacing
 * - Professional appearance
 */
export default function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  required,
  help,
  rows,
}) {
  const isTextarea = type === "textarea";
  const InputComponent = isTextarea ? "textarea" : "input";

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-label-required">*</span>}
        </label>
      )}
      <InputComponent
        id={id}
        type={isTextarea ? undefined : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`form-control ${error ? "form-control-error" : ""}`}
        rows={rows}
      />
      {error && <div className="form-error">{error}</div>}
      {help && <div className="form-help">{help}</div>}
    </div>
  );
}
