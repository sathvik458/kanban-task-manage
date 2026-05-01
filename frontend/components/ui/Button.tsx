import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

// Simple button. py-2.5 gives a comfortable tap target on phones.
export function Button({
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}
