import React from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  sm: { container: "w-8 h-8", text: "text-xs", dot: "w-2 h-2 border" },
  md: { container: "w-10 h-10", text: "text-sm", dot: "w-2.5 h-2.5 border-2" },
  lg: { container: "w-12 h-12", text: "text-base", dot: "w-3 h-3 border-2" },
  xl: { container: "w-20 h-20", text: "text-xl", dot: "w-4 h-4 border-2" },
};

// Generate a consistent color from a name string
function getColorFromName(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({
  name,
  src,
  size = "md",
  online,
  className = "",
}: AvatarProps) {
  const styles = sizeStyles[size];
  const bgColor = getColorFromName(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${styles.container} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`
            ${styles.container} ${bgColor}
            rounded-full flex items-center justify-center
            text-white font-semibold ${styles.text}
          `}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`
            absolute bottom-0 right-0
            ${styles.dot}
            rounded-full border-white
            ${online ? "bg-emerald-500" : "bg-slate-300"}
          `}
        />
      )}
    </div>
  );
}
