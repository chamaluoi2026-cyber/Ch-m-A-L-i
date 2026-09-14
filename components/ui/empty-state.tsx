"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, Inbox, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  secondaryActionHref,
  onSecondaryAction,
  className = ""
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-3xl border border-dashed border-stone-200 bg-white/70 backdrop-blur-sm shadow-sm ${className}`}
    >
      <div className="size-16 rounded-2xl bg-emerald-50 text-[#0F5C4A] grid place-items-center mb-4 shadow-inner">
        <Icon className="size-8" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-stone-800 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs md:text-sm text-stone-500 max-w-md leading-relaxed">
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {actionText && (
            actionHref ? (
              <Button asChild size="sm" className="bg-[#0F5C4A] hover:bg-[#0F5C4A]/90 text-white font-bold rounded-xl shadow-sm text-xs">
                <Link href={actionHref}>
                  {actionText}
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" onClick={onAction} className="bg-[#0F5C4A] hover:bg-[#0F5C4A]/90 text-white font-bold rounded-xl shadow-sm text-xs">
                {actionText}
              </Button>
            )
          )}

          {secondaryActionText && (
            secondaryActionHref ? (
              <Button asChild size="sm" variant="outline" className="border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold">
                <Link href={secondaryActionHref}>
                  {secondaryActionText}
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={onSecondaryAction} className="border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold">
                {secondaryActionText}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
