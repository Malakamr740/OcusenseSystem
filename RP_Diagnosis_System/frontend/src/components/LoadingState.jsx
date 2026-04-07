/**
 * LoadingState - Display while data is loading
 * 
 * Improves UX by:
 * - Clear feedback that content is loading
 * - Professional appearance
 * - Consistent styling
 */
export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
