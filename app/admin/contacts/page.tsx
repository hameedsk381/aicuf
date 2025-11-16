"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Check, Trash2 } from "lucide-react"
import Link from "next/link"

interface Contact {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: Date
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchContacts(token)
  }, [router])

  const fetchContacts = async (token: string) => {
    try {
      const response = await fetch("/api/admin/contacts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch contacts")
      }

      setContacts(result.data)
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
      const response = await fetch("/api/admin/contacts", {
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
      fetchContacts(token)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    const token = localStorage.getItem("admin-token")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete contact")
      }

      setSelectedContact(null)
      // Refresh the list
      fetchContacts(token)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete contact")
    }
  }

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Subject", "Message", "Status", "Date"]

    const rows = contacts.map((contact) => [
      contact.name,
      contact.email,
      contact.subject,
      contact.message.replace(/,/g, ";"),
      contact.status,
      new Date(contact.createdAt).toLocaleDateString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`
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
            <h1 className="text-xl font-light text-maroon">Contact Messages</h1>
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

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-primary/10 rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-medium text-maroon">Messages</h2>
            </div>
            <div className="divide-y max-h-[calc(100vh-12rem)] overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No contact messages found
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedContact?.id === contact.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          contact.status === "replied"
                            ? "bg-green-100 text-green-700"
                            : contact.status === "read"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{contact.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{contact.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(contact.createdAt).toLocaleDateString()} at{" "}
                      {new Date(contact.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-primary/10 rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-medium text-maroon">Message Details</h2>
            </div>
            <div className="p-6">
              {selectedContact ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                    <p className="text-sm mt-1">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-sm mt-1">
                      <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                        {selectedContact.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
                    <p className="text-sm mt-1">{selectedContact.subject}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                    <p className="text-sm mt-1">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    {selectedContact.status === "unread" && (
                      <Button
                        onClick={() => handleStatusChange(selectedContact.id, "read")}
                        className="flex-1 rounded-none bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    {selectedContact.status === "read" && (
                      <Button
                        onClick={() => handleStatusChange(selectedContact.id, "unread")}
                        className="flex-1 rounded-none bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        Mark as Unread
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(selectedContact.id)}
                      variant="destructive"
                      className="flex-1 rounded-none"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  Select a message to view details
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total: {contacts.length} message{contacts.length !== 1 ? "s" : ""}
        </div>
      </main>
    </div>
  )
}
