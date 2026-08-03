import { supabase } from '../lib/supabase'

const BUCKET = 'group-files'

function randomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

/** Uploads a file under `{groupId}/{subdir}/...` (the path prefix Storage RLS checks against) and returns its public URL. */
export async function uploadGroupFile(groupId: string, subdir: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  const path = `${groupId}/${subdir}/${randomId()}-${safeName}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Removes a previously uploaded file given its public URL. Silently no-ops for URLs outside our bucket. */
export async function removeGroupFile(publicUrl: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return

  const path = publicUrl.slice(index + marker.length)
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
