"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

interface Registration {
  id: number
  name: string
  emailId: string
  mobileNo: string
  whatsappNo: string
  applicationType: string
  gender: string
  age: string
  course: string
  registrationNo: string
  religion: string
  address: string
  unitName?: string
  registrationId: string
  createdAt: Date
}

export default function RegistrationsPage() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchRegistrations(token)
  }, [router])

  const fetchRegistrations = async (token: string) => {
    try {
      const response = await fetch("/api/admin/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch registrations")
      }

      setRegistrations(result.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Registration ID",
      "Name",
      "Email",
      "Mobile",
      "WhatsApp",
      "Type",
      "Gender",
      "Age",
      "Course",
      "Reg No",
      "Religion",
      "Address",
      "Status",
      "Date",
    ]

    const rows = registrations.map((reg) => [
      reg.registrationId,
      reg.name,
      reg.emailId,
      reg.mobileNo,
      reg.whatsappNo,
      reg.applicationType,
      reg.gender,
      reg.age,
      reg.course,
      reg.registrationNo,
      reg.religion,
      reg.address,
      reg.status,
      new Date(reg.createdAt).toLocaleDateString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`
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
            <h1 className="text-xl font-light text-maroon">Registrations</h1>
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
                    Registration ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{reg.registrationId}</td>
                      <td className="px-4 py-3 text-sm font-medium">{reg.name}</td>
                      <td className="px-4 py-3 text-sm">{reg.emailId}</td>
                      <td className="px-4 py-3 text-sm">{reg.mobileNo}</td>
                      <td className="px-4 py-3 text-sm capitalize">{reg.applicationType}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            reg.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : reg.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total: {registrations.length} registration{registrations.length !== 1 ? "s" : ""}
        </div>
      </main>
    </div>
  )
}
