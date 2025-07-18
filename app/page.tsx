"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { StatusBadge } from "@/components/ui/status-badge"
import { Car, ClipboardCheck, Users, Building2, Sparkles, ArrowRight, Shield, Zap, Eye, BarChart3 } from "lucide-react"
import Link from "next/link"

// ---- DEMO DATA (avoids Convex proxy error) ----
import { demoShops, type DemoShop as Shop } from "@/lib/demo-data"
// -----------------------------------------------

// If you have Convex running, replace the line above with:
// import { useQuery } from "convex/react"
// import { api } from "@/convex/_generated/api"

export default function HomePage() {
  // const shops = useQuery(api.shops.list) ?? []
  const shops: Shop[] = demoShops
  const currentShop = shops?.[0]

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Advanced computer-vision for accurate damage detection and assessment",
      color: "text-[#00ae98]",
    },
    {
      icon: ClipboardCheck,
      title: "Digital Inspections",
      description: "Streamlined inspection workflow with real-time collaboration",
      color: "text-blue-400",
    },
    {
      icon: BarChart3,
      title: "Dynamic Pricing",
      description: "Intelligent pricing engine based on market data and damage analysis",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "Enterprise-grade Security",
      description: "Bank-level security with multi-tenant architecture",
      color: "text-purple-400",
    },
  ]

  const stats = [
    { label: "Active Shops", value: shops.length, icon: Building2 },
    { label: "Inspections", value: "2,847", icon: ClipboardCheck },
    { label: "Customers", value: "1,234", icon: Users },
    { label: "Vehicles", value: "3,456", icon: Car },
  ]

  return (
    <div className="min-h-screen">
      {/* ──────────────────── Navigation ──────────────────── */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Link href="/admin">
            <Button className="bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 hover:from-[#00ae98]/90 hover:to-[#00ae98]/70 shadow-lg shadow-[#00ae98]/25">
              <Eye className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* ──────────────────── Hero ──────────────────── */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <StatusBadge status="ai-powered" className="mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Future of&nbsp;
            <span className="bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 bg-clip-text text-transparent">
              Vehicle&nbsp;Inspection
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Revolutionize your automotive business with AI-powered damage detection, intelligent pricing, and
            streamlined workflow management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 hover:from-[#00ae98]/90 hover:to-[#00ae98]/70 shadow-lg shadow-[#00ae98]/25"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────── Stats ──────────────────── */}
      <section className="py-16 border-y border-slate-700 bg-slate-800/30">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, ...stat }) => (
            <div key={stat.label} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00ae98]/20 to-[#00ae98]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="h-8 w-8 text-[#00ae98]" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────── Features ──────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features for Modern Shops</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to streamline operations and deliver exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map(({ icon: Icon, ...feature }) => (
              <Card
                key={feature.title}
                className="glass-effect hover:bg-slate-700/50 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center group-hover:bg-slate-600/50 transition-colors">
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── Current Shop ──────────────────── */}
      {currentShop && (
        <section className="py-16 bg-slate-800/30">
          <div className="container mx-auto px-4">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-[#00ae98]" />
                      {currentShop.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-2">{currentShop.address}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={currentShop.status} />
                    <Badge className="bg-[#00ae98]/20 text-[#00ae98] border border-[#00ae98]/30">
                      {currentShop?.subscription?.plan ?? "Unknown"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {currentShop?.settings?.features?.length ?? 0}
                    </div>
                    <div className="text-slate-400">Active Features</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{currentShop.userRole}</div>
                    <div className="text-slate-400">Your Role</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {currentShop?.subscription?.expiresAt
                        ? new Date(currentShop.subscription.expiresAt).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="text-slate-400">Expires</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* ──────────────────── CTA ──────────────────── */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of automotive professionals who trust Slick Solutions.
          </p>
          <Link href="/admin">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 hover:from-[#00ae98]/90 hover:to-[#00ae98]/70 shadow-lg shadow-[#00ae98]/25"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Your Journey
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ──────────────────── Footer ──────────────────── */}
      <footer className="border-t border-slate-700 bg-slate-800/50 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <Logo size="sm" />
          <div className="text-slate-400 mt-4 md:mt-0">© 2024 Slick Solutions. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
