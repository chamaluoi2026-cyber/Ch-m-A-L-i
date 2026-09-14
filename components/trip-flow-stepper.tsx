import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TripFlowStepper({
  steps,
  current,
  tone = "green"
}: {
  steps: string[];
  current: number;
  tone?: "green" | "brown";
}) {
  const activeClass = tone === "green" ? "bg-forest text-white" : "bg-clay text-white";

  return (
    <aside aria-label="Tiến trình đặt chuyến đi" className="section-shell py-8">
      <ol className="grid gap-3 rounded-2xl bg-white p-3 shadow-card md:grid-cols-5">
        {steps.map((step, index) => {
          const number = index + 1;
          const complete = number < current;
          const active = number === current;
          return (
            <li key={step} className={cn("flex items-center gap-3 rounded-xl px-3 py-3", active && "bg-beige")}>
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold",
                  complete ? "bg-forest text-white" : active ? activeClass : "bg-stone text-ink/60"
                )}
              >
                {complete ? <Check className="size-4" aria-hidden="true" /> : number}
              </span>
              <span className="text-sm font-semibold text-ink">{step}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
