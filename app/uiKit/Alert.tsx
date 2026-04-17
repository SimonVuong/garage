import type { ReactNode } from "react";

function SuccessIcon() {
  return (
    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b5e20]/10 text-[#1b5e20]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function WarningIcon() {
  return (
    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-[#b45309]" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 20h20L12 2z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M12 9v4M12 17h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export type AlertProps = {
  severity: "success" | "warning";
  /** Bold title; defaults to &quot;Warning&quot; when severity is warning. */
  title?: string;
  children: ReactNode;
};

export function Alert({ severity, title, children }: AlertProps) {
  if (severity === "success") {
    return (
      <div
        role="status"
        className="flex gap-3 rounded-md border border-[#c8e6c9] bg-[#edf7ed] px-4 py-4 text-[#1e4620]"
      >
        <SuccessIcon />
        <p className="min-w-0 self-center text-sm leading-snug">{children}</p>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-md border border-[#ffe082] bg-[#fff8e1] px-4 py-4 text-[#663c00]"
    >
      <WarningIcon />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm font-bold leading-snug text-[#5d4037]">{title ?? "Warning"}</p>
        <p className="text-sm font-normal leading-snug text-[#6d4c41]">{children}</p>
      </div>
    </div>
  );
}
