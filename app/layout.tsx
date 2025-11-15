import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import SkipLink from "@/components/skip-link"
import GoogleAnalytics from "@/components/analytics"
import { siteConfig } from "@/lib/config"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata = {
  title: {
    default: "APTSAICUF - Andhra-Telangana All India Catholic University Federation",
    template: "%s | APTSAICUF"
  },
  description:
    "Empowering Catholic students in Andhra Pradesh and Telangana to be agents of social change through faith, justice, and leadership since 1924.",
  keywords: ["AICUF", "APTSAICUF", "Catholic Students", "Youth Leadership", "Social Justice", "Andhra Pradesh", "Telangana", "Student Organization"],
  authors: [{ name: "APTSAICUF" }],
  creator: "APTSAICUF",
  publisher: "APTSAICUF",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://aptsaicuf.com",
    siteName: "APTSAICUF",
    title: "APTSAICUF - Empowering Catholic Students Since 1924",
    description: "Join the Andhra-Telangana All India Catholic University Federation. Empowering students through faith, justice, and leadership.",
    images: [
      {
        url: "/aicuf-centennial-logo.png",
        width: 1200,
        height: 630,
        alt: "APTSAICUF Logo"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APTSAICUF - Empowering Catholic Students Since 1924",
    description: "Join the Andhra-Telangana All India Catholic University Federation. Empowering students through faith, justice, and leadership.",
    images: ["/aicuf-centennial-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: siteConfig.verification.google,
  },
  alternates: {
    canonical: "https://aptsaicuf.com",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <GoogleAnalytics />
        <SkipLink />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
