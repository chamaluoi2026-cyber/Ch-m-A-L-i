import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ring h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-ink placeholder:text-ink/45",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
