"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Building2, Settings, Users, Calendar } from "lucide-react"
import { toast } from "sonner"

const createShopSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  address: z.string().min(1, "Address is required"),
  contactEmail: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
})

type CreateShopForm = z.infer<typeof createShopSchema>

export function ShopManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<string>("")

  const shops = useQuery(api.shops.list)
  const createShop = useMutation(api.shops.create)
  const updateSettings = useMutation(api.shops.updateSettings)

  const form = useForm<CreateShopForm>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: "",
      address: "",
      contactEmail: "",
      phone: "",
      website: "",
    },
  })

  const onCreateShop = async (data: CreateShopForm) => {
    try {
      await createShop(data)
      toast.success("Shop created successfully")
      setIsCreateDialogOpen(false)
      form.reset()
    } catch (error) {
      toast.error("Failed to create shop")
      console.error(error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "trial":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800"
      case "professional":
        return "bg-blue-100 text-blue-800"
      case "basic":
        return "bg-green-100 text-green-800"
      case "trial":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shop Management</h2>
          <p className="text-gray-600">Manage your shops and their settings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Shop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Shop</DialogTitle>
              <DialogDescription>Add a new shop to your Slick Solutions account</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateShop)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter shop name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter shop address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@shop.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://shop.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Shop</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops?.map((shop) => (
          <Card key={shop._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{shop.name}</CardTitle>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(shop.status)}>{shop.status}</Badge>
                  <Badge className={getSubscriptionColor(shop.subscription.plan)}>{shop.subscription.plan}</Badge>
                </div>
              </div>
              <CardDescription className="text-sm">{shop.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Contact:</span>
                  <span className="text-gray-600">{shop.contactEmail}</span>
                </div>

                {shop.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Phone:</span>
                    <span className="text-gray-600">{shop.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Role:</span>
                  <Badge variant="outline">{shop.userRole}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span className="text-gray-600">
                    Expires: {new Date(shop.subscription.expiresAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Features:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {shop.settings.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Users className="h-4 w-4 mr-1" />
                    Users
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shops?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No shops found</h3>
            <p className="text-gray-600 mb-4">Create your first shop to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Shop
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
