import * as React from "react"

const Button = React.forwardRef(({ className, size = "default", variant = "primary", ...props }, ref) => {
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  }

  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    secondary: "bg-white/5 hover:bg-white/10 text-white/90 border border-white/10",
    outline: "bg-transparent hover:bg-white/5 text-white border border-white/20",
    ghost: "bg-transparent text-white/80 hover:text-white",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  }

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant] || variants.primary} ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
