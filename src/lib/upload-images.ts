import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/api'

const AVATAR_BUCKET = 'profile-avatars'
const LOGO_BUCKET   = 'company-logos'

// ── Signed-URL upload types ───────────────────────────────────────────────────
// The app uses custom JWT auth, not Supabase Auth, so auth.uid() is always NULL
// in the browser Supabase client. Uploading directly would fail with RLS errors.
// Instead, the backend (service-role) generates a time-limited signed upload URL
// and the frontend uses uploadToSignedUrl() which bypasses normal storage RLS.

interface UploadUrlPayload {
  signedUrl: string
  token:     string
  path:      string
  publicUrl: string
}

// ── User avatar ───────────────────────────────────────────────────────────────

export async function uploadUserAvatar(_userId: string, blob: Blob): Promise<string> {
  // 1. Ask backend to generate a signed upload URL (service-role, bypasses RLS)
  const res = await api.post<ApiResponse<UploadUrlPayload>>(
    '/api/v1/users/me/avatar/upload-url',
    {},
  )
  const { token, path, publicUrl } = res.data

  // 2. Upload blob directly to Supabase Storage using the signed token
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .uploadToSignedUrl(path, token, blob, { contentType: 'image/webp', upsert: true })

  if (error) throw new Error(error.message)

  // 3. Return public URL with cache-buster so browsers pick up the new image
  return `${publicUrl}?t=${Date.now()}`
}

export async function removeUserAvatar(_userId: string): Promise<void> {
  // Backend removes from storage AND clears avatar_url in profiles
  await api.delete('/api/v1/users/me/avatar')
}

// ── Company logo ──────────────────────────────────────────────────────────────

export async function uploadCompanyLogo(_accountId: string, blob: Blob): Promise<string> {
  const res = await api.post<ApiResponse<UploadUrlPayload>>(
    '/api/v1/accounts/me/logo/upload-url',
    {},
  )
  const { token, path, publicUrl } = res.data

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .uploadToSignedUrl(path, token, blob, { contentType: 'image/webp', upsert: true })

  if (error) throw new Error(error.message)

  return `${publicUrl}?t=${Date.now()}`
}

export async function removeCompanyLogo(_accountId: string): Promise<void> {
  // Backend removes from storage AND clears logo_url in accounts
  await api.delete('/api/v1/accounts/me/logo')
}

// ── File validation ───────────────────────────────────────────────────────────

const ALLOWED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, or WEBP images are allowed.'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

export function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}
