"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Search, Plus, Trash2, Database, TrendingUp } from "lucide-react"

interface RagDashboardProps {
  shopId: string
}

export function RagDashboard({ shopId }: RagDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [newProcedure, setNewProcedure] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  })

  // Queries
  const knowledgeStats = useQuery(api.ragIntegration.getKnowledgeStats, { shopId })

  // Mutations
  const addProcedure = useMutation(api.ragIntegration.addServiceProcedureToRag)
  const cleanupOld = useMutation(api.ragIntegration.cleanupOldEntries)

  const handleAddProcedure = async () => {
    if (!newProcedure.title || !newProcedure.content) return

    try {
      await addProcedure({
        shopId,
        title: newProcedure.title,
        content: newProcedure.content,
        category: newProcedure.category || "general",
        tags: newProcedure.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      })

      setNewProcedure({ title: "", content: "", category: "", tags: "" })
    } catch (error) {
      console.error("Failed to add procedure:", error)
    }
  }

  const handleCleanup = async () => {
    try {
      await cleanupOld({
        shopId,
        olderThanDays: 90, // Clean up entries older than 90 days
      })
    } catch (error) {
      console.error("Failed to cleanup old entries:", error)
    }
  }

  if (!knowledgeStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading RAG dashboard...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base & RAG Management</h2>
          <p className="text-muted-foreground">Manage your shop's knowledge base and semantic search capabilities</p>
        </div>
        <Button onClick={handleCleanup} variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Cleanup Old Entries
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeStats.totalEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeStats.byNamespace.inspections || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procedures</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeStats.byNamespace.procedures || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Types</CardTitle>
            <Badge variant="secondary">{Object.keys(knowledgeStats.byType).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(knowledgeStats.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="capitalize">{type}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search Knowledge</TabsTrigger>
          <TabsTrigger value="add">Add Procedure</TabsTrigger>
          <TabsTrigger value="recent">Recent Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Knowledge Base</CardTitle>
              <CardDescription>
                Search through your shop's accumulated knowledge using semantic similarity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for procedures, past cases, or knowledge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Search results would go here */}
              <div className="text-sm text-muted-foreground">
                Enter a search query to find relevant knowledge from your shop's history
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Service Procedure</CardTitle>
              <CardDescription>Add new service procedures and best practices to your knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="e.g., Paint Correction for Scratches"
                    value={newProcedure.title}
                    onChange={(e) => setNewProcedure((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    placeholder="e.g., paint_correction, leather_care"
                    value={newProcedure.category}
                    onChange={(e) => setNewProcedure((prev) => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Detailed procedure steps, tips, and best practices..."
                  value={newProcedure.content}
                  onChange={(e) => setNewProcedure((prev) => ({ ...prev, content: e.target.value }))}
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="scratch, paint, correction, compound"
                  value={newProcedure.tags}
                  onChange={(e) => setNewProcedure((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <Button onClick={handleAddProcedure} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Procedure to Knowledge Base
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Knowledge Entries</CardTitle>
              <CardDescription>Latest additions to your shop's knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledgeStats.recentEntries.map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{entry.metadata.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.metadata.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-3">{entry.content}</p>
                    {entry.metadata.category && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.metadata.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
