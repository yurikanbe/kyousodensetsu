interface AvatarProps {
  src: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-xl",
};

export default function Avatar({ src, name = "", size = "sm", className = "" }: AvatarProps) {
  const sizeClass = SIZES[size];
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  if (src && src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${sizeClass} rounded-full object-cover bg-stone-100 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-stone-100 flex items-center justify-center font-medium text-stone-600 ${className}`}>
      {initial}
    </div>
  );
}
