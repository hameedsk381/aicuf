"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
        })
        router.push("/member/login")
        router.refresh()
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Member Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome Back!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            You have successfully logged in to the member portal.
                        </p>
                    </CardContent>
                </Card>

                {/* Add more dashboard widgets here */}
            </div>
        </div>
    )
}
