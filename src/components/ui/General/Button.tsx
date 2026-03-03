import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`text-white bg-primary border-secondary border rounded
            hover:bg-accent hover:text-white transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
