import type { DurationUnit } from "../../utils/timerUtils";

interface UnitSelectorProps {
  label?: string;
  value: DurationUnit;
  onChange: (value: DurationUnit) => void;
  disabled?: boolean;
  className?: string;
}

export const UnitSelector = ({
  label = "Counted in",
  value,
  onChange,
  disabled = false,
  className = "",
}: UnitSelectorProps) => (
  <label className="block text-sm text-nomad-text-muted">
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DurationUnit)}
      disabled={disabled}
      className={`mt-2 w-full rounded-lg border border-white/15 bg-nomad-bg px-3 py-2 text-nomad-text outline-none ring-0 focus:border-nomad-brand disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <option className="bg-nomad-bg text-nomad-text" value="minutes">
        Minutes
      </option>
      <option className="bg-nomad-bg text-nomad-text" value="hours">
        Hours
      </option>
    </select>
  </label>
);
