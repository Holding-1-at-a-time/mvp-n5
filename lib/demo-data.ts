export interface DemoShop {
  _id: string
  name: string
  contactEmail: string
  createdAt: number
  settings?: {
    laborRate: number
    skillMarkup: number
    locationSurcharge: number
    membershipDiscounts: Record<string, number>
    workloadThreshold: number
    filthinessFactors: Record<string, number>
    damageMultiplier: number
    areaUnitPrice: number
  }
  stats?: {
    totalInspections: number
    completedInspections: number
    pendingInspections: number
    totalRevenue: number
    avgInspectionValue: number
    damagesDetected: number
  }
}

export interface DemoInspection {
  _id: string
  shopId: string
  vinNumber: string
  imageIds: string[]
  status: "pending" | "processing" | "complete" | "failed"
  createdAt: number
  completedAt?: number
  metadata?: {
    make?: string
    model?: string
    year?: number
  }
  damages?: DemoDamage[]
  estimate?: {
    totalCost: number
    itemCount: number
  }
}

export interface DemoDamage {
  _id: string
  inspectionId: string
  type: string
  severity: "minor" | "moderate" | "severe"
  location: string
  description: string
  confidence: number
  imageId: string
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface DemoUser {
  _id: string
  shopId: string
  name: string
  email: string
  role: "admin" | "manager" | "technician" | "viewer"
  createdAt: number
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled"

export interface Shop {
  _id: string
  name: string
  userRole: "Owner" | "Admin" | "Tech"
  subscription: { plan: "starter" | "pro" | "enterprise"; status: SubscriptionStatus }
}

// Demo shops data
export const demoShops: DemoShop[] = [
  {
    _id: "shop_1",
    name: "Elite Auto Detailing",
    contactEmail: "contact@eliteauto.com",
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    settings: {
      laborRate: 95,
      skillMarkup: 0.2,
      locationSurcharge: 0.15,
      membershipDiscounts: {
        premium: 0.15,
        standard: 0.1,
      },
      workloadThreshold: 0.8,
      filthinessFactors: {
        light: 1.0,
        moderate: 1.3,
        heavy: 1.6,
      },
      damageMultiplier: 1.2,
      areaUnitPrice: 12.5,
    },
    stats: {
      totalInspections: 247,
      completedInspections: 231,
      pendingInspections: 16,
      totalRevenue: 89750,
      avgInspectionValue: 388,
      damagesDetected: 1456,
    },
  },
  {
    _id: "shop_2",
    name: "Premium Car Care",
    contactEmail: "info@premiumcare.com",
    createdAt: Date.now() - 86400000 * 60, // 60 days ago
    settings: {
      laborRate: 85,
      skillMarkup: 0.18,
      locationSurcharge: 0.1,
      membershipDiscounts: {
        premium: 0.12,
        standard: 0.08,
      },
      workloadThreshold: 0.75,
      filthinessFactors: {
        light: 1.0,
        moderate: 1.25,
        heavy: 1.5,
      },
      damageMultiplier: 1.15,
      areaUnitPrice: 11.0,
    },
    stats: {
      totalInspections: 189,
      completedInspections: 175,
      pendingInspections: 14,
      totalRevenue: 67250,
      avgInspectionValue: 356,
      damagesDetected: 1089,
    },
  },
  {
    _id: "shop_3",
    name: "Slick Solutions HQ",
    contactEmail: "demo@slicksolutions.com",
    createdAt: Date.now() - 86400000 * 90, // 90 days ago
    settings: {
      laborRate: 105,
      skillMarkup: 0.25,
      locationSurcharge: 0.2,
      membershipDiscounts: {
        premium: 0.18,
        standard: 0.12,
      },
      workloadThreshold: 0.85,
      filthinessFactors: {
        light: 1.0,
        moderate: 1.35,
        heavy: 1.7,
      },
      damageMultiplier: 1.3,
      areaUnitPrice: 15.0,
    },
    stats: {
      totalInspections: 412,
      completedInspections: 398,
      pendingInspections: 14,
      totalRevenue: 156800,
      avgInspectionValue: 394,
      damagesDetected: 2847,
    },
  },
]

// Demo inspections data
export const demoInspections: DemoInspection[] = [
  {
    _id: "inspection_1",
    shopId: "shop_1",
    vinNumber: "1HGBH41JXMN109186",
    imageIds: ["img_1", "img_2", "img_3"],
    status: "complete",
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    completedAt: Date.now() - 86400000 * 2 + 3600000, // 1 hour later
    metadata: {
      make: "Honda",
      model: "Civic",
      year: 2021,
    },
    damages: [
      {
        _id: "damage_1",
        inspectionId: "inspection_1",
        type: "scratch",
        severity: "minor",
        location: "front bumper",
        description: "Surface scratch on front bumper, approximately 3 inches long",
        confidence: 0.89,
        imageId: "img_1",
        boundingBox: { x: 120, y: 180, width: 80, height: 25 },
      },
      {
        _id: "damage_2",
        inspectionId: "inspection_1",
        type: "dent",
        severity: "moderate",
        location: "driver door",
        description: "Small dent on driver side door panel",
        confidence: 0.92,
        imageId: "img_2",
        boundingBox: { x: 200, y: 250, width: 60, height: 45 },
      },
    ],
    estimate: {
      totalCost: 485,
      itemCount: 2,
    },
  },
  {
    _id: "inspection_2",
    shopId: "shop_1",
    vinNumber: "2T1BURHE0JC123456",
    imageIds: ["img_4", "img_5"],
    status: "processing",
    createdAt: Date.now() - 3600000, // 1 hour ago
    metadata: {
      make: "Toyota",
      model: "Corolla",
      year: 2018,
    },
  },
  {
    _id: "inspection_3",
    shopId: "shop_2",
    vinNumber: "3VW2K7AJ9EM123789",
    imageIds: ["img_6", "img_7", "img_8", "img_9"],
    status: "complete",
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    completedAt: Date.now() - 86400000 * 5 + 7200000, // 2 hours later
    metadata: {
      make: "Volkswagen",
      model: "Jetta",
      year: 2019,
    },
    damages: [
      {
        _id: "damage_3",
        inspectionId: "inspection_3",
        type: "paint_damage",
        severity: "severe",
        location: "rear quarter panel",
        description: "Significant paint damage with rust formation",
        confidence: 0.95,
        imageId: "img_7",
        boundingBox: { x: 150, y: 200, width: 120, height: 80 },
      },
    ],
    estimate: {
      totalCost: 1250,
      itemCount: 1,
    },
  },
]

// Demo users data
export const demoUsers: DemoUser[] = [
  {
    _id: "user_1",
    shopId: "shop_1",
    name: "John Smith",
    email: "john@eliteauto.com",
    role: "admin",
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    _id: "user_2",
    shopId: "shop_1",
    name: "Sarah Johnson",
    email: "sarah@eliteauto.com",
    role: "manager",
    createdAt: Date.now() - 86400000 * 25,
  },
  {
    _id: "user_3",
    shopId: "shop_2",
    name: "Mike Wilson",
    email: "mike@premiumcare.com",
    role: "admin",
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    _id: "user_4",
    shopId: "shop_3",
    name: "Demo User",
    email: "demo@slicksolutions.com",
    role: "admin",
    createdAt: Date.now() - 86400000 * 90,
  },
]

// -----------------------------------------------------------------
// Aggregated dashboard metrics
// -----------------------------------------------------------------
export const dashboards = {
  inspections: { total: 128, completed: 102, inProgress: 26 },
  customers: 54,
  vehicles: 87,
  users: 11,
}

// Aggregate demo data for dashboard
export const totalStats = {
  totalShops: demoShops.length,
  totalInspections: demoShops.reduce((sum, shop) => sum + (shop.stats?.totalInspections || 0), 0),
  totalRevenue: demoShops.reduce((sum, shop) => sum + (shop.stats?.totalRevenue || 0), 0),
  avgInspectionValue: Math.round(
    demoShops.reduce((sum, shop) => sum + (shop.stats?.avgInspectionValue || 0), 0) / demoShops.length,
  ),
}

// Demo knowledge base entries for RAG
export const demoKnowledgeEntries = [
  {
    _id: "kb_1",
    shopId: "shop_1",
    namespace: "inspections",
    content:
      "Honda Civic 2021 inspection revealed minor front bumper scratches and moderate door dent. Total repair cost $485. Customer satisfied with AI assessment accuracy.",
    metadata: {
      type: "inspection",
      make: "Honda",
      model: "Civic",
      year: 2021,
      damageTypes: ["scratch", "dent"],
      totalCost: 485,
      severity: "moderate",
      createdAt: Date.now() - 86400000 * 2,
    },
  },
  {
    _id: "kb_2",
    shopId: "shop_2",
    namespace: "procedures",
    content:
      "Paint correction procedure for severe oxidation: 1. Clay bar treatment 2. Compound application 3. Polish with cutting compound 4. Protective wax coating. Estimated time: 4-6 hours.",
    metadata: {
      type: "procedure",
      category: "paint_correction",
      createdAt: Date.now() - 86400000 * 10,
    },
  },
  {
    _id: "kb_3",
    shopId: "shop_1",
    namespace: "procedures",
    content:
      "Leather conditioning best practices: Use pH-neutral cleaners, apply conditioner in thin layers, allow 15-minute absorption time, buff with microfiber cloth. Repeat monthly for optimal results.",
    metadata: {
      type: "procedure",
      category: "leather_care",
      createdAt: Date.now() - 86400000 * 15,
    },
  },
]

// Helper functions for demo data
export function getDemoShopById(shopId: string): DemoShop | undefined {
  return demoShops.find((shop) => shop._id === shopId)
}

export function getDemoInspectionsByShop(shopId: string): DemoInspection[] {
  return demoInspections.filter((inspection) => inspection.shopId === shopId)
}

export function getDemoUsersByShop(shopId: string): DemoUser[] {
  return demoUsers.filter((user) => user.shopId === shopId)
}

// Simulate async data fetching
export async function fetchDemoData<T>(data: T, delay = 500): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay))
  return data
}
