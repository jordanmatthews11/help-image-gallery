'use client'

import { useState, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { TagInput } from '@/components/tag-input'
import { uploadImage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Tag } from '@/types'

export function UploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadedBy, setUploadedBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('help-gallery-uploaded-by') || ''
    }
    return ''
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function clearFile() {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) {
      toast.error('Title and image are required')
      return
    }

    setSubmitting(true)
    try {
      const { publicUrl, storagePath } = await uploadImage(file)

      const supabase = createClient()
      const { data: imageRow, error: imgError } = await supabase
        .from('images')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: publicUrl,
          storage_path: storagePath,
          uploaded_by: uploadedBy.trim() || null,
        })
        .select()
        .single()

      if (imgError) throw imgError

      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase.from('image_tags').insert(
          selectedTags.map((tag) => ({
            image_id: imageRow.id,
            tag_id: tag.id,
          }))
        )
        if (tagError) throw tagError
      }

      if (uploadedBy.trim()) {
        localStorage.setItem('help-gallery-uploaded-by', uploadedBy.trim())
      }

      toast.success('Image uploaded successfully!')
      router.push('/')
    } catch (err) {
      toast.error('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center cursor-pointer transition-all duration-300 bg-card shadow-sm shadow-stone-900/5 ring-1 ring-border/40 ${
          dragOver
            ? 'border-primary bg-primary/5 ring-primary/20'
            : 'border-border hover:border-primary/45 hover:bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={300}
              className="mx-auto max-h-64 w-auto rounded-md object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                clearFile()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">Max 5MB</p>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. 4ft shelf section example"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this image shows or how it should be used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput selectedTags={selectedTags} onTagsChange={setSelectedTags} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uploadedBy">Your Name</Label>
            <Input
              id="uploadedBy"
              placeholder="e.g. Jordan"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full h-11 min-h-11 font-semibold rounded-xl px-4 shadow-sm"
        disabled={submitting || !file || !title.trim()}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </>
        )}
      </Button>
    </form>
  )
}
