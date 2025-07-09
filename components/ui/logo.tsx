import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "lg"
}

export function Logo({ className, size = "lg" }: LogoProps) {
  const boxSize = size === "sm" ? "h-8 w-8" : "h-12 w-12"
  const textSize = size === "sm" ? "text-lg" : "text-xl"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          boxSize,
          "bg-gradient-to-br from-[#00ae98] to-[#00ae98]/80 rounded-xl flex items-center justify-center",
        )}
      >
        <span className="text-white font-bold">SS</span>
      </div>
      <div className="hidden sm:block">
        <h1 className={cn(textSize, "font-bold text-white")}>Slick Solutions</h1>
        <p className="text-sm text-slate-400">AI-Powered Detailing</p>
      </div>
    </div>
  )
}
