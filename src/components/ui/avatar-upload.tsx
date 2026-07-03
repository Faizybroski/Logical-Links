'use client'

import { useRef, useState } from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CropDialog } from './crop-dialog'
import { UserAvatar } from './user-avatar'
import { validateImageFile, fileToObjectUrl } from '@/lib/upload-images'

interface AvatarUploadProps {
  name:       string | null | undefined
  avatarUrl:  string | null | undefined
  onUpload:   (blob: Blob) => Promise<void>
  onRemove?:  () => Promise<void>
  uploading?: boolean
  size?:      'md' | 'lg' | 'xl'
  label?:     string
}

export function AvatarUpload({
  name,
  avatarUrl,
  onUpload,
  onRemove,
  uploading,
  size = 'xl',
  label = 'Profile Picture',
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc]       = useState<string | null>(null)
  const [cropOpen, setCropOpen]     = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const err = validateImageFile(file)
    if (err) { toast.error(err); return }

    const url = fileToObjectUrl(file)
    setCropSrc(url)
    setCropOpen(true)
  }

  function handleCropCancel() {
    setCropOpen(false)
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  async function handleCropDone(blob: Blob) {
    setCropOpen(false)
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    await onUpload(blob)
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <UserAvatar name={name} avatarUrl={avatarUrl} size={size} />

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted">JPG, PNG or WEBP · max 5 MB · 1:1 ratio recommended</p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="
              flex items-center gap-1.5 rounded-xl
              border border-card-border bg-background
              px-3 py-1.5 text-xs font-medium
              text-foreground transition-colors
              hover:border-primary/40 hover:bg-primary/5
              disabled:opacity-50
            "
          >
            <Camera className="h-3.5 w-3.5" />
            {avatarUrl ? 'Change' : 'Upload'}
          </button>

          {avatarUrl && onRemove && (
            <button
              type="button"
              disabled={uploading}
              onClick={onRemove}
              className="
                flex items-center gap-1.5 rounded-xl
                border border-danger/30 bg-danger/5
                px-3 py-1.5 text-xs font-medium
                text-danger transition-colors
                hover:bg-danger/10
                disabled:opacity-50
              "
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {cropSrc && (
        <CropDialog
          open={cropOpen}
          imageUrl={cropSrc}
          title={`Crop ${label}`}
          onCancel={handleCropCancel}
          onCropDone={handleCropDone}
        />
      )}
    </div>
  )
}
