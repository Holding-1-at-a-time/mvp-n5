"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Trash2, FileText, Brain, MessageSquare, XCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface RagDashboardProps {
  shopId: string // To filter knowledge base by shop
}

export function RagDashboard({ shopId }: RagDashboardProps) {
  const [activeTab, setActiveTab] = useState("manage")
  const [newDocumentContent, setNewDocumentContent] = useState("")
  const [newDocumentTitle, setNewDocumentTitle] = useState("")
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState<string | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)

  const documents = useQuery(api.ragIntegration.listDocuments, { shopId })
  const addDocument = useMutation(api.ragIntegration.addDocument)
  const deleteDocument = useMutation(api.ragIntegration.deleteDocument)
  const queryRag = useMutation(api.ragIntegration.queryRag)

  const handleAddDocument = async () => {
    if (!newDocumentContent || !newDocumentTitle) {
      alert("Please provide both title and content for the document.")
      return
    }
    try {
      await addDocument({
        shopId,
        title: newDocumentTitle,
        content: newDocumentContent,
      })
      setNewDocumentTitle("")
      setNewDocumentContent("")
      alert("Document added and indexed successfully!")
    } catch (error: any) {
      alert(`Failed to add document: ${error.message}`)
    }
  }

  const handleDeleteDocument = async (id: Id<"knowledgeBase">) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument({ id })
        alert("Document deleted successfully!")
      } catch (error: any) {
        alert(`Failed to delete document: ${error.message}`)
      }
    }
  }

  const handleQueryRag = async () => {
    if (!query) {
      setQueryError("Please enter a query.")
      return
    }
    setQueryLoading(true)
    setQueryError(null)
    setQueryResult(null)
    try {
      const result = await queryRag({ shopId, query })
      setQueryResult(result)
    } catch (error: any) {
      setQueryError(`Failed to query knowledge base: ${error.message}`)
    } finally {
      setQueryLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Knowledge Base (RAG)</h2>
      <p className="text-muted-foreground">Manage and query your shop's knowledge base for AI-assisted insights.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Manage Documents
          </TabsTrigger>
          <TabsTrigger value="query" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Query Knowledge
          </TabsTrigger>
        </TabsList>

        {/* Manage Documents Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Document
              </CardTitle>
              <CardDescription>Add new repair procedures, common issues, or service notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-title">Document Title</Label>
                <Input
                  id="document-title"
                  placeholder="e.g., 'Brake Pad Replacement Guide'"
                  value={newDocumentTitle}
                  onChange={(e) => setNewDocumentTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-content">Content</Label>
                <Textarea
                  id="document-content"
                  placeholder="Enter the full text of the document here..."
                  value={newDocumentContent}
                  onChange={(e) => setNewDocumentContent(e.target.value)}
                  rows={8}
                />
              </div>
              <Button onClick={handleAddDocument} disabled={!newDocumentContent || !newDocumentTitle}>
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Existing Documents ({documents?.length || 0})
              </CardTitle>
              <CardDescription>All documents currently in your knowledge base.</CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{doc.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Added: {new Date(doc._creationTime).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents in your knowledge base yet.</p>
                  <p className="text-sm">Add new documents using the form above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Knowledge Tab */}
        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Query Knowledge Base
              </CardTitle>
              <CardDescription>Ask questions and get answers from your shop's knowledge.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query-input">Your Question</Label>
                <Textarea
                  id="query-input"
                  placeholder="e.g., 'How do I diagnose a P0420 code on a Honda Civic?'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleQueryRag} disabled={queryLoading || !query}>
                {queryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {queryLoading ? "Searching..." : "Get Answer"}
              </Button>

              {queryError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Error: {queryError}</AlertDescription>
                </Alert>
              )}

              {queryResult && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">AI Answer:</h3>
                  <Card className="bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-4 text-sm">
                      <p className="whitespace-pre-wrap">{queryResult}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
