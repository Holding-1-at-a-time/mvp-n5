import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-xl",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "bg-gradient-to-br from-[#00ae98] to-[#00ae98]/80 rounded-xl flex items-center justify-center shadow-lg shadow-[#00ae98]/25",
          sizeClasses[size],
        )}
      >
        <span className="text-white font-bold">SS</span>
      </div>
      {showText && (
        <div>
          <h1 className={cn("font-bold text-white", textSizeClasses[size])}>Slick Solutions</h1>
          <p className="text-sm text-slate-400">AI-Powered Detailing</p>
        </div>
      )}
    </div>
  )
}
