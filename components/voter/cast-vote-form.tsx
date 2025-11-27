"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CastVoteForm() {
  const [voterId, setVoterId] = useState("")
  const [choice, setChoice] = useState("")
  const [step, setStep] = useState<"id" | "auth" | "vote" | "done">("id")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const startAuth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const optsRes = await fetch("/api/auth/passkey/voter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, step: "options" }),
        credentials: "include",
      })
      const opts = await optsRes.json()
      if (!optsRes.ok) throw new Error(opts.error || "Failed to get options")
      const { startAuthentication } = await import("@simplewebauthn/browser")
      const authResp = await startAuthentication(opts)
      const verifyRes = await fetch("/api/auth/passkey/voter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, step: "verify", assertionResponse: authResp }),
        credentials: "include",
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || "Passkey authentication failed")
      setStep("vote")
    } catch (e) {
      console.error("Passkey authentication error:", e)
      setError(e instanceof Error ? e.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const castVote = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/vote/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, choice }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to cast vote")
      setStep("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vote submission failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "done") {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">Vote recorded successfully.</div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}
      {step === "id" && (
        <>
          <div className="grid gap-2">
            <label htmlFor="voterId" className="text-sm font-light">Voter ID</label>
            <Input id="voterId" value={voterId} onChange={(e) => setVoterId(e.target.value)} placeholder="Enter your Voter ID" />
          </div>
          <Button onClick={startAuth} disabled={!voterId || isLoading} className="rounded-none bg-maroon hover:bg-maroon/90 text-white">
            {isLoading ? "Authenticating..." : "Authenticate and Continue"}
          </Button>
        </>
      )}
      {step === "vote" && (
        <>
          <div className="grid gap-2">
            <label htmlFor="choice" className="text-sm font-light">Your Choice</label>
            <Input id="choice" value={choice} onChange={(e) => setChoice(e.target.value)} placeholder="Type your vote" />
          </div>
          <Button onClick={castVote} disabled={!choice || isLoading} className="rounded-none bg-maroon hover:bg-maroon/90 text-white">
            {isLoading ? "Submitting..." : "Cast Vote"}
          </Button>
        </>
      )}
    </div>
  )
}
