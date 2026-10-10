export type ButtonVariant = "primary" | "secondary" | "ghost";

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomad-brand focus-visible:ring-offset-2 focus-visible:ring-offset-nomad-surface disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-nomad-brand text-slate-950 font-semibold hover:bg-nomad-brand-strong",
  secondary:
    "border border-white/15 bg-nomad-surface-muted text-nomad-text hover:bg-nomad-surface",
  ghost: "border border-white/15 bg-transparent text-nomad-text hover:bg-white/5",
};

export const buttonClassName = (variant: ButtonVariant, className = ""): string =>
  `${baseClasses} ${variantClasses[variant]} ${className}`.trim();
