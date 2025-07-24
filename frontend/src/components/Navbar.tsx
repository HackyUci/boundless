"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { isLoggedIn, isLoading, logout, user } = useAuth()

  const navLinks = [
    ({ href: "/", label: "Home", loggedIn: false }),
    { href: "/discover", label: "Discover", loggedIn: true },
    { href: "/timeline", label: "Preparation Roadmap", loggedIn: true },
    { href: "/scholarships", label: "Scholarships", loggedIn: true },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    >
      <div className="pl-4 pr-4 flex w-full h-16 items-center">
        <div className="flex w-1/3 justify-start">
          <Link href="/" className="flex items-center">
            <Image
              src="/LOGO_BLACK.svg"
              alt="Boundless Logo"
              width={150}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <div className="flex w-1/3 justify-center">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) =>
              !link.loggedIn || isLoggedIn ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-black transition-colors hover:text-foreground/80"
                >
                  {link.label}
                </Link>
              ) : null
            )}
          </nav>
        </div>

        <div className="flex w-1/3 justify-end">
          <div className="flex items-center gap-2 md:gap-4">
            {isLoading ? (
              <div className="w-20 h-9 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <>
                {!isLoggedIn && (
                  <button className="bg-[linear-gradient(180deg,_#4479B2_0%,_#669DD9_100%)] backdrop-blur-sm shadow-[0px_2px_4px_0px_#00000040] px-3 py-2 rounded-md">
                    <Link href="/register">Get started</Link>
                  </button>
                )}

                {isLoggedIn && (
                  <>
                    {user?.email && (
                      <span className="text-sm text-foreground/60 hidden md:inline">
                        {user.email}
                      </span>
                    )}
                    <Button onClick={logout} variant="destructive">
                      Log Out
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}