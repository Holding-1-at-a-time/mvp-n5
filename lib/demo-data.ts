// Lightweight mock data so the app can render in environments
// where the Convex runtime is unavailable (e.g. v0 preview).

export type Shop = {
  _id: string
  name: string
  userRole: "Owner" | "Manager" | "Tech"
  subscription: {
    status: "active" | "inactive"
    plan: "Starter" | "Pro" | "Enterprise"
  }
}

export const shops: Shop[] = [
  {
    _id: "shop_demo_1",
    name: "Downtown Auto Care",
    userRole: "Owner",
    subscription: { status: "active", plan: "Pro" },
  },
  {
    _id: "shop_demo_2",
    name: "Uptown Detailers",
    userRole: "Manager",
    subscription: { status: "inactive", plan: "Starter" },
  },
]

export const dashboards = {
  inspections: {
    total: 128,
    completed: 94,
    inProgress: 21,
  },
  customers: 56,
  vehicles: 77,
  users: 14,
}
