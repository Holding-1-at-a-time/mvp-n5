export interface Shop {
  _id: string
  name: string
  address: string
  status: "active" | "suspended" | "trial"
  userRole: "Owner" | "Manager" | "Technician"
  subscription: { plan: "Starter" | "Pro" | "Enterprise"; expiresAt: number }
  settings: { features: string[] }
}

/**
 * Fallback demo data used when Convex isn't running (e.g. in v0 preview).
 * Replace with real `useQuery(api.shops.list)` once `npx convex dev` is active.
 */
export const demoShops: Shop[] = [
  {
    _id: "demo-shop-1",
    name: "Demo Auto Body",
    address: "123 Main St, Springfield, USA",
    status: "active",
    userRole: "Owner",
    subscription: {
      plan: "Pro",
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30-day demo
    },
    settings: { features: ["inspection", "ai", "pricing", "scheduling"] },
  },
]
