type LoadingSpinnerProps = {
  label?: string;
  fullSection?: boolean;
};

export function LoadingSpinner({ label, fullSection }: LoadingSpinnerProps) {
  return (
    <div className={fullSection ? "page-loading" : "loading-state"} role="status">
      <span className="spinner" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
