interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** An on/off switch with a label and optional helper text. */
export const Toggle = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = "",
}: ToggleProps) => (
  <label
    className={`flex cursor-pointer items-start gap-4 ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
  >
    <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span
        className="h-6 w-11 rounded-full bg-white/15 transition peer-checked:bg-nomad-brand peer-focus-visible:ring-2 peer-focus-visible:ring-nomad-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-nomad-surface"
        aria-hidden="true"
      />
      <span
        className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
        aria-hidden="true"
      />
    </span>
    <span>
      <span className="block text-sm font-medium text-nomad-text">{label}</span>
      {description && (
        <span className="mt-1 block text-sm text-nomad-text-muted">{description}</span>
      )}
    </span>
  </label>
);
