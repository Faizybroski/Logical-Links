'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Mode = 'light' | 'dark'

interface SwatchSelection {
  light: string | null
  dark: string | null
}

interface AppearanceContextValue {
  sidebarSwatchId: SwatchSelection
  contentSwatchId: SwatchSelection
  accentSwatchId: SwatchSelection
  setSidebarSwatch: (mode: Mode, id: string | null) => void
  setContentSwatch: (mode: Mode, id: string | null) => void
  setAccentSwatch: (mode: Mode, id: string | null) => void
}

const STORAGE_KEYS = {
  sidebarLight: 'appearance:sidebar:light',
  sidebarDark:  'appearance:sidebar:dark',
  contentLight: 'appearance:content:light',
  contentDark:  'appearance:content:dark',
  accentLight:  'appearance:accent:light',
  accentDark:   'appearance:accent:dark',
} as const

const defaultValue: AppearanceContextValue = {
  sidebarSwatchId: { light: null, dark: null },
  contentSwatchId: { light: null, dark: null },
  accentSwatchId: { light: null, dark: null },
  setSidebarSwatch: () => {},
  setContentSwatch: () => {},
  setAccentSwatch: () => {},
}

const AppearanceContext = createContext<AppearanceContextValue>(defaultValue)

export function useAppearance() {
  return useContext(AppearanceContext)
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {}
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [sidebarSwatchId, setSidebarSwatchId] = useState<SwatchSelection>({ light: null, dark: null })
  const [contentSwatchId, setContentSwatchId] = useState<SwatchSelection>({ light: null, dark: null })
  const [accentSwatchId, setAccentSwatchId] = useState<SwatchSelection>({ light: null, dark: null })

  useEffect(() => {
    setSidebarSwatchId({
      light: readStorage(STORAGE_KEYS.sidebarLight),
      dark:  readStorage(STORAGE_KEYS.sidebarDark),
    })
    setContentSwatchId({
      light: readStorage(STORAGE_KEYS.contentLight),
      dark:  readStorage(STORAGE_KEYS.contentDark),
    })
    setAccentSwatchId({
      light: readStorage(STORAGE_KEYS.accentLight),
      dark:  readStorage(STORAGE_KEYS.accentDark),
    })
  }, [])

  function setSidebarSwatch(mode: Mode, id: string | null) {
    writeStorage(mode === 'dark' ? STORAGE_KEYS.sidebarDark : STORAGE_KEYS.sidebarLight, id)
    setSidebarSwatchId((prev) => ({ ...prev, [mode]: id }))
  }

  function setContentSwatch(mode: Mode, id: string | null) {
    writeStorage(mode === 'dark' ? STORAGE_KEYS.contentDark : STORAGE_KEYS.contentLight, id)
    setContentSwatchId((prev) => ({ ...prev, [mode]: id }))
  }

  function setAccentSwatch(mode: Mode, id: string | null) {
    writeStorage(mode === 'dark' ? STORAGE_KEYS.accentDark : STORAGE_KEYS.accentLight, id)
    setAccentSwatchId((prev) => ({ ...prev, [mode]: id }))
  }

  return (
    <AppearanceContext.Provider
      value={{
        sidebarSwatchId,
        contentSwatchId,
        accentSwatchId,
        setSidebarSwatch,
        setContentSwatch,
        setAccentSwatch,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  )
}
