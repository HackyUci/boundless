"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// You can create a simple hook to manage auth state for now.
// In a real app, this would come from a Context, Zustand, or a library like NextAuth.js.
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false) // Default to logged out
  // This function would be replaced by your actual login/logout logic
  const toggleLogin = () => setIsLoggedIn(!isLoggedIn)
  return { isLoggedIn, toggleLogin }
}

export function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { isLoggedIn, toggleLogin } = useAuth()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/discover", label: "Discover", loggedIn: true },
    { href: "/roadmap", label: "Preparation Roadmap", loggedIn: true },
    { href: "/scholarships", label: "Scholarships", loggedIn: true },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    >
      <div className="pl-4 pr-4 flex w-full h-16 items-center">
        {/* Left Section: Logo */}
        <div className="flex w-1/3 justify-start">
          <Link href="/" className="flex items-center">
            <Image
              src="/LOGO_BLACK.svg"
              alt="Boundless Logo"
              width={150}
              height={40}
              className="h-8 w-auto" // Using w-auto maintains the aspect ratio
            />
          </Link>
        </div>

        {/* Middle Section: Navigation Links */}
        <div className="flex w-1/3 justify-center">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) =>
              !link.loggedIn || isLoggedIn ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground/60 transition-colors hover:text-foreground/80"
                >
                  {link.label}
                </Link>
              ) : null
            )}
          </nav>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex w-1/3 justify-end">
          <div className="flex items-center gap-2 md:gap-4">
            {isLoggedIn ? null : 
            (
              <Button asChild>
                <Link href="/login">Get started</Link>
              </Button>
            )}

            {/* This is a temporary button to simulate login/logout */}
            <Button onClick={toggleLogin} variant="destructive">
              {isLoggedIn ? "Log Out" : "Log In (Dev)"}
            </Button>
          </div>
        </div>
        
      </div>
    </header>
  )
}