"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ExternalLink, Trash2, Check, X, FileDown } from "lucide-react"
import Link from "next/link"

interface Nomination {
  id: number
  name: string
  unitName: string
  contestingFor: string
  educationQualification: string
  nocFilePath: string
  nocFileName: string
  status: string
  createdAt: Date
}

export default function NominationsPage() {
  const router = useRouter()
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchNominations(token)
  }, [router])

  const fetchNominations = async (token: string) => {
    try {
      const response = await fetch("/api/admin/nominations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch nominations")
      }

      setNominations(result.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    const token = localStorage.getItem("admin-token")
    if (!token) return

    try {
      const response = await fetch("/api/admin/nominations", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Refresh the list
      fetchNominations(token)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this nomination?")) return

    const token = localStorage.getItem("admin-token")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/nominations?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete nomination")
      }

      // Refresh the list
      fetchNominations(token)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete nomination")
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Unit",
      "Position",
      "Education",
      "NOC File",
      "Status",
      "Date",
    ]

    const rows = nominations.map((nom) => [
      nom.name,
      nom.unitName,
      nom.contestingFor,
      nom.educationQualification.replace(/,/g, ";"),
      nom.nocFileName,
      nom.status,
      new Date(nom.createdAt).toLocaleDateString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nominations-${new Date().toISOString().split("T")[0]}.csv`
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
            <h1 className="text-xl font-light text-maroon">Leadership Nominations</h1>
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
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Education
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NOC File
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {nominations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No nominations found
                    </td>
                  </tr>
                ) : (
                  nominations.map((nom) => (
                    <tr key={nom.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{nom.name}</td>
                      <td className="px-4 py-3 text-sm">{nom.unitName}</td>
                      <td className="px-4 py-3 text-sm">{nom.contestingFor}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {nom.educationQualification}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <a
                            href={nom.nocFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                          <a
                            href={nom.nocFilePath}
                            download={nom.nocFileName}
                            className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                          >
                            <FileDown className="h-3 w-3" />
                            Download
                          </a>
                          <span className="text-xs text-gray-500 truncate max-w-[120px]" title={nom.nocFileName}>
                            {nom.nocFileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            nom.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : nom.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {nom.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(nom.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {nom.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(nom.id, "approved")}
                                className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white rounded-none"
                                title="Approve"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(nom.id, "rejected")}
                                className="h-7 px-2 bg-red-600 hover:bg-red-700 text-white rounded-none"
                                title="Reject"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(nom.id)}
                            className="h-7 px-2 rounded-none"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total: {nominations.length} nomination{nominations.length !== 1 ? "s" : ""}
        </div>
      </main>
    </div>
  )
}
