import { createClient } from '@/lib/supabase/client'

const BUCKET = 'help-images'

export async function uploadImage(file: File): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl, storagePath: path }
}

export async function deleteImage(storagePath: string): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from(BUCKET).remove([storagePath])
}
