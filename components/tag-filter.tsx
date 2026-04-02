'use client'

import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Tag } from '@/types'

interface TagFilterProps {
  allTags: Tag[]
  selectedTagIds: string[]
  onToggleTag: (tagId: string) => void
  onClear: () => void
}

export function TagFilter({ allTags, selectedTagIds, onToggleTag, onClear }: TagFilterProps) {
  if (allTags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-medium mr-1 uppercase tracking-wider">Filter</span>
      {allTags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id)
        return (
          <button key={tag.id} type="button" onClick={() => onToggleTag(tag.id)}>
            <Badge
              variant={isSelected ? 'default' : 'outline'}
              className={
                isSelected
                  ? 'cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-sm'
                  : 'cursor-pointer border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-primary transition-colors shadow-sm shadow-stone-900/5'
              }
            >
              {tag.name}
            </Badge>
          </button>
        )
      })}
      {selectedTagIds.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5 ml-1 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
