"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { startRegistration, startAuthentication } from "@simplewebauthn/browser"

export default function VoterPasskeySetup({ voterId, onSuccess, auto = false }: { voterId: string; onSuccess?: () => void; auto?: boolean }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)
    try {
      const optionsRes = await fetch('/api/auth/passkey/voter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, step: 'options' }),
      })
      const options = await optionsRes.json()
      const attResp = await startRegistration(options)

      const verifyRes = await fetch('/api/auth/passkey/voter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, step: 'verify', attestationResponse: attResp }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Failed to register passkey')
      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Passkey registration failed')
    } finally {
      setIsRegistering(false)
    }
  }

  useEffect(() => {
    if (auto && !success && !isRegistering) {
      handleRegister()
    }
  }, [auto, success, isRegistering])

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
      )}
      {success ? (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">
          Passkey set up successfully. You can use your device authentication to vote.
        </div>
      ) : (
        <Button onClick={handleRegister} disabled={isRegistering} className="rounded-none bg-maroon hover:bg-maroon/90 text-white">
          {isRegistering ? 'Setting up...' : 'Set up device passkey'}
        </Button>
      )}
    </div>
  )
}
