import { forwardRef, type InputHTMLAttributes } from "react";

const fieldClass =
  "w-full rounded-lg border border-solid border-[#e5e7eb] bg-white px-5 py-3.5 text-base text-[#202124] shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-[#6b7280] focus:border-[#e5e7eb] focus:shadow-[0_0_0_4px_#f3f4f6] focus:outline-none";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={[fieldClass, className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  },
);
