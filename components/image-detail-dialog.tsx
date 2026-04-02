'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, Calendar, User, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { deleteImage } from '@/lib/storage'
import { toast } from 'sonner'
import type { ImageWithTags } from '@/types'

interface ImageDetailDialogProps {
  image: ImageWithTags | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (imageId: string) => void
}

export function ImageDetailDialog({ image, open, onOpenChange, onDeleted }: ImageDetailDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [downloading, setDownloading] = useState(false)

  if (!image) return null

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setDeleting(true)
    try {
      await deleteImage(image!.storage_path)
      const supabase = createClient()
      const { error } = await supabase.from('images').delete().eq('id', image!.id)
      if (error) throw error

      toast.success('Image deleted')
      onOpenChange(false)
      onDeleted(image!.id)
    } catch (err) {
      toast.error('Failed to delete image')
      console.error(err)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const response = await fetch(image!.image_url)
      const blob = await response.blob()
      const ext = image!.storage_path.split('.').pop() || 'png'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${image!.title}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download image')
    } finally {
      setDownloading(false)
    }
  }

  const date = new Date(image.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setConfirmDelete(false) }}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[min(92vw,90rem)] max-h-[95vh] overflow-y-auto border-border p-4 sm:p-6 shadow-lg shadow-stone-900/10">
        <DialogHeader>
          <DialogTitle className="pr-8 text-xl font-semibold sm:text-2xl">{image.title}</DialogTitle>
        </DialogHeader>

        <div className="relative w-full min-h-[min(50vh,24rem)] h-[min(82vh,1400px)] rounded-xl overflow-hidden bg-muted ring-1 ring-border/60">
          <Image
            src={image.image_url}
            alt={image.title}
            fill
            sizes="(max-width: 768px) 92vw, min(92vw, 1400px)"
            className="object-contain object-center p-2 sm:p-3"
          />
        </div>

        {image.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{image.description}</p>
        )}

        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {image.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="bg-secondary/80 text-muted-foreground border-0">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {image.uploaded_by && (
            <span className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              {image.uploaded_by}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
        </div>

        <div className="flex justify-between pt-3 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1.5" />
            )}
            Download
          </Button>
          <Button
            variant={confirmDelete ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className={confirmDelete ? '' : 'border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all'}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1.5" />
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
