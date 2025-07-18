"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import {
  Plus,
  ClipboardCheck,
  CalendarIcon,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Play,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const createInspectionSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  customerId: z.string().optional(),
  type: z.enum(["routine", "diagnostic", "pre-purchase", "insurance"]),
  scheduledDate: z.date(),
  inspector: z.string().min(1, "Inspector is required"),
  notes: z.string().optional(),
})

type CreateInspectionForm = z.infer<typeof createInspectionSchema>

interface InspectionManagementProps {
  shopId: Id<"shops">
}

export function InspectionManagement({ shopId }: InspectionManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const inspections = useQuery(api.inspections.list, { shopId, limit: 50 })
  const vehicles = useQuery(api.vehicles.list, { shopId, limit: 100 })
  const customers = useQuery(api.customers.list, { shopId, limit: 100 })
  const users = useQuery(api.users.list, { shopId })
  const inspectionStats = useQuery(api.inspections.getStats, { shopId })

  const createInspection = useMutation(api.inspections.create)
  const updateStatus = useMutation(api.inspections.updateStatus)

  const form = useForm<CreateInspectionForm>({
    resolver: zodResolver(createInspectionSchema),
    defaultValues: {
      vehicleId: "",
      customerId: "",
      type: "routine",
      scheduledDate: new Date(),
      inspector: "", // Updated to be a non-empty string
      notes: "",
    },
  })

  const onCreateInspection = async (data: CreateInspectionForm) => {
    try {
      await createInspection({
        shopId,
        vehicleId: data.vehicleId as Id<"vehicles">,
        customerId: data.customerId ? (data.customerId as Id<"customers">) : undefined,
        type: data.type,
        scheduledDate: data.scheduledDate.getTime(),
        inspector: data.inspector,
        notes: data.notes,
      })
      toast.success("Inspection scheduled successfully")
      setIsCreateDialogOpen(false)
      form.reset()
    } catch (error) {
      toast.error("Failed to schedule inspection")
      console.error(error)
    }
  }

  const handleStatusUpdate = async (
    inspectionId: Id<"inspections">,
    newStatus: "scheduled" | "in-progress" | "completed" | "cancelled",
  ) => {
    try {
      await updateStatus({
        id: inspectionId,
        status: newStatus,
        completedAt: newStatus === "completed" ? Date.now() : undefined,
      })
      toast.success(`Inspection ${newStatus.replace("-", " ")}`)
    } catch (error) {
      toast.error("Failed to update inspection status")
      console.error(error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "routine":
        return "bg-blue-100 text-blue-800"
      case "diagnostic":
        return "bg-orange-100 text-orange-800"
      case "pre-purchase":
        return "bg-purple-100 text-purple-800"
      case "insurance":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInspections = inspections?.filter(
    (inspection) => statusFilter === "all" || inspection.status === statusFilter,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inspection Management</h2>
          <p className="text-gray-600">Schedule and manage vehicle inspections</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Inspection</DialogTitle>
              <DialogDescription>Create a new vehicle inspection appointment</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateInspection)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles?.page.map((vehicle) => (
                            <SelectItem key={vehicle._id} value={vehicle._id}>
                              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No customer assigned</SelectItem>
                          {customers?.page.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.name} - {customer.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspection Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="diagnostic">Diagnostic</SelectItem>
                            <SelectItem value="pre-purchase">Pre-Purchase</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inspector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspector</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select inspector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users
                              ?.filter(
                                (user) =>
                                  user.role === "technician" || user.role === "manager" || user.role === "admin",
                              )
                              .map((user) => (
                                <SelectItem key={user._id} value={user.name}>
                                  {user.name} ({user.role})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scheduled Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes for the inspection" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Inspection</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold">{inspectionStats?.total || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Scheduled</div>
                <div className="text-2xl font-bold">{inspectionStats?.scheduled || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-600">In Progress</div>
                <div className="text-2xl font-bold">{inspectionStats?.inProgress || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold">{inspectionStats?.completed || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inspections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inspections</CardTitle>
          <CardDescription>{filteredInspections?.length || 0} inspections found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections?.map((inspection) => (
                <TableRow key={inspection._id}>
                  <TableCell>
                    {inspection.vehicle && (
                      <div>
                        <div className="font-medium">
                          {inspection.vehicle.year} {inspection.vehicle.make} {inspection.vehicle.model}
                        </div>
                        <div className="text-sm text-gray-600">{inspection.vehicle.licensePlate}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {inspection.customer ? (
                      <div>
                        <div className="font-medium">{inspection.customer.name}</div>
                        <div className="text-sm text-gray-600">{inspection.customer.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">No customer</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(inspection.type)}>{inspection.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{inspection.inspector}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{format(new Date(inspection.scheduledDate), "MMM d, yyyy")}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(inspection.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(inspection.status)}
                        {inspection.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Inspection
                        </DropdownMenuItem>
                        {inspection.status === "scheduled" && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(inspection._id, "in-progress")}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Inspection
                          </DropdownMenuItem>
                        )}
                        {inspection.status === "in-progress" && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(inspection._id, "completed")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Inspection
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleStatusUpdate(inspection._id, "cancelled")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Inspection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInspections?.length === 0 && (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No inspections found</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter !== "all"
                  ? `No ${statusFilter} inspections found`
                  : "Schedule your first inspection to get started"}
              </p>
              {statusFilter === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Inspection
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
