import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-[#32CD32]/30 bg-[#ebfff0] px-3.5 py-2.5 text-sm font-medium text-[#000000] transition hover:border-[#32CD32] hover:bg-[#dfffe7] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}
