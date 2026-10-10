import { buttonClassName, type ButtonVariant } from "./buttonStyles";

interface ButtonProps {
  variant: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export type { ButtonProps };

export const Button = ({
  variant,
  onClick,
  disabled = false,
  children,
  className = "",
}: ButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={buttonClassName(variant, className)}
  >
    {children}
  </button>
);
