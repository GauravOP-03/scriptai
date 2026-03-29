"use client"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  ArrowLeft, Loader2, Zap, Trash2, Save, Download, RefreshCw,
  Plus, Copy, Check, Image, MessageSquare, Pencil,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { ScriptLoaderSkeleton } from "@/components/dashboard/scripts/skeleton/scriptLoaderSkeleton"
import { ScriptMetadata } from "@/components/dashboard/scripts/ScriptMetadata"
import { api } from "@/lib/api-client"
import { downloadBlob } from "@/lib/download"

interface ScriptData {
  id: string
  title: string
  content: string
  prompt: string | null
  context: string | null
  tone: string | null
  include_storytelling: boolean
  reference_links: string | null
  language: string
  created_at: string
  updated_at: string
  include_timestamps: boolean
  duration: string
  credits_consumed: number
  status: string
}

export default function ScriptPage() {
  const router = useRouter()
  const params = useParams()
  const [script, setScript] = useState<ScriptData | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoadingScript, setIsLoadingScript] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copiedTitle, setCopiedTitle] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)

  const scriptId = params.id as string

  useEffect(() => {
    const fetchScript = async () => {
      if (!scriptId) return
      setIsLoadingScript(true)
      try {
        const data = await api.get<ScriptData>(`/api/v1/script/${scriptId}`, { requireAuth: true })
        setScript(data)
        setTitle(data.title)
        setContent(data.content)
      } catch (error: unknown) {
        toast.error("Error loading script", {
          description: error instanceof Error ? error.message : "Failed to fetch script details.",
        })
        router.push("/dashboard/scripts")
      } finally {
        setIsLoadingScript(false)
      }
    }
    fetchScript()
  }, [scriptId, router])

  const handleUpdateScript = async () => {
    if (!title || !content) {
      toast.error("Missing information", { description: "Please provide a title and content." })
      return
    }
    setLoading(true)
    try {
      await api.patch(`/api/v1/script/${scriptId}`, { title, content }, { requireAuth: true })
      toast.success("Script updated!", { description: "Changes saved successfully." })
      setIsEditing(false)
    } catch (error: unknown) {
      toast.error("Error updating script", {
        description: error instanceof Error ? error.message : "Failed to update.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteScript = async () => {
    setLoading(true)
    try {
      await api.delete(`/api/v1/script/${scriptId}`, { requireAuth: true })
      toast.success("Script deleted!")
      router.push("/dashboard/scripts")
    } catch (error: unknown) {
      toast.error("Error deleting script", {
        description: error instanceof Error ? error.message : "Failed to delete.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!scriptId) return
    try {
      const blob = await api.get<Blob>(`/api/v1/script/${scriptId}/export`, {
        requireAuth: true,
        responseType: "blob",
      })
      downloadBlob(blob, `${title || "script"}.pdf`)
      toast.success("PDF exported!")
    } catch {
      toast.error("Failed to export PDF")
    }
  }

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(title)
    setCopiedTitle(true)
    toast.success("Title copied!")
    setTimeout(() => setCopiedTitle(false), 2000)
  }

  const handleCopyScript = () => {
    navigator.clipboard.writeText(content)
    setCopiedScript(true)
    toast.success("Script copied!")
    setTimeout(() => setCopiedScript(false), 2000)
  }

  if (isLoadingScript) return <ScriptLoaderSkeleton />
  if (!script) return null

  return (
    <TooltipProvider delayDuration={200}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

        {/* ── Page Header ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/scripts")}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Script Details</h1>
              <p className="text-sm text-slate-500">View and edit your script</p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {script.credits_consumed > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                <Zap className="h-3.5 w-3.5" />
                {script.credits_consumed} credit{script.credits_consumed > 1 ? "s" : ""} used
              </span>
            )}
            <Link href={`/dashboard/thumbnails/new?title=${encodeURIComponent(title)}`}>
              <Button variant="ghost" className="h-9 gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Generate Thumbnail</span>
              </Button>
            </Link>
            <Link href={`/dashboard/subtitles/new?scriptId=${scriptId}`}>
              <Button variant="ghost" className="h-9 gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Create Subtitles</span>
              </Button>
            </Link>
            <Link href="/dashboard/scripts/new">
              <Button className="h-9 gap-2 text-sm font-bold bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl shadow-sm">
                <Plus className="h-4 w-4" />
                New Script
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left: Script Content Card ── */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0E1338] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col">

            {/* Card Header: "Script Content" + icon actions */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Script Content</h2>
                <p className="text-xs text-slate-500 mt-0.5">Edit the title and content. Changes are saved when you click Save.</p>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={loading}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUpdateScript}
                      disabled={loading}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#347AF9] hover:bg-[#347AF9]/10"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleExport}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export PDF</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (script) {
                          setTitle(script.title)
                          setContent(script.content)
                          setIsEditing(false)
                          toast.info("Reset to original")
                        }
                      }}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8 sm:p-10 space-y-6">

              {/* ── Title Section ── */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Title</label>
                <div className="relative group">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled Script..."
                    className="w-full text-lg font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#347AF9]/30 focus:border-[#347AF9] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleCopyTitle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-[#347AF9] hover:bg-[#347AF9]/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        {copiedTitle ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy title</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* ── Content Section ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content</label>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(!isEditing)
                            if (!isEditing) {
                              setTimeout(() => textareaRef.current?.focus(), 0)
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${isEditing
                            ? "bg-[#347AF9]/10 text-[#347AF9]"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{isEditing ? "Switch to preview" : "Enable editing"}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleCopyScript}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#347AF9] hover:bg-[#347AF9]/10 transition-all"
                        >
                          {copiedScript ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copy script</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    autoFocus
                    placeholder="Start writing your script here..."
                    className="w-full min-h-[450px] max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[#347AF9]/30 focus:border-[#347AF9] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 font-mono"
                  />
                ) : (
                  <div
                    onClick={() => {
                      setIsEditing(true)
                      setTimeout(() => textareaRef.current?.focus(), 0)
                    }}
                    className="min-h-[300px] max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 cursor-text hover:border-[#347AF9]/30 transition-all prose prose-slate dark:prose-invert prose-sm max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-a:text-[#347AF9]"
                  >
                    {content ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 italic">Click to start writing...</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Generation Details ── */}
          <div className="lg:col-span-4 sticky top-6">
            <ScriptMetadata script={script} />
          </div>

        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this script?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. &quot;{script.title}&quot; will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteScript} className="bg-red-600 hover:bg-red-700 rounded-xl text-white">
                Delete Script
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}