import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PageHeader from "@/components/shared/page-header"
import NominationForm from "@/components/nomination/nomination-form"

export const metadata = {
  title: "Leadership Nomination - APTSAICUF",
  description: "Submit your nomination for AP-TG State AICUF Leadership positions.",
}

export const dynamic = 'force-dynamic'

export default function NominationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <PageHeader
          title="AP-TG State AICUF Leadership Nomination"
          description="Submit your nomination for leadership positions"
        />

        <section className="w-full py-12 md:py-20 bg-white">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <NominationForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
