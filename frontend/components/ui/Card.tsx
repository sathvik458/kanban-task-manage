import { HTMLAttributes } from "react";

// Slightly translucent card so the 3D background shows through subtly.
export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return (
    <div
      {...rest}
      className={`rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm ${className}`}
    />
  );
}
