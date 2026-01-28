"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { motion } from "framer-motion"
import MobileMenu from "./mobile-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/programs", label: "Programs" },
    { href: "/events", label: "Events" },
    { href: "/news", label: "News" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${scrollY > 50 ? "bg-white/90 shadow-sm" : "bg-transparent"
          }`}
        role="banner"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Link href="/" aria-label="Go to APTSAICUF homepage">
              <div className="flex items-center gap-2">
                <Image
                  src="/aicuf-centennial-logo.png"
                  alt="AICUF Centennial Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-xl font-light tracking-tight text-maroon">APTSAICUF</span>
              </div>
            </Link>
          </motion.div>
          <motion.nav
            variants={navVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex gap-8 items-center"
            role="navigation"
            aria-label="Main navigation"
          >
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About" },
              { href: "/programs", label: "Programs" },
              { href: "/events", label: "Events" },
              { href: "/news", label: "News" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-maroon transition-colors"
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={itemVariants}>
              <Link href="/register">
                <Button className="h-9 px-6 bg-maroon hover:bg-maroon/90 text-white rounded-full">
                  Join Us
                </Button>
              </Link>
            </motion.div>
          </motion.nav>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-maroon"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </motion.div>
        </div>
      </header>

      {isMenuOpen && <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navItems={navItems} />}
    </>
  )
}
