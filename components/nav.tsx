'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border/60 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 shadow-sm shadow-stone-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-sm ring-1 ring-primary/20">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight leading-none">Help Image Gallery</span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Storesight</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              pathname === '/'
                ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            )}
          >
            Gallery
          </Link>
          <Link
            href="/upload"
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
              pathname === '/upload'
                ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            )}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Link>
        </nav>
      </div>
    </header>
  )
}
