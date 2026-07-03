'use client'

import Link from 'next/link'
import { ArrowLeft, Home, PackageSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="
        relative flex min-h-screen
        items-center justify-center
        overflow-hidden
        bg-background px-4 py-10
      "
    >
      {/* Background Glow */}
      <div
        className="
          absolute -left-30 -top-30
          h-80 w-[320px]
          rounded-full bg-primary/10 blur-3xl
        "
      />

      <div
        className="
          absolute -bottom-30 -right-30
          h-80 w-[320px]
          rounded-full bg-primary/10 blur-3xl
        "
      />

      {/* Content */}
      <div
        className="
          relative z-10 w-full max-w-2xl
          overflow-hidden rounded-4xl
          border border-card-border
          bg-card p-8 shadow-lg
          sm:p-12
        "
      >
        {/* Top Accent */}
        <div
          className="
            absolute left-0 top-0 h-1.5 w-full
            bg-linear-to-r
            from-primary-dark
            via-primary
            to-primary-light
          "
        />

        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <img
            src="/logo_dark.svg"
            alt="Logical Links"
            className="h-14 w-auto"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="
              flex h-24 w-24 items-center justify-center
              rounded-[28px]
              bg-primary/10
            "
          >
            <PackageSearch
              className="
                h-12 w-12 text-primary
              "
            />
          </div>
        </div>

        {/* Text */}
        <div className="mt-8 text-center">
          <h1
            className="
              text-7xl font-bold tracking-tight
              text-foreground sm:text-8xl
            "
          >
            404
          </h1>

          <h2
            className="
              mt-4 text-2xl font-semibold
              text-foreground
            "
          >
            Page Not Found
          </h2>

          <p
            className="
              mx-auto mt-4 max-w-lg
              text-sm leading-7 text-muted
              sm:text-base
            "
          >
            The page you are looking for doesn&apos;t exist,
            may have been moved, or is temporarily unavailable.
          </p>
        </div>

        {/* Buttons */}
        <div
          className="
            mt-10 flex flex-col items-center
            justify-center gap-4 sm:flex-row
          "
        >
          <Link
            href="/"
            className="
              inline-flex h-12 items-center
              justify-center gap-2 rounded-2xl

              bg-primary px-6
              text-sm font-semibold
              text-sidebar

              transition-all duration-200

              hover:bg-primary-dark
              hover:shadow-md
            "
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="
              inline-flex h-12 items-center
              justify-center gap-2 rounded-2xl

              border border-card-border
              bg-background px-6

              text-sm font-semibold
              text-foreground

              transition-all duration-200

              hover:border-primary/30
              hover:bg-primary/5
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Bottom Info */}
        <div
          className="
            mt-10 rounded-2xl border
            border-card-border
            bg-background p-5
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl bg-primary/10
              "
            >
              <PackageSearch
                className="
                  h-5 w-5 text-primary
                "
              />
            </div>

            <div>
              <h3
                className="
                  text-sm font-semibold
                  text-foreground
                "
              >
                Need Help?
              </h3>

              <p
                className="
                  mt-1 text-sm leading-6
                  text-muted
                "
              >
                Contact the Logical Links support team if you
                believe this page should exist or if you are
                experiencing navigation issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}