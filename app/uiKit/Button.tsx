import type { ButtonHTMLAttributes } from "react";

const baseClass =
  "inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border border-solid px-6 text-base font-bold shadow-none outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "contained" | "outlined";
  color?: "primary" | "dark";
};

function variantClass(variant: ButtonProps["variant"], color: ButtonProps["color"]): string {
  if (variant === "contained" && color === "primary") {
    return "border-transparent bg-[#f97316] text-white hover:bg-[#ea580c] active:bg-[#c2410c]";
  }
  if (variant === "contained" && color === "dark") {
    return "border-transparent bg-[#111827] text-white hover:bg-[#1f2937] active:bg-[#030712]";
  }
  if (variant === "outlined" && color === "primary") {
    return "border-[#f97316] bg-white text-[#f97316] hover:bg-[#fff7ed] active:bg-[#ffedd5]";
  }
  if (variant === "outlined" && color === "dark") {
    return "border-[#111827] bg-white text-[#111827] hover:bg-[#f9fafb] active:bg-[#f3f4f6]";
  }
  if (variant === "outlined" && color === undefined) {
    return "border-[#e5e7eb] bg-white text-[#111827] hover:bg-[#f9fafb] active:bg-[#f3f4f6]";
  }
  if (variant === "contained" && color === undefined) {
    return "border-transparent bg-[#f3f4f6] text-[#111827] hover:bg-[#e5e7eb] active:bg-[#d1d5db]";
  }
  return "";
}

export function Button({
  variant,
  color,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const composed = [baseClass, variantClass(variant, color), className]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={composed} {...rest} />;
}
