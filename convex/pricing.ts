import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get shop settings for pricing configuration
export const getShopSettings = query({
  args: { shopId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("shopSettings")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .first()

    if (!settings) {
      // Return default settings if none exist
      return {
        shopId: args.shopId,
        laborRate: 75,
        skillMarkup: 0.2,
        locationSurcharge: 0.1,
        membershipDiscounts: {
          Bronze: 0.02,
          Silver: 0.05,
          Gold: 0.1,
          Platinum: 0.15,
        },
        workloadThreshold: 0.8,
        filthinessFactors: {
          light: 1.0,
          moderate: 1.2,
          heavy: 1.5,
          extreme: 1.8,
        },
        damageSeverityMultiplier: 0.05,
        areaUnitPrice: 2.0,
        servicePackages: {
          basic_wash: {
            sku: "basic_wash",
            name: "Basic Wash & Vacuum",
            description: "Exterior wash, interior vacuum, and basic detailing",
            basePrice: 45,
            defaultDurationHrs: 1.5,
            filthinessFactors: { light: 1.0, moderate: 1.1, heavy: 1.3, extreme: 1.5 },
            vehicleTypeMultipliers: { car: 1.0, suv: 1.2, truck: 1.3 },
          },
          premium_detail: {
            sku: "premium_detail",
            name: "Premium Detail Package",
            description: "Complete interior/exterior detail with protection",
            basePrice: 150,
            defaultDurationHrs: 4,
            filthinessFactors: { light: 1.0, moderate: 1.2, heavy: 1.4, extreme: 1.7 },
            vehicleTypeMultipliers: { car: 1.0, suv: 1.25, truck: 1.4 },
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    }

    return settings
  },
})

// Update shop settings
export const updateShopSettings = mutation({
  args: {
    shopId: v.string(),
    settings: v.object({
      laborRate: v.number(),
      skillMarkup: v.number(),
      locationSurcharge: v.number(),
      membershipDiscounts: v.object({
        Bronze: v.number(),
        Silver: v.number(),
        Gold: v.number(),
        Platinum: v.number(),
      }),
      workloadThreshold: v.number(),
      filthinessFactors: v.object({
        light: v.number(),
        moderate: v.number(),
        heavy: v.number(),
        extreme: v.number(),
      }),
      damageSeverityMultiplier: v.number(),
      areaUnitPrice: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shopSettings")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .first()

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args.settings,
        updatedAt: Date.now(),
      })
    } else {
      return await ctx.db.insert("shopSettings", {
        shopId: args.shopId,
        ...args.settings,
        servicePackages: {
          basic_wash: {
            sku: "basic_wash",
            name: "Basic Wash & Vacuum",
            description: "Exterior wash, interior vacuum, and basic detailing",
            basePrice: 45,
            defaultDurationHrs: 1.5,
            filthinessFactors: { light: 1.0, moderate: 1.1, heavy: 1.3, extreme: 1.5 },
            vehicleTypeMultipliers: { car: 1.0, suv: 1.2, truck: 1.3 },
          },
          premium_detail: {
            sku: "premium_detail",
            name: "Premium Detail Package",
            description: "Complete interior/exterior detail with protection",
            basePrice: 150,
            defaultDurationHrs: 4,
            filthinessFactors: { light: 1.0, moderate: 1.2, heavy: 1.4, extreme: 1.7 },
            vehicleTypeMultipliers: { car: 1.0, suv: 1.25, truck: 1.4 },
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  },
})

// Get customer profile
export const getCustomerProfile = query({
  args: { shopId: v.string(), customerId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("customerProfiles")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("shopId"), args.shopId))
      .first()

    if (!profile) {
      // Return default profile for new customers
      return {
        shopId: args.shopId,
        customerId: args.customerId,
        membershipTier: "Bronze" as const,
        loyaltyPoints: 0,
        historicalSpend: 0,
        preferredServices: [],
        vehicleHistory: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    }

    return profile
  },
})

// Update customer profile
export const updateCustomerProfile = mutation({
  args: {
    shopId: v.string(),
    customerId: v.string(),
    profile: v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      name: v.optional(v.string()),
      membershipTier: v.union(v.literal("Bronze"), v.literal("Silver"), v.literal("Gold"), v.literal("Platinum")),
      loyaltyPoints: v.number(),
      historicalSpend: v.number(),
      preferredServices: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customerProfiles")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("shopId"), args.shopId))
      .first()

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args.profile,
        updatedAt: Date.now(),
      })
    } else {
      return await ctx.db.insert("customerProfiles", {
        shopId: args.shopId,
        customerId: args.customerId,
        ...args.profile,
        vehicleHistory: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  },
})

// Get current market conditions
export const getMarketConditions = query({
  args: { shopId: v.string(), date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split("T")[0]

    const conditions = await ctx.db
      .query("marketConditions")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.eq(q.field("date"), targetDate))
      .first()

    if (!conditions) {
      // Return default market conditions
      return {
        shopId: args.shopId,
        date: targetDate,
        weatherFactor: 1.0,
        seasonalDemand: 1.0,
        competitorIndex: 0.0,
        localDemand: 1.0,
        createdAt: Date.now(),
      }
    }

    return conditions
  },
})

// Update market conditions
export const updateMarketConditions = mutation({
  args: {
    shopId: v.string(),
    date: v.string(),
    conditions: v.object({
      weatherFactor: v.number(),
      seasonalDemand: v.number(),
      competitorIndex: v.number(),
      localDemand: v.number(),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketConditions")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .first()

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args.conditions,
      })
    } else {
      return await ctx.db.insert("marketConditions", {
        shopId: args.shopId,
        date: args.date,
        ...args.conditions,
        createdAt: Date.now(),
      })
    }
  },
})

// Update inspection with pricing information
export const updateInspectionPricing = mutation({
  args: {
    inspectionId: v.id("inspections"),
    pricingParams: v.object({
      basePrice: v.number(),
      defaultDuration: v.number(),
      durationHrs: v.optional(v.number()),
      techCount: v.number(),
      filthinessFactor: v.number(),
      ageFactor: v.number(),
      bodyFactor: v.number(),
      damageFactor: v.number(),
      areaFactor: v.number(),
      laborRate: v.number(),
      skillMarkup: v.number(),
      workloadFactor: v.number(),
      locationSurcharge: v.number(),
      membershipDiscount: v.number(),
      loyaltyCredit: v.number(),
      weatherFactor: v.number(),
      seasonalFactor: v.number(),
      competitorFactor: v.number(),
    }),
    estimateAmount: v.number(),
    priceBreakdown: v.object({
      basePrice: v.number(),
      laborCost: v.number(),
      damageSurcharge: v.number(),
      areaSurcharge: v.number(),
      filthinessFactor: v.number(),
      workloadFactor: v.number(),
      locationSurcharge: v.number(),
      weatherSurcharge: v.number(),
      seasonalAdjustment: v.number(),
      competitorAdjustment: v.number(),
      membershipDiscount: v.number(),
      loyaltyCredit: v.number(),
      subtotal: v.number(),
      total: v.number(),
      savings: v.number(),
    }),
    serviceRecommendations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.inspectionId, {
      pricingParams: args.pricingParams,
      estimateAmount: args.estimateAmount,
      priceBreakdown: args.priceBreakdown,
      serviceRecommendations: args.serviceRecommendations,
      updatedAt: Date.now(),
    })
  },
})

// Get analytics data for dashboard
export const getAnalyticsData = query({
  args: {
    shopId: v.string(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all inspections in the date range
    const inspections = await ctx.db
      .query("inspections")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), new Date(args.startDate).getTime()),
          q.lte(q.field("createdAt"), new Date(args.endDate).getTime()),
        ),
      )
      .collect()

    // Calculate analytics metrics
    const totalServices = inspections.length
    const totalRevenue = inspections.reduce((sum, i) => sum + (i.estimateAmount || 0), 0)
    const avgTicket = totalServices > 0 ? totalRevenue / totalServices : 0

    // Group by vehicle make
    const vehiclesByMake = inspections.reduce(
      (acc, inspection) => {
        const make = inspection.vehicleSpecs?.make || inspection.vehicleInfo.make
        if (!acc[make]) {
          acc[make] = { make, count: 0, revenue: 0 }
        }
        acc[make].count++
        acc[make].revenue += inspection.estimateAmount || 0
        return acc
      },
      {} as Record<string, { make: string; count: number; revenue: number }>,
    )

    // Group by body class
    const vehiclesByBodyClass = inspections.reduce(
      (acc, inspection) => {
        const bodyClass = inspection.vehicleSpecs?.bodyClass || inspection.vehicleInfo.bodyClass
        if (!acc[bodyClass]) {
          acc[bodyClass] = { bodyClass, count: 0, totalPrice: 0 }
        }
        acc[bodyClass].count++
        acc[bodyClass].totalPrice += inspection.estimateAmount || 0
        return acc
      },
      {} as Record<string, { bodyClass: string; count: number; totalPrice: number }>,
    )

    // Fuel type distribution
    const fuelTypeDistribution = inspections.reduce(
      (acc, inspection) => {
        const fuelType = inspection.vehicleSpecs?.fuelType || inspection.vehicleInfo.fuelType
        if (!acc[fuelType]) {
          acc[fuelType] = { fuelType, count: 0 }
        }
        acc[fuelType].count++
        return acc
      },
      {} as Record<string, { fuelType: string; count: number }>,
    )

    // Plant location analysis
    const plantLocationAnalysis = inspections.reduce(
      (acc, inspection) => {
        const country = inspection.vehicleSpecs?.plantCountry || inspection.vehicleInfo.plantCountry
        const year = inspection.vehicleSpecs?.year || Number.parseInt(inspection.vehicleInfo.year)
        const age = new Date().getFullYear() - year

        if (!acc[country]) {
          acc[country] = { location: country, count: 0, totalAge: 0 }
        }
        acc[country].count++
        acc[country].totalAge += age
        return acc
      },
      {} as Record<string, { location: string; count: number; totalAge: number }>,
    )

    // Age distribution
    const ageDistribution = inspections.reduce(
      (acc, inspection) => {
        const year = inspection.vehicleSpecs?.year || Number.parseInt(inspection.vehicleInfo.year)
        const age = new Date().getFullYear() - year
        const price = inspection.estimateAmount || 0

        let ageRange: string
        if (age <= 2) ageRange = "0-2 years"
        else if (age <= 5) ageRange = "3-5 years"
        else if (age <= 10) ageRange = "6-10 years"
        else if (age <= 15) ageRange = "11-15 years"
        else ageRange = "15+ years"

        if (!acc[ageRange]) {
          acc[ageRange] = { ageRange, count: 0, totalSpend: 0 }
        }
        acc[ageRange].count++
        acc[ageRange].totalSpend += price
        return acc
      },
      {} as Record<string, { ageRange: string; count: number; totalSpend: number }>,
    )

    return {
      totalServices,
      totalRevenue,
      avgTicket,
      vehiclesByMake: Object.values(vehiclesByMake),
      vehiclesByBodyClass: Object.values(vehiclesByBodyClass).map((item) => ({
        ...item,
        avgPrice: item.count > 0 ? item.totalPrice / item.count : 0,
      })),
      fuelTypeDistribution: Object.values(fuelTypeDistribution).map((item) => ({
        ...item,
        percentage: totalServices > 0 ? (item.count / totalServices) * 100 : 0,
      })),
      plantLocationAnalysis: Object.values(plantLocationAnalysis).map((item) => ({
        ...item,
        avgAge: item.count > 0 ? item.totalAge / item.count : 0,
      })),
      ageDistribution: Object.values(ageDistribution).map((item) => ({
        ...item,
        avgSpend: item.count > 0 ? item.totalSpend / item.count : 0,
      })),
    }
  },
})

// Get workload factor for surge pricing
export const getWorkloadFactor = query({
  args: { shopId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date).getTime()
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000

    const todayInspections = await ctx.db
      .query("inspections")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.and(q.gte(q.field("createdAt"), startOfDay), q.lt(q.field("createdAt"), endOfDay)))
      .collect()

    const currentBookings = todayInspections.length
    const capacity = 20 // Assume 20 services per day capacity

    const utilization = currentBookings / capacity

    if (utilization < 0.8) return 1.0
    if (utilization < 0.9) return 1.1 // 10% surge
    if (utilization < 0.95) return 1.2 // 20% surge
    return 1.3 // 30% surge for near-capacity
  },
})
