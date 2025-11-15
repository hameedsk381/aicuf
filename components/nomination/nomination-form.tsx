"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CheckCircle, Upload } from "lucide-react"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const nominationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  unitName: z.string().min(1, "Please select a unit"),
  contestingFor: z.enum([
    "President",
    "Vice President",
    "Secretary",
    "Joint Secretary",
    "Treasurer",
    "Social Media Coordinator",
    "Event Coordinator",
  ] as const),
  nocFile: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "NOC from Animator is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    ),
  educationQualification: z
    .string()
    .min(10, "Education qualification must be at least 10 characters"),
})

type NominationFormData = z.infer<typeof nominationSchema>

const UNIT_NAMES = [
  "ANDHRA LOYOLA COLLEGE",
  "ANDHRA LOYOLA INSTITUTE OF ENGINEERING AND TECHNOLOGY",
  "MARIS STELLA COLLEGE",
  "LOYOLA ACADEMY",
  "ST. THERASSA, ELURU",
  "ST. JOSEPH, VIZAG",
  "VICTORIA COLLEGE OF PHARMACY",
  "PULIVENDULA LOYOLA",
  "ST. PIOUS",
  "ST. ANN'S, VIZAG",
  "NIRMALA COLLEGE OF PHARMACY",
  "JMJ TENALI",
  "LITTLE FLOWERS",
]

export default function NominationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NominationFormData>({
    resolver: zodResolver(nominationSchema),
  })

  const nocFile = watch("nocFile")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const onSubmit = async (data: NominationFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("unitName", data.unitName)
      formData.append("contestingFor", data.contestingFor)
      formData.append("educationQualification", data.educationQualification)
      formData.append("nocFile", data.nocFile[0])

      const response = await fetch("/api/nomination", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit nomination")
      }

      setIsSubmitted(true)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit nomination. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-light text-maroon mb-4">
          Nomination Submitted Successfully!
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Thank you for submitting your nomination. Your application has been
          received and will be reviewed by our team.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-none bg-maroon hover:bg-maroon/90 text-white"
        >
          Submit Another Nomination
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-primary/20 rounded p-6 space-y-3">
        <p className="text-sm font-medium text-primary">
          ⏰ The last date of nomination form submission is <strong>18-11-25</strong>.
        </p>
        <p className="text-sm font-medium text-primary">
          📅 The Online Election will be held on <strong>22-11-25</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-light leading-none">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            id="name"
            type="text"
            className="flex h-10 w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="unitName" className="text-sm font-light leading-none">
            Unit Name <span className="text-red-500">*</span>
          </label>
          <select
            {...register("unitName")}
            id="unitName"
            className="flex h-10 w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
          >
            <option value="">Select your unit</option>
            {UNIT_NAMES.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.unitName && (
            <p className="text-xs text-red-600">{errors.unitName.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-light leading-none">
            Contesting For <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              "President",
              "Vice President",
              "Secretary",
              "Joint Secretary",
              "Treasurer",
              "Social Media Coordinator",
              "Event Coordinator",
            ].map((position) => (
              <label
                key={position}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  {...register("contestingFor")}
                  type="radio"
                  value={position}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-sm">{position}</span>
              </label>
            ))}
          </div>
          {errors.contestingFor && (
            <p className="text-xs text-red-600">
              {errors.contestingFor.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="nocFile" className="text-sm font-light leading-none">
            NOC from the Animator <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              {...register("nocFile")}
              id="nocFile"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="sr-only"
            />
            <label
              htmlFor="nocFile"
              className="flex items-center justify-center gap-2 h-24 w-full rounded-none border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {fileName ? (
                  <span className="text-primary font-medium">{fileName}</span>
                ) : (
                  <span>Click to upload file (Max 10MB)</span>
                )}
              </div>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, JPG, PNG
          </p>
          {errors.nocFile && (
            <p className="text-xs text-red-600">{errors.nocFile.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="educationQualification"
            className="text-sm font-light leading-none"
          >
            Education Qualification <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("educationQualification")}
            id="educationQualification"
            rows={4}
            className="flex w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            placeholder="Enter your education qualification details"
          />
          {errors.educationQualification && (
            <p className="text-xs text-red-600">
              {errors.educationQualification.message}
            </p>
          )}
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-none bg-maroon hover:bg-maroon/90 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Nomination"}
        </Button>
      </form>
    </div>
  )
}
