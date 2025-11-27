"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { startRegistration } from "@simplewebauthn/browser"

export default function VoterPasskeySetup({ voterId, onSuccess }: { voterId: string; onSuccess?: () => void }) {
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

      if (!optionsRes.ok) {
        throw new Error(options.error || 'Failed to get registration options')
      }

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
      console.error('Passkey registration error:', e)
      let errorMessage = 'Passkey registration failed'

      if (e instanceof Error) {
        if (e.name === 'NotAllowedError') {
          errorMessage = 'Passkey registration blocked. Please ensure you are using HTTPS (not HTTP) and try again.'
        } else if (e.name === 'SecurityError') {
          errorMessage = 'Security error: Please ensure you are accessing the site via HTTPS.'
        } else if (e.message.includes('HTTPS')) {
          errorMessage = 'Passkeys require HTTPS. Please access the site via https://aptsaicuf.com'
        } else {
          errorMessage = e.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">
          <strong>Error:</strong> {error}
        </div>
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
