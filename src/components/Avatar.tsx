"use client";

interface AvatarProps {
  src: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  /** FrameMaster.cssKey（例: frame-wood） */
  frameCssKey?: string | null;
}

const SIZES = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-xl",
};

const FRAME_CSS: Record<string, string> = {
  "frame-none": "",
  "frame-wood": "ring-2 ring-amber-700 ring-offset-2 ring-offset-white",
  "frame-stone": "ring-2 ring-stone-500 ring-offset-2 ring-offset-white",
  "frame-gold":
    "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_0_1px_rgba(251,191,36,0.35)]",
};

export default function Avatar({
  src,
  name = "",
  size = "sm",
  className = "",
  frameCssKey = null,
}: AvatarProps) {
  const sizeClass = SIZES[size];
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const frameClass = frameCssKey ? (FRAME_CSS[frameCssKey] ?? "") : "";

  if (src && src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${sizeClass} rounded-full object-cover bg-stone-100 ${frameClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-stone-100 flex items-center justify-center font-medium text-stone-600 ${frameClass} ${className}`}
    >
      {initial}
    </div>
  );
}
