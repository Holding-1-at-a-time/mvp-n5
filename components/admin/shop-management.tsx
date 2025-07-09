"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/ui/status-badge"
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
import { Plus, Building2, Settings, Users, Calendar, Sparkles } from "lucide-react"
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

  const shops = useQuery(api.shops.list)
  const createShop = useMutation(api.shops.create)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Shop Management</h2>
          <p className="text-slate-400">Manage your shops and their settings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 hover:from-[#00ae98]/90 hover:to-[#00ae98]/70 shadow-lg shadow-[#00ae98]/25">
              <Plus className="h-4 w-4 mr-2" />
              Create Shop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-effect">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Shop</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new shop to your Slick Solutions account
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateShop)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Shop Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter shop name"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-ring"
                          {...field}
                        />
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
                      <FormLabel className="text-slate-300">Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter shop address"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-ring"
                          {...field}
                        />
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
                      <FormLabel className="text-slate-300">Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@shop.com"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-ring"
                          {...field}
                        />
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
                      <FormLabel className="text-slate-300">Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(555) 123-4567"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-ring"
                          {...field}
                        />
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
                      <FormLabel className="text-slate-300">Website (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://shop.com"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-ring"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 hover:from-[#00ae98]/90 hover:to-[#00ae98]/70"
                  >
                    Create Shop
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops?.map((shop) => (
          <Card key={shop._id} className="glass-effect hover:bg-slate-700/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00ae98]/20 to-[#00ae98]/10 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-[#00ae98]" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{shop.name}</CardTitle>
                    <CardDescription className="text-slate-400 text-sm">{shop.address}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <StatusBadge status={shop.status} />
                  <StatusBadge
                    status={shop.subscription.plan}
                    className="bg-[#00ae98]/20 text-[#00ae98] border border-[#00ae98]/30"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-300">Contact:</span>
                  <span className="text-slate-400">{shop.contactEmail}</span>
                </div>

                {shop.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-300">Phone:</span>
                    <span className="text-slate-400">{shop.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-300">Role:</span>
                  <StatusBadge status={shop.userRole} />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400">
                    Expires: {new Date(shop.subscription.expiresAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-600">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Sparkles className="h-4 w-4 text-[#00ae98]" />
                    <span className="font-medium text-slate-300">Features:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {shop.settings.features.map((feature) => (
                      <StatusBadge
                        key={feature}
                        status={feature}
                        className="bg-slate-700/50 text-slate-300 border border-slate-600 text-xs"
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
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
        <Card className="glass-effect">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No shops found</h3>
            <p className="text-slate-400 mb-4">Create your first shop to get started</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 hover:from-[#00ae98]/90 hover:to-[#00ae98]/70 shadow-lg shadow-[#00ae98]/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Shop
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
