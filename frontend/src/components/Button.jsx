import { forwardRef } from "react";
import { Link } from "react-router-dom";

/**
 * Modern pill-shaped button system for Homico.
 * Every text button is rounded-full (pill).
 *
 * Variants:
 * - primary: white pill with subtle vertical gradient (#ffffff -> #ececf1), inner highlight, glow & hover shine.
 * - secondary: translucent glass pill with 1px gradient hairline border.
 * - ghost: transparent pill with subtle hover bg.
 * - outline: crisp bordered pill.
 * - danger: destructive action pill with muted danger tint.
 *
 * Sizes:
 * - sm: 36px height (h-9), px-4, text-xs
 * - md: 44px height (h-11), px-6, text-sm
 * - lg: 52px height (h-[52px]), px-8, text-base
 *
 * Hit target: minimum 44px on touch via invisible padding if needed.
 */

const SIZES = {
  sm: "h-9 px-4 text-xs font-semibold min-h-[36px]",
  md: "h-11 px-6 text-sm font-semibold min-h-[44px]",
  lg: "h-[52px] px-8 text-base font-bold min-h-[52px]",
};

const VARIANTS = {
  primary:
    "bg-gradient-to-b from-white to-[#ececf1] text-[#09090b] shadow-[0_2px_12px_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.2)] border-t border-white/60 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(196,181,253,0.25)] hover:from-white hover:to-white active:scale-[0.97] active:translate-y-0",
  secondary:
    "bg-ink/[0.06] hover:bg-ink/[0.12] text-ink border border-line/80 hover:border-ink/30 shadow-soft-xs backdrop-blur-sm hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
  ghost:
    "bg-transparent text-ink-muted hover:text-ink hover:bg-ink/[0.08] active:scale-[0.97]",
  outline:
    "border border-line bg-transparent text-ink hover:bg-surface-muted hover:border-ink/25 active:scale-[0.97]",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 active:scale-[0.97]",
};

export const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    children,
    ...props
  },
  ref
) {
  const Component = as || (to ? Link : href ? "a" : "button");
  const sizeCls = SIZES[size] || SIZES.md;
  const variantCls = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;

  const baseCls =
    "group relative inline-flex items-center justify-center gap-2 rounded-full tracking-wide transition-all duration-200 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer before:absolute before:-inset-1 before:content-['']";

  return (
    <Component
      ref={ref}
      to={to}
      href={href}
      disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
      className={`${baseCls} ${sizeCls} ${variantCls} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="opacity-0 flex items-center gap-2">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        </>
      ) : (
        children
      )}
    </Component>
  );
});

export const IconButton = forwardRef(function IconButton(
  {
    as,
    to,
    href,
    size = "md",
    variant = "secondary",
    disabled = false,
    className = "",
    children,
    ...props
  },
  ref
) {
  const Component = as || (to ? Link : href ? "a" : "button");

  const iconSizes = {
    sm: "h-9 w-9 min-w-[36px] min-h-[36px] text-sm",
    md: "h-11 w-11 min-w-[44px] min-h-[44px] text-base",
    lg: "h-[52px] w-[52px] min-w-[52px] min-h-[52px] text-lg",
  };

  const sizeCls = iconSizes[size] || iconSizes.md;
  const variantCls = VARIANTS[variant] || VARIANTS.secondary;

  const baseCls =
    "group relative inline-flex items-center justify-center rounded-full transition-all duration-200 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 cursor-pointer before:absolute before:-inset-1 before:content-['']";

  return (
    <Component
      ref={ref}
      to={to}
      href={href}
      disabled={disabled}
      className={`${baseCls} ${sizeCls} ${variantCls} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Button;
