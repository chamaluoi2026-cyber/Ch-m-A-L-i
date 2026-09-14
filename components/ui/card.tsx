import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn("rounded-2xl border border-black/5 bg-white shadow-card transition-all hover:-translate-y-1", className)}
      {...props}
    />
  );
}
