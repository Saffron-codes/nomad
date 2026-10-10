import { NavLink } from "react-router";
import { buttonClassName, type ButtonVariant } from "./buttonStyles";

interface LinkButtonProps {
  to: string;
  variant: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

/** A navigation link styled like a Button. */
export const LinkButton = ({
  to,
  variant,
  children,
  className = "",
}: LinkButtonProps) => (
  <NavLink to={to} className={buttonClassName(variant, className)}>
    {children}
  </NavLink>
);
