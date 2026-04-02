'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { ImageWithTags } from '@/types'

interface ImageCardProps {
  image: ImageWithTags
  onClick: () => void
}

export function ImageCard({ image, onClick }: ImageCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden bg-card border border-border/70 text-left shadow-sm shadow-stone-900/5 transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-stone-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-muted/50 ring-1 ring-inset ring-border/40">
        <Image
          src={image.image_url}
          alt={image.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain object-center p-1.5 transition-opacity duration-300 group-hover:opacity-95"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {image.title}
        </h3>
        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px] px-1.5 py-0 bg-secondary/80 text-muted-foreground border-0">
                {tag.name}
              </Badge>
            ))}
            {image.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50 text-muted-foreground">
                +{image.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
