'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface CropDialogProps {
  open:        boolean
  imageUrl:    string
  onCancel:    () => void
  onCropDone:  (croppedBlob: Blob) => void
  title?:      string
  aspectRatio?: number
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImageBitmap(await fetch(imageSrc).then((r) => r.blob()))
  const canvas  = document.createElement('canvas')
  const size    = Math.max(pixelCrop.width, pixelCrop.height)
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas is empty'))),
      'image/webp',
      0.9,
    )
  })
}

export function CropDialog({
  open,
  imageUrl,
  onCancel,
  onCropDone,
  title = 'Crop Image',
  aspectRatio = 1,
}: CropDialogProps) {
  const [crop, setCrop]           = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom]           = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedArea) return
    setProcessing(true)
    try {
      const blob = await getCroppedImg(imageUrl, croppedArea)
      onCropDone(blob)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col overflow-hidden rounded-3xl border border-card-border bg-card p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold text-foreground">{title}</DialogTitle>
        </DialogHeader>

        {/* Crop area — responsive height */}
        <div className="relative mx-6 mt-4 h-48 overflow-hidden rounded-2xl bg-black sm:h-72">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
            style={{
              containerStyle: { borderRadius: '1rem' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-6">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-muted hover:text-foreground"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-muted hover:text-foreground"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 px-6 pb-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={processing}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={processing || !croppedArea}
            className="rounded-xl"
          >
            {processing ? 'Processing…' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
