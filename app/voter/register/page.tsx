export const metadata = {
  title: "Voter Registration",
  description: "Register as a voter by providing your details and creating a passkey.",
}

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PageHeader from "@/components/shared/page-header"
import VoterRegistrationForm from "@/components/voter/voter-registration-form"

export default function VoterRegistrationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageHeader
        title="Voter Registration"
        description="Fill in your details and create a passkey to receive your voter ID."
        bgClass="bg-blue-50"
      />
      <main className="container px-4 md:px-6 py-12 flex-1">
        <div className="max-w-xl mx-auto border border-primary/10 bg-white p-8 shadow-sm">
          <VoterRegistrationForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
