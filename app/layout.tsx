import { Toaster } from "./components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import type React from "react"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "../context/ThemeProvider";
import ThemeToggle from "../components/theme/ThemeToggle";

// Vercel-friendly runtime hints for App Router
export const dynamic = "force-dynamic";
export const runtime = "edge";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Resilient Coders Dashboard",
  description: "AI Learning Platform Dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans ${inter.variable} antialiased transition-colors duration-300 ease-in-out`}>
          <ThemeProvider>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-[#dc2626] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-[#b91c1c] transition-colors">
                    Sign in
                  </button>
              </SignInButton>
              {/* TODO: Signup should only be available with admin link, temporarly added hover notice */}
              <SignUpButton mode="modal">
                <div className="relative inline-block group">
                  <button className="bg-[#dc2626] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-[#b91c1c] transition-colors">
                    Sign Up
                  </button>
                  {/* hover blurb */}
                  <div
                    className="
                      absolute right-0 mt-2 w-max max-w-[260px]
                      rounded-md bg-neutral-900 text-white text-xs
                      px-3 py-2 shadow-lg
                      opacity-0 translate-y-1 pointer-events-none
                      transition-all duration-150
                      group-hover:opacity-100 group-hover:translate-y-0
                    "
                    role="tooltip"
                  >
                    Sign-up is <b>invite-only</b>. Ask an admin for an invite link.
                    <span
                      className="
                        absolute -top-1 right-4 h-2 w-2 rotate-45 bg-neutral-900
                      "
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </SignUpButton>
            </SignedOut>
            {/* Theme toggle (left of avatar) */}
            <Suspense fallback={null}>
              <ThemeToggle />
            </Suspense>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <Suspense fallback={null}>
            {children}
            <Toaster />
            <Analytics />
          </Suspense>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
