'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { ImageCard } from '@/components/image-card'
import { ImageDetailDialog } from '@/components/image-detail-dialog'
import { TagFilter } from '@/components/tag-filter'
import { createClient } from '@/lib/supabase/client'
import { Search, ImageIcon } from 'lucide-react'
import type { ImageWithTags, Tag } from '@/types'

export function ImageGallery() {
  const [images, setImages] = useState<ImageWithTags[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [search, setSearch] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageWithTags | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()

    const [imagesRes, tagsRes] = await Promise.all([
      supabase
        .from('images')
        .select('*, image_tags(tag_id, tags(id, name, created_at))')
        .order('created_at', { ascending: false }),
      supabase.from('tags').select('*').order('name'),
    ])

    if (imagesRes.data) {
      const parsed: ImageWithTags[] = imagesRes.data.map((img) => ({
        ...img,
        tags: (img.image_tags || [])
          .map((it: { tags: Tag }) => it.tags)
          .filter(Boolean),
      }))
      setImages(parsed)
    }

    if (tagsRes.data) {
      setAllTags(tagsRes.data)
    }

    setLoading(false)
  }

  const filtered = useMemo(() => {
    return images.filter((img) => {
      const matchesSearch =
        !search ||
        img.title.toLowerCase().includes(search.toLowerCase()) ||
        img.description?.toLowerCase().includes(search.toLowerCase()) ||
        img.tags.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))

      const matchesTags =
        selectedTagIds.length === 0 ||
        selectedTagIds.some((tagId) => img.tags.some((t) => t.id === tagId))

      return matchesSearch && matchesTags
    })
  }, [images, search, selectedTagIds])

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  function handleDeleted(imageId: string) {
    setImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground animate-pulse text-sm">Loading gallery…</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Gallery
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Browse and search help images for survey reference
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by title, description, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-card border-border shadow-sm shadow-stone-900/5 focus-visible:border-primary/40 focus-visible:ring-primary/15"
        />
      </div>

      <TagFilter
        allTags={allTags}
        selectedTagIds={selectedTagIds}
        onToggleTag={toggleTag}
        onClear={() => setSelectedTagIds([])}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-24 space-y-4 rounded-2xl border border-dashed border-border/80 bg-card/60 px-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/80 flex items-center justify-center ring-1 ring-border/50">
            <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {images.length === 0
              ? 'No images yet. Upload your first help image!'
              : 'No images match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => {
                setSelectedImage(image)
                setDialogOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <ImageDetailDialog
        image={selectedImage}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
