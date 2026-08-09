import { redirect } from 'next/navigation'

// The old one-at-a-time uploader was replaced by /dashboard/import, which
// batches, dedupes, and supports scroll capture. Kept as a redirect so any
// bookmark or old link still lands somewhere useful.
export default function BulkUploadPage() {
  redirect('/dashboard/import')
}
