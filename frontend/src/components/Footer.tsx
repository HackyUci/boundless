"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"

export const Footer = () => {
  const navLinks = [
    { href: "/", label: "Home", loggedIn: false },
    { href: "/discover", label: "Discover", loggedIn: true },
    { href: "/timeline", label: "Preparation Roadmap", loggedIn: true },
    { href: "/scholarships", label: "Scholarships", loggedIn: true },
  ]

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo and description */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/LOGO_BLACK.svg"
                alt="Boundless Logo"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600 max-w-sm">
              Breaking Barriers to Global Education. Join thousands of students preparing to study abroad with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Explore</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Image
                src="/BONBON_FOOTER.svg"
                alt="Have a good day!"
                width={1200}
                height={200}
                className="h-40 w-auto" // Optional: controls height responsiveness
            />
        </div>

        <div className="mt-12 border-t border-gray-100 pt-6 text-sm text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Boundless. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
