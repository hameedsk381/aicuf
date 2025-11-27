"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import VoterPasskeySetup from "./voter-passkey-setup"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
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
        <Select onValueChange={(v) => { (document.getElementById("designation-hidden") as HTMLInputElement).value = v }}>
          <SelectTrigger>
            <SelectValue placeholder="Select designation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="President">President</SelectItem>
            <SelectItem value="Vice President">Vice President</SelectItem>
            <SelectItem value="Secretary">Secretary</SelectItem>
            <SelectItem value="Joint Secretary">Joint Secretary</SelectItem>
            <SelectItem value="Treasurer">Treasurer</SelectItem>
            <SelectItem value="Social Media Coordinator">Social Media Coordinator</SelectItem>
            <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
            <SelectItem value="National Team Member">National Team Member</SelectItem>
            <SelectItem value="National Council Member">National Council Member</SelectItem>
            <SelectItem value="Delegate">Delegate</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
          </SelectContent>
        </Select>
        <input id="designation-hidden" type="hidden" {...register("designation")} />
        {errors.designation && <p className="text-xs text-red-600">{errors.designation.message}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="unitName" className="text-sm font-light">Unit Name</label>
        <Select onValueChange={(v) => { (document.getElementById("unitName-hidden") as HTMLInputElement).value = v }}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANDHRA LOYOLA COLLEGE">ANDHRA LOYOLA COLLEGE</SelectItem>
            <SelectItem value="ANDHRA LOYOLA INSTITUTE OF ENGINEERING AND TECHNOLOGY">ANDHRA LOYOLA INSTITUTE OF ENGINEERING AND TECHNOLOGY</SelectItem>
            <SelectItem value="MARIS STELLA COLLEGE">MARIS STELLA COLLEGE</SelectItem>
            <SelectItem value="LOYOLA ACADEMY">LOYOLA ACADEMY</SelectItem>
            <SelectItem value="ST. THERASSA, ELURU">ST. THERASSA, ELURU</SelectItem>
            <SelectItem value="ST. JOSEPH, VIZAG">ST. JOSEPH, VIZAG</SelectItem>
            <SelectItem value="VICTORIA COLLEGE OF PHARMACY">VICTORIA COLLEGE OF PHARMACY</SelectItem>
            <SelectItem value="PULIVENDULA LOYOLA">PULIVENDULA LOYOLA</SelectItem>
            <SelectItem value="ST. PIOUS">ST. PIOUS</SelectItem>
            <SelectItem value="ST. ANN'S, VIZAG">ST. ANN'S, VIZAG</SelectItem>
            <SelectItem value="NIRMALA COLLEGE OF PHARMACY">NIRMALA COLLEGE OF PHARMACY</SelectItem>
            <SelectItem value="JMJ TENALI">JMJ TENALI</SelectItem>
            <SelectItem value="LITTLE FLOWERS">LITTLE FLOWERS</SelectItem>
          </SelectContent>
        </Select>
        <input id="unitName-hidden" type="hidden" {...register("unitName")} />
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
