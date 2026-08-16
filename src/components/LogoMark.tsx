interface LogoMarkProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export default function LogoMark({
  size = "md",
  className = "",
}: LogoMarkProps) {
  const sizeClasses = {
    xs: "h-7 w-7 text-xs rounded-lg",
    sm: "h-10 w-10 text-lg rounded-xl",
    md: "h-20 w-20 text-3xl rounded-2xl",
    lg: "h-24 w-24 text-4xl rounded-2xl",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-emerald-500/20 bg-neutral-900 ${sizeClasses[size]} ${className}`}
      style={{ boxShadow: "0 0 30px rgba(34,197,94,0.1)" }}
    >
     <span
  className="flex items-center justify-center font-black leading-none text-emerald-400 translate-y-[-2px]"
  style={{
    textShadow: "0 0 20px rgba(34,197,94,0.5)",
  }}
>
  {"</>"}
</span>
    </div>
  );
}
