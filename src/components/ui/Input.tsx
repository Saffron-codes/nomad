interface InputProps {
  label: string;
  type: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const Input = ({
  label,
  type,
  min,
  max,
  value,
  onChange,
  disabled = false,
  className = "",
}: InputProps) => (
  <label className="block text-sm text-nomad-text-muted">
    {label}
    <input
      type={type}
      inputMode={type === "number" ? "numeric" : undefined}
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className={`mt-2 w-full rounded-lg border border-white/15 bg-nomad-bg px-3 py-2 text-nomad-text outline-none ring-0 focus:border-nomad-brand disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  </label>
);
