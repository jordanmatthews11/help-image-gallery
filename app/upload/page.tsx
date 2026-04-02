import { UploadForm } from '@/components/upload-form'

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Upload help image
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Add a new reference image for survey agents. Drag a file in or browse—then add
          details and tags.
        </p>
      </div>
      <UploadForm />
    </div>
  )
}
