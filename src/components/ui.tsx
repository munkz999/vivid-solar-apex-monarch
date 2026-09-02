import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Pill({
  active,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 shrink-0 items-center justify-center rounded-pill px-3.5 text-sm font-medium",
        "transition-[background-color,color,transform,box-shadow] duration-150 ease-out-smooth",
        "active:scale-96 disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-gold text-gold-fg shadow-panel"
          : "bg-raised text-muted shadow-inset hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-2xs font-medium tracking-widest text-muted uppercase">{label}</span>
      {children}
      {hint ? <span className="text-xs text-faint">{hint}</span> : null}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-md bg-raised px-3.5 text-base text-ink outline-none shadow-inset",
        "placeholder:text-faint",
        "focus:shadow-gold-focus",
        className,
      )}
      {...props}
    />
  );
}

export function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-md bg-gold px-4 text-sm font-semibold text-gold-fg",
        "transition-[transform,filter] duration-150 ease-out-smooth",
        "active:scale-96 disabled:opacity-40 disabled:active:scale-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-md px-4 text-sm font-medium text-muted shadow-inset",
        "transition-[color,transform] duration-150 ease-out-smooth",
        "hover:text-ink active:scale-96 disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StepperButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-md bg-raised text-xl font-medium text-gold shadow-inset select-none",
        "transition-transform duration-150 ease-out-smooth active:scale-96",
        "disabled:opacity-35 disabled:active:scale-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-pill transition-colors duration-200 ease-out-smooth",
        checked ? "bg-gold" : "bg-raised shadow-inset",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-6 rounded-pill bg-ink transition-transform duration-200 ease-out-smooth",
          checked ? "translate-x-5 bg-gold-fg" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl bg-surface p-4 shadow-panel", className)}>{children}</div>
  );
}
