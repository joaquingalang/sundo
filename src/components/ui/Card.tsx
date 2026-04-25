import React from "react";

type CardVariant = "default" | "gradient" | "glass";

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white border border-border",
  gradient: "gradient-hero text-white",
  glass: "glass border border-white/20",
};

export default function Card({
  variant = "default",
  className = "",
  children,
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-5
        transition-all duration-200 ease-out
        ${variantStyles[variant]}
        ${hoverable ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
