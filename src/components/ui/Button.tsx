import Link from "next/link";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "pink" | "teal" | "gold" | "outline";

const VARIANT_CLASSES: Record<Variant, string> = {
  pink: "bg-accent-pink text-base-950",
  teal: "bg-accent-teal text-base-950",
  gold: "bg-accent-gold text-base-950",
  outline: "border-2 border-ink-light bg-transparent text-ink-light",
};

const baseClasses =
  "inline-flex -skew-x-[8deg] items-center justify-center px-7 py-3.5 text-[15px] font-bold uppercase tracking-wide transition-opacity hover:opacity-90";

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

/**
 * Bouton "skew" utilisé dans toute la maquette. `href` en fait un <Link>,
 * son absence un <button> classique (formulaires, actions JS).
 */
export function Button({ variant = "pink", className, children, href, ...props }: ButtonProps) {
  const classes = clsx(baseClasses, VARIANT_CLASSES[variant], className);
  const inner = <span className="block skew-x-[8deg]">{children}</span>;

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as Omit<React.ComponentProps<typeof Link>, "href" | "className">)}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
