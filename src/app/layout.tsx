import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, EB_Garamond, Noto_Serif } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils"
import NavigationProgress from '@/components/NavigationProgress'
import QueryProvider from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AppearanceProvider } from '@/components/providers/appearance-provider'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

// Landing-page typography: headings use EB Garamond, body copy uses Droid Serif.
// Droid Serif was retired from Google Fonts, so we load Noto Serif (its direct
// successor, same designer) and keep "Droid Serif" first in the CSS stack so it
// is used when available locally.
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600", "700", "800"],
});

const droidSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-droid-serif",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: 'Logical Links',
    template: '%s | Logical Links',
  },
  description: 'Premium tyres and autoparts — shop, compare, and book fitting online.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <head>
        {/* Anti-flash script: runs before React hydration to apply saved/system theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${cormorant.variable} ${inter.variable} ${ebGaramond.variable} ${droidSerif.variable} antialiased`}>
        <ThemeProvider>
          <AppearanceProvider>
            <NavigationProgress />
            <QueryProvider>{children}</QueryProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
