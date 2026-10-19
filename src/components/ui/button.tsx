import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-emerald-600 text-white hover:bg-emerald-500",
        secondary:
          "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
        outline:
          "border border-neutral-700 text-neutral-200 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400",
        ghost: "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100",
        danger:
          "border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/5",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button };
