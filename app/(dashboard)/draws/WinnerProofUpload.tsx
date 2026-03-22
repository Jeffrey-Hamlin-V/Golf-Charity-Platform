'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function WinnerProofUpload({ winner, userId }: { winner: any, userId: string }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  if (winner.verification_status === 'approved') {
    return (
      <div className="flex items-center gap-2 mt-4 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit text-sm">
        <CheckCircle2 className="w-4 h-4" /> Verified ✓
      </div>
    )
  }

  if (winner.verification_status === 'pending' && winner.proof_url) {
    return (
      <div className="flex items-center gap-2 mt-4 text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg w-fit text-sm">
        <Clock className="w-4 h-4" /> Proof Submitted - Awaiting Review
      </div>
    )
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)

    // Construct precise storage path: bucket/userId/winnerId.ext
    const ext = file.name.split('.').pop()
    const filePath = `${userId}/${winner.id}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(filePath)

    if (publicUrlData) {
      // Dispatch database patch directly updating truth source
      const res = await fetch(`/api/winners/${winner.id}/proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_url: publicUrlData.publicUrl })
      })
      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to update your winner record with the proof.')
      }
    }
    setUploading(false)
  }

  return (
    <div className="mt-4 border-t border-zinc-800/50 pt-4">
      {winner.verification_status === 'rejected' && (
        <div className="flex items-center gap-2 mb-3 text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg w-fit text-sm">
          <XCircle className="w-4 h-4" /> Rejected - Please resubmit
        </div>
      )}

      <label className="relative cursor-pointer overflow-hidden bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold text-white shadow-sm w-fit">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading...' : 'Upload Proof'}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
      <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-wider">Required: Upload a screenshot of your exact golf scores matching the drawn numbers.</p>
    </div>
  )
}
