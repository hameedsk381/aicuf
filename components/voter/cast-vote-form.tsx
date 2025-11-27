"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CastVoteForm() {
  const [voterId, setVoterId] = useState("")
  const [step, setStep] = useState<"id" | "auth" | "vote" | "done">("id")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [positions, setPositions] = useState<{ position: string; candidates: { id: number; name: string; unitName: string }[] }[]>([])
  const [selections, setSelections] = useState<Record<string, number | null>>({})

  const startAuth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Starting passkey authentication for voter:', voterId)

      const optsRes = await fetch("/api/auth/passkey/voter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, step: "options" }),
        credentials: "include",
      })
      const raw = await optsRes.json()

      if (!optsRes.ok) {
        console.error('Failed to get passkey options:', raw)
        throw new Error(raw.error || "Failed to get options")
      }

      const opts = raw?.challenge ? raw : (raw?.optionsJSON ?? raw?.options ?? raw?.publicKey ?? raw?.requestOptions)
      if (!opts?.challenge) {
        console.error('Invalid authentication options structure:', raw)
        throw new Error("Invalid authentication options")
      }

      console.log('Received authentication options:', {
        rpId: (opts as any).rpId,
        allowCredentialsCount: (opts as any).allowCredentials?.length || 0
      })

      const { startAuthentication } = await import("@simplewebauthn/browser")

      console.log('Calling browser passkey API...')
      const authResp = await startAuthentication(opts as any)
      console.log('Browser returned authentication response')

      const verifyRes = await fetch("/api/auth/passkey/voter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, step: "verify", assertionResponse: authResp }),
        credentials: "include",
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || "Passkey authentication failed")

      console.log('Authentication successful')
      // Load election options
      const optionsRes = await fetch('/api/election/options')
      const optionsData = await optionsRes.json()
      if (!optionsRes.ok || !optionsData.success) throw new Error(optionsData.message || 'Failed to load election options')
      setPositions(optionsData.positions)
      const init: Record<string, number | null> = {}
      for (const p of optionsData.positions as any[]) {
        init[p.position] = null
      }
      setSelections(init)
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
        body: JSON.stringify({ voterId, selections: Object.entries(selections).map(([position, nominationId]) => ({ position, nominationId })) }),
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
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm"><strong>Error:</strong> {error}</div>}
      {step === "id" && (
        <>
          <div className="grid gap-2">
            <label htmlFor="voterId" className="text-sm font-light">Voter ID</label>
            <Input id="voterId" value={voterId} onChange={(e) => setVoterId(e.target.value)} placeholder="Enter your Voter ID" />
            <p className="text-xs text-muted-foreground">
              Use the same Voter ID you registered with. Each passkey is linked to a specific Voter ID.
            </p>
          </div>
          <Button onClick={startAuth} disabled={!voterId || isLoading} className="rounded-none bg-maroon hover:bg-maroon/90 text-white">
            {isLoading ? "Authenticating..." : "Authenticate and Continue"}
          </Button>
        </>
      )}
      {step === "vote" && (
        <>
          <div className="grid gap-6">
            {positions.map(p => (
              <div key={p.position} className="grid gap-2">
                <label className="text-sm font-light">{p.position}</label>
                <div className="grid gap-2">
                  {p.candidates.map(c => (
                    <label key={c.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`candidate-${p.position}`}
                        value={c.id}
                        checked={selections[p.position] === c.id}
                        onChange={() => setSelections(prev => ({ ...prev, [p.position]: c.id }))}
                      />
                      <span className="text-sm">{c.name} — {c.unitName}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={castVote} disabled={Object.values(selections).some(v => v == null) || isLoading} className="rounded-none bg-maroon hover:bg-maroon/90 text-white mt-4">
            {isLoading ? "Submitting..." : "Cast Vote"}
          </Button>
        </>
      )}
    </div>
  )
}
