"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import VoterPasskeySetup from "./voter-passkey-setup"
import DownloadVoterId from "./download-voter-id"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const voterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  unitName: z.string().min(2, "Unit name is required"),
  mobileNo: z.string().regex(/^[0-9]{10,15}$/, "Enter a valid mobile number"),
})

type VoterFormData = z.infer<typeof voterSchema>

export default function VoterRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [voterId, setVoterId] = useState<string | null>(null)
  const [passkeyDone, setPasskeyDone] = useState(false)
  const [lastData, setLastData] = useState<VoterFormData | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VoterFormData>({
    resolver: zodResolver(voterSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: VoterFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/voter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to register voter")
      }
      setLastData(data)
      setVoterId(result.voterId)
      reset()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (voterId) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Your Voter ID:</p>
        <div className="text-lg font-medium text-maroon">{voterId}</div>
        <DownloadVoterId
          voterId={voterId}
          name={lastData?.name}
          unitName={lastData?.unitName}
          designation={lastData?.designation}
        />
        {passkeyDone ? (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">
            Passkey set up successfully. Registration completed.
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Set up your device passkey (fingerprint/Face ID/PIN) to complete registration.
            </p>
            <VoterPasskeySetup voterId={voterId} onSuccess={() => setPasskeyDone(true)} />
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {submitError && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 text-red-800 text-sm">
          {submitError}
        </div>
      )}

      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-light">Name</label>
        <Input id="name" {...register("name")} placeholder="Enter your full name" />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="designation" className="text-sm font-light">Designation</label>
        <Input id="designation" {...register("designation")} placeholder="e.g., Member, Coordinator" />
        {errors.designation && <p className="text-xs text-red-600">{errors.designation.message}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="unitName" className="text-sm font-light">Unit Name</label>
        <Input id="unitName" {...register("unitName")} placeholder="Enter your unit name" />
        {errors.unitName && <p className="text-xs text-red-600">{errors.unitName.message}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="mobileNo" className="text-sm font-light">Mobile Number</label>
        <Input id="mobileNo" {...register("mobileNo")} placeholder="10–15 digits" />
        {errors.mobileNo && <p className="text-xs text-red-600">{errors.mobileNo.message}</p>}
      </div>



      <Button type="submit" disabled={isSubmitting} className="rounded-none bg-maroon hover:bg-maroon/90 text-white">
        {isSubmitting ? "Registering..." : "Register as Voter"}
      </Button>
    </form>
  )
}
