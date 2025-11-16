"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Trash2 } from "lucide-react"
import Link from "next/link"

interface Newsletter {
  id: number
  email: string
  subscribedAt: Date
}

export default function NewsletterPage() {
  const router = useRouter()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchNewsletters(token)
  }, [router])

  const fetchNewsletters = async (token: string) => {
    try {
      const response = await fetch("/api/admin/newsletters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch newsletters")
      }

      setNewsletters(result.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return

    const token = localStorage.getItem("admin-token")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/newsletters?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete subscriber")
      }

      // Refresh the list
      fetchNewsletters(token)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete subscriber")
    }
  }

  const exportToCSV = () => {
    const headers = ["Email", "Subscribed Date"]

    const rows = newsletters.map((newsletter) => [
      newsletter.email,
      new Date(newsletter.subscribedAt).toLocaleDateString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-light text-maroon">Newsletter Subscribers</h1>
          </div>
          <Button
            onClick={exportToCSV}
            className="rounded-none bg-maroon hover:bg-maroon/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white border border-primary/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subscribed Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {newsletters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No subscribers yet
                    </td>
                  </tr>
                ) : (
                  newsletters.map((newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{newsletter.email}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(newsletter.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(newsletter.id)}
                          className="h-7 px-2 rounded-none"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total: {newsletters.length} subscriber{newsletters.length !== 1 ? "s" : ""}
        </div>
      </main>
    </div>
  )
}
