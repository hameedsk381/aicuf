import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header />
            <main className="flex-1 bg-gray-50">
                {children}
            </main>
            <Footer />
        </div>
    )
}
