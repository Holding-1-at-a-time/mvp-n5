"use client"

import * as React from "react"
import { Label, PieSector, Sector } from "recharts"
import { ChartContext } from "./ChartContext" // Declare the ChartContext variable

import { cn } from "@/lib/utils"

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: {
      [key: string]: {
        label?: string
        color?: string
        icon?: React.ComponentType<{ className?: string }>
      }
    }
    id?: string
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`
  return (
    <ChartContext.Provider value={{ config, id: chartId }}>
      <div ref={ref} className={cn("flex aspect-video justify-center text-foreground", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: string
  }
>(({ active, payload, className, content, ...props }, ref) => {
  const { config } = useChart()

  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent ref={ref} className={className} payload={payload} config={config} {...props}>
        {content}
      </ChartTooltipContent>
    )
  }

  return null
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: any[]
    config: ChartContext["config"]
    nameKey?: string
    valueKey?: string
  }
>(({ className, payload, config, nameKey, valueKey, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const displayedPayload = payload[0]

  const { dataKey, name, value, fill } = displayedPayload

  const itemConfig = config[dataKey] || config[name]

  const color = itemConfig?.color || fill

  return (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border bg-background p-2 text-sm shadow-md", className)}
      {...props}
    >
      <div className="grid min-w-[130px] gap-1">
        {nameKey || dataKey ? (
          <div className="flex items-center gap-2">
            <div className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="flex flex-1 text-muted-foreground">
              {itemConfig?.label || displayedPayload.nameKey || displayedPayload.dataKey}
            </span>
            <span className="font-medium text-foreground">{displayedPayload.valueKey || displayedPayload.value}</span>
          </div>
        ) : (
          <span className="font-medium text-foreground">{displayedPayload.valueKey || displayedPayload.value}</span>
        )}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: any[]
    verticalAlign?: "top" | "middle" | "bottom"
    horizontalAlign?: "left" | "center" | "right"
  }
>(({ payload, className, ...props }, ref) => {
  const { config } = useChart()

  if (!payload || !payload.length) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((entry: any) => {
        const { dataKey, value, color } = entry
        const itemConfig = config[dataKey] || config[value]
        const displayColor = itemConfig?.color || color

        if (!itemConfig?.label) {
          return null
        }

        return (
          <div key={dataKey} className="flex items-center gap-1.5">
            <div className="size-3 shrink-0 rounded-full" style={{ backgroundColor: displayColor }} />
            <span className="text-xs text-muted-foreground">{itemConfig.label}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartCrosshair = React.forwardRef<any, React.ComponentProps<typeof Sector>>(({ className, ...props }, ref) => {
  return <Sector ref={ref} className={cn("fill-background stroke-muted", className)} {...props} />
})
ChartCrosshair.displayName = "ChartCrosshair"

const ChartActiveDot = React.forwardRef<any, React.ComponentProps<typeof Sector>>(({ className, ...props }, ref) => {
  return <Sector ref={ref} className={cn("fill-background stroke-foreground", className)} {...props} />
})
ChartActiveDot.displayName = "ChartActiveDot"

const ChartLabel = React.forwardRef<any, React.ComponentProps<typeof Label>>(({ className, ...props }, ref) => {
  return <Label ref={ref} className={cn("fill-foreground text-sm", className)} {...props} />
})
ChartLabel.displayName = "ChartLabel"

const ChartPieSector = React.forwardRef<any, React.ComponentProps<typeof PieSector>>(({ className, ...props }, ref) => {
  return <PieSector ref={ref} className={cn("stroke-background", className)} {...props} />
})
ChartPieSector.displayName = "ChartPieSector"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartCrosshair,
  ChartActiveDot,
  ChartLabel,
  ChartPieSector,
  useChart,
}
