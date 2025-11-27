"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Mail, 
  LogOut,
  FileText
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    registrations: 0,
    nominations: 0,
    contacts: 0,
    newsletters: 0
  })
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])
  const [recentContacts, setRecentContacts] = useState<any[]>([])

  useEffect(() => {
    // No need to check localStorage - middleware handles authentication
    // Just fetch dashboard data
    fetchDashboardData()
    setIsLoading(false)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // No token needed - cookie is sent automatically
      const [registrationsRes, nominationsRes, contactsRes, newslettersRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/nominations"),
        fetch("/api/admin/contacts"),
        fetch("/api/admin/newsletters")
      ])

      const [registrationsData, nominationsData, contactsData, newslettersData] = await Promise.all([
        registrationsRes.json(),
        nominationsRes.json(),
        contactsRes.json(),
        newslettersRes.json()
      ])

      setStats({
        registrations: registrationsData.count || 0,
        nominations: nominationsData.count || 0,
        contacts: contactsData.count || 0,
        newsletters: newslettersData.count || 0
      })

      // Get recent 5 registrations
      setRecentRegistrations(registrationsData.data?.slice(0, 5) || [])
      
      // Get recent 5 contacts
      setRecentContacts(contactsData.data?.slice(0, 5) || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
  }

  const handleLogout = async () => {
    // Call logout API to clear cookie
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const statsData = [
    { label: "Total Registrations", value: stats.registrations.toString(), icon: Users, color: "text-blue-600" },
    { label: "Total Nominations", value: stats.nominations.toString(), icon: FileText, color: "text-green-600" },
    { label: "Contact Messages", value: stats.contacts.toString(), icon: Mail, color: "text-purple-600" },
    { label: "Newsletter Subscribers", value: stats.newsletters.toString(), icon: Mail, color: "text-orange-600" },
  ]

  const quickActions = [
    { label: "View Registrations", href: "/admin/registrations", icon: Users },
    { label: "View Nominations", href: "/admin/nominations", icon: FileText },
    { label: "View Contacts", href: "/admin/contacts", icon: Mail },
    { label: "Newsletter List", href: "/admin/newsletter", icon: Mail },
    { label: "View Voters", href: "/admin/voters", icon: Users },
    { label: "View Election Results", href: "/admin/election/results", icon: FileText },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <h1 className="text-xl font-light text-maroon">APTSAICUF Admin Dashboard</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-none border-maroon text-maroon hover:bg-maroon/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-light text-maroon mb-2">Dashboard Overview</h2>
            <p className="text-muted-foreground font-extralight">
              Welcome back! Here's what's happening with APTSAICUF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white border border-primary/10 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-light text-maroon mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-extralight">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-white border border-primary/10 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-light text-maroon mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center gap-3 p-4 border border-primary/10 rounded hover:bg-blue-50 hover:border-primary/30 transition-all"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-light">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-primary/10 rounded-lg p-6">
              <h3 className="text-lg font-light text-maroon mb-4">Recent Registrations</h3>
              <div className="space-y-4">
                {recentRegistrations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No registrations yet</p>
                ) : (
                  recentRegistrations.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-light">{reg.name}</p>
                        <p className="text-sm text-muted-foreground font-extralight capitalize">{reg.applicationType}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Link href="/admin/registrations" className="text-sm text-primary hover:underline mt-4 inline-block">
                View all registrations →
              </Link>
            </div>

            <div className="bg-white border border-primary/10 rounded-lg p-6">
              <h3 className="text-lg font-light text-maroon mb-4">Recent Contact Messages</h3>
              <div className="space-y-4">
                {recentContacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
                ) : (
                  recentContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-light">{contact.name}</p>
                        <p className="text-sm text-muted-foreground font-extralight truncate max-w-[200px]">{contact.subject}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${contact.status === 'unread' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {contact.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Link href="/admin/contacts" className="text-sm text-primary hover:underline mt-4 inline-block">
                View all messages →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
