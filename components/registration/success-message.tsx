"use client"

import { motion } from "framer-motion"
import { CheckCircle, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SuccessMessageProps {
  passkeyRegistered?: boolean;
}

export default function SuccessMessage({ passkeyRegistered = false }: SuccessMessageProps) {
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
      <h2 className="text-2xl font-light text-maroon mb-4">Application Submitted Successfully!</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-4">
        Thank you for applying to APTSAICUF. Your application has been received and is being processed.
      </p>
      {passkeyRegistered ? (
        <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-2 max-w-md mx-auto mb-8">
          <Fingerprint className="h-4 w-4" />
          <span>Biometric login enabled! You can now login with your fingerprint or face.</span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
          You can add biometric login later from your dashboard for faster access.
        </p>
      )}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/member/login">
          <Button className="rounded-none bg-maroon hover:bg-maroon/90 text-white">
            Login Now
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="rounded-none border-primary hover:bg-blue-50 text-primary">
            Return to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
