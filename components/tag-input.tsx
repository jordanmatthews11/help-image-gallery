'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/types'

interface TagInputProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
}

export function TagInput({ selectedTags, onTagsChange }: TagInputProps) {
  const [query, setQuery] = useState('')
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [creating, setCreating] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchTags() {
    const supabase = createClient()
    const { data } = await supabase.from('tags').select('*').order('name')
    if (data) setAllTags(data)
  }

  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedTags.some((st) => st.id === tag.id)
  )

  const exactMatch = allTags.some(
    (tag) => tag.name.toLowerCase() === query.trim().toLowerCase()
  )

  async function createTag() {
    if (!query.trim() || creating) return
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tags')
      .insert({ name: query.trim().toLowerCase() })
      .select()
      .single()
    if (data && !error) {
      setAllTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      onTagsChange([...selectedTags, data])
      setQuery('')
    }
    setCreating(false)
  }

  function addTag(tag: Tag) {
    onTagsChange([...selectedTags, tag])
    setQuery('')
  }

  function removeTag(tagId: string) {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId))
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        placeholder="Search or create tags..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowDropdown(true)
        }}
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && (query || filteredTags.length > 0) && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover text-popover-foreground shadow-lg shadow-stone-900/10 max-h-48 overflow-y-auto">
          {filteredTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 hover:text-primary flex items-center gap-2 transition-colors"
              onClick={() => {
                addTag(tag)
                setShowDropdown(false)
              }}
            >
              {tag.name}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 flex items-center gap-2 text-primary font-medium transition-colors"
              onClick={() => {
                createTag()
                setShowDropdown(false)
              }}
              disabled={creating}
            >
              <Plus className="h-3 w-3" />
              Create &quot;{query.trim().toLowerCase()}&quot;
            </button>
          )}
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20">
              {tag.name}
              <button type="button" onClick={() => removeTag(tag.id)} className="hover:text-destructive transition-colors">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
