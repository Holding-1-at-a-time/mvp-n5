import { mutation, query, action } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

// Create a scheduled task
export const createTask = mutation({
  args: {
    shopId: v.id("shops"),
    name: v.string(),
    type: v.union(v.literal("reminder"), v.literal("maintenance"), v.literal("report"), v.literal("backup")),
    interval: v.object({
      hours: v.optional(v.number()),
      days: v.optional(v.number()),
      cron: v.optional(v.string()),
    }),
    config: v.optional(v.record(v.string(), v.any())),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has admin access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user || user.role !== "admin") throw new Error("Admin access required")

    const taskId = await ctx.db.insert("schedules", {
      ...args,
      enabled: args.enabled ?? true,
      status: "active",
    })

    return taskId
  },
})

// List scheduled tasks for a shop
export const listTasks = query({
  args: {
    shopId: v.id("shops"),
    type: v.optional(
      v.union(v.literal("reminder"), v.literal("maintenance"), v.literal("report"), v.literal("backup")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    let query = ctx.db.query("schedules").withIndex("by_shop", (q) => q.eq("shopId", args.shopId))

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type))
    }

    const tasks = await query.collect()
    return tasks
  },
})

// Execute scheduled task
export const executeTask = action({
  args: { taskId: v.id("schedules") },
  handler: async (ctx, args) => {
    const task = await ctx.runQuery(api.scheduling.getTask, { id: args.taskId })
    if (!task || !task.enabled) return

    // Record execution start
    const executionId = await ctx.runMutation(api.scheduling.createExecution, {
      scheduleId: args.taskId,
      status: "running",
    })

    try {
      let result = null

      switch (task.type) {
        case "reminder":
          result = await executeReminderTask(ctx, task)
          break
        case "maintenance":
          result = await executeMaintenanceTask(ctx, task)
          break
        case "report":
          result = await executeReportTask(ctx, task)
          break
        case "backup":
          result = await executeBackupTask(ctx, task)
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      // Record successful execution
      await ctx.runMutation(api.scheduling.updateExecution, {
        id: executionId,
        status: "completed",
        result,
      })
    } catch (error) {
      // Record failed execution
      await ctx.runMutation(api.scheduling.updateExecution, {
        id: executionId,
        status: "failed",
        error: error.message,
      })
    }
  },
})

// Get task by ID
export const getTask = query({
  args: { id: v.id("schedules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Create execution record
export const createExecution = mutation({
  args: {
    scheduleId: v.id("schedules"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const executionId = await ctx.db.insert("executions", {
      ...args,
      startedAt: Date.now(),
    })

    return executionId
  },
})

// Update execution record
export const updateExecution = mutation({
  args: {
    id: v.id("executions"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    await ctx.db.patch(id, {
      ...updates,
      completedAt: Date.now(),
    })

    return { success: true }
  },
})

// Helper functions for different task types
async function executeReminderTask(ctx: any, task: any) {
  // Get upcoming inspections that need reminders
  const upcomingInspections = await ctx.runQuery(api.inspections.list, {
    shopId: task.shopId,
    status: "scheduled",
  })

  const reminderThreshold = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
  const inspectionsNeedingReminders = upcomingInspections.filter(
    (inspection: any) => inspection.scheduledDate <= reminderThreshold,
  )

  // Send reminders (mock implementation)
  for (const inspection of inspectionsNeedingReminders) {
    // In real implementation, send email/SMS via external service
    console.log(`Sending reminder for inspection ${inspection._id}`)
  }

  return {
    remindersSent: inspectionsNeedingReminders.length,
    inspections: inspectionsNeedingReminders.map((i: any) => i._id),
  }
}

async function executeMaintenanceTask(ctx: any, task: any) {
  // Perform maintenance tasks like cleanup, optimization, etc.
  const result = {
    tasksPerformed: ["cleanup_old_files", "optimize_indices", "update_statistics"],
    duration: Math.floor(Math.random() * 5000) + 1000, // Mock duration
  }

  return result
}

async function executeReportTask(ctx: any, task: any) {
  // Generate and send reports
  const stats = await ctx.runQuery(api.inspections.getStats, {
    shopId: task.shopId,
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
    endDate: Date.now(),
  })

  return {
    reportType: "weekly_summary",
    stats,
    generatedAt: Date.now(),
  }
}

async function executeBackupTask(ctx: any, task: any) {
  // Perform backup operations
  return {
    backupType: "incremental",
    size: Math.floor(Math.random() * 1000000) + 100000, // Mock size in bytes
    location: "s3://backups/shop-" + task.shopId,
  }
}

// Get execution history
export const getExecutionHistory = query({
  args: {
    scheduleId: v.id("schedules"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const schedule = await ctx.db.get(args.scheduleId)
    if (!schedule) throw new Error("Schedule not found")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", schedule.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    const executions = await ctx.db
      .query("executions")
      .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
      .order("desc")
      .take(args.limit || 50)

    return executions
  },
})
