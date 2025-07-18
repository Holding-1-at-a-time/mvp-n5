import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { DollarSign, Calendar, Phone, Mail, Car, Wrench, Package, Percent, Star } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

// Define a more granular InvoiceItem type
interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  type: "service" | "labor" | "material" | "parts" // Expanded types
}

export default function InvoicePage() {
  // Hardcoded shopId and customerId for demonstration
  const shopId = "shop123"
  const customerId = "customer456"

  const shopSettings = useQuery(api.pricing.getShopSettings, { shopId })
  const customerProfile = useQuery(api.pricing.getCustomerProfile, { shopId, customerId })

  const invoiceNumber = "INV-2024-001"
  const invoiceDate = "July 18, 2025"
  const dueDate = "August 1, 2025"

  const customerInfo = {
    name: "John Doe",
    address: "123 Main St, Anytown, USA",
    phone: "(555) 123-4567",
    email: "john.doe@example.com",
  }

  const vehicleInfo = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    vin: "123ABC456DEF789GHI",
  }

  const invoiceItems: InvoiceItem[] = [
    { id: "1", description: "Oil Change Service", quantity: 1, unitPrice: 75.0, type: "service" },
    { id: "2", description: "Tire Rotation", quantity: 1, unitPrice: 30.0, type: "service" },
    { id: "3", description: "Brake Pad Replacement (Labor)", quantity: 2, unitPrice: 60.0, type: "labor" },
    { id: "4", description: "Brake Pads (Front Set)", quantity: 1, unitPrice: 120.0, type: "parts" },
    { id: "5", description: "Engine Air Filter", quantity: 1, unitPrice: 25.0, type: "material" },
  ]

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  // Calculate totals for service/labor and material/parts separately
  const serviceAndLaborTotal = invoiceItems
    .filter((item) => item.type === "service" || item.type === "labor")
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const materialAndPartsTotal = invoiceItems
    .filter((item) => item.type === "material" || item.type === "parts")
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const serviceTaxRate = shopSettings?.serviceTaxRate ?? 0.08 // Default to 8% if not loaded
  const materialTaxRate = shopSettings?.materialTaxRate ?? 0.07 // Default to 7% if not loaded

  const serviceTax = serviceAndLaborTotal * serviceTaxRate
  const materialTax = materialAndPartsTotal * materialTaxRate
  const totalTax = serviceTax + materialTax

  const totalAmount = subtotal + totalTax

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-primary">Invoice</h1>
            <p className="text-muted-foreground">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Slick Solutions Inc.</h2>
            <p className="text-sm text-muted-foreground">123 Workshop Way, Tech City, TX 78701</p>
            <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
              <Phone className="h-3 w-3" /> (555) 987-6543
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
              <Mail className="h-3 w-3" /> info@slicksolutions.com
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
              <p className="font-medium">{customerInfo.name}</p>
              <p className="text-muted-foreground">{customerInfo.address}</p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {customerInfo.phone}
              </p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {customerInfo.email}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Vehicle Details:</h3>
              <p className="font-medium flex items-center gap-1">
                <Car className="h-4 w-4" /> {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </p>
              <p className="text-muted-foreground">VIN: {vehicleInfo.vin}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Invoice Date</p>
                <p className="font-medium">{invoiceDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{dueDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Membership Tier</p>
                <p className="font-medium">{customerProfile?.membershipTier || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Loyalty Points</p>
                <p className="font-medium">{customerProfile?.loyaltyPoints || 0}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Items:</h3>
            <div className="grid grid-cols-4 font-medium text-muted-foreground pb-2 border-b">
              <span className="col-span-2">Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Amount</span>
            </div>
            {invoiceItems.map((item) => (
              <div key={item.id} className="grid grid-cols-4 items-center py-2 border-b border-dashed last:border-b-0">
                <div className="col-span-2 flex items-center gap-2">
                  {item.type === "service" && <Wrench className="h-4 w-4 text-blue-500" />}
                  {item.type === "labor" && <Wrench className="h-4 w-4 text-blue-500" />}
                  {item.type === "material" && <Package className="h-4 w-4 text-green-500" />}
                  {item.type === "parts" && <Package className="h-4 w-4 text-green-500" />}
                  <span>{item.description}</span>
                </div>
                <span className="text-center">{item.quantity}</span>
                <span className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-right font-medium">
            <div className="col-span-1">Subtotal:</div>
            <div className="col-span-1">${subtotal.toFixed(2)}</div>

            <div className="col-span-1 flex items-center justify-end gap-1">
              <Percent className="h-4 w-4 text-muted-foreground" /> Service & Labor Tax (
              {Math.round(serviceTaxRate * 100)}%):
            </div>
            <div className="col-span-1">${serviceTax.toFixed(2)}</div>

            <div className="col-span-1 flex items-center justify-end gap-1">
              <Percent className="h-4 w-4 text-muted-foreground" /> Material & Parts Tax (
              {Math.round(materialTaxRate * 100)}%):
            </div>
            <div className="col-span-1">${materialTax.toFixed(2)}</div>

            <div className="col-span-1 text-xl font-bold">Total Due:</div>
            <div className="col-span-1 text-xl font-bold">${totalAmount.toFixed(2)}</div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end p-6">
          <Button size="lg">
            <DollarSign className="h-5 w-5 mr-2" /> Pay Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
