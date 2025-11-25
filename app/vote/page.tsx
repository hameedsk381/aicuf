export const metadata = {
  title: "Cast Vote",
  description: "Authenticate with your device passkey and cast your vote.",
}

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PageHeader from "@/components/shared/page-header"
import CastVoteForm from "@/components/voter/cast-vote-form"

export default function VotePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageHeader title="Cast Your Vote" description="Enter your Voter ID, authenticate with your device, and submit your choice." bgClass="bg-blue-50" />
      <main className="container px-4 md:px-6 py-12 flex-1">
        <div className="max-w-xl mx-auto border border-primary/10 bg-white p-8 shadow-sm">
          <CastVoteForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}

