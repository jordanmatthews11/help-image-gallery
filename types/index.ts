export interface Image {
  id: string
  title: string
  description: string | null
  image_url: string
  storage_path: string
  uploaded_by: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface ImageWithTags extends Image {
  tags: Tag[]
}
