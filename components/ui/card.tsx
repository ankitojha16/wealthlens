import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn(
      "rounded-2xl border border-[#dfeee3] bg-white p-5 text-[#000000] shadow-[0_12px_28px_rgba(15,23,42,0.05)]",
      className,
    )}>
      {children}
    </div>
  );
}
