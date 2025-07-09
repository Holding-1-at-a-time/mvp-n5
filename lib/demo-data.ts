/**
 * ------------------------------------------------------------------
 * Fallback demo-data so the app renders when Convex isn't running.
 * (Run `npx convex dev` and swap back to live queries when ready.)
 * ------------------------------------------------------------------
 */

export type Shop = {
  _id: string
  name: string
  address: string
  status: "active" | "suspended" | "trial"
  userRole: "Owner" | "Manager" | "Tech"
  subscription: {
    plan: "Starter" | "Pro" | "Enterprise"
    expiresAt: number
  }
  settings: { features: string[] }
}

const baseShops: Shop[] = [
  {
    _id: "shop_demo_1",
    name: "Downtown Auto Care",
    address: "123 Main St • Springfield",
    status: "active",
    userRole: "Owner",
    subscription: {
      plan: "Pro",
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 45, // +45 days
    },
    settings: { features: ["inspection", "ai", "pricing", "scheduling"] },
  },
  {
    _id: "shop_demo_2",
    name: "Uptown Detailers",
    address: "456 Elm St • Metropolis",
    status: "trial",
    userRole: "Manager",
    subscription: {
      plan: "Starter",
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14, // +14 days
    },
    settings: { features: ["inspection", "pricing"] },
  },
]

/**
 * Named exactly as the Home page expects:
 */
export const demoShops = baseShops

/**
 * Named the way the Admin page expects:
 */
export const shops = baseShops

/**
 * Simple dashboard-wide aggregates for Admin mocks.
 */
export const dashboards = {
  inspections: { total: 128, completed: 94, inProgress: 21 },
  customers: 56,
  vehicles: 77,
  users: 14,
}
