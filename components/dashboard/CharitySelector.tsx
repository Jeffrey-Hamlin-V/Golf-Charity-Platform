'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Charity } from '@/types'

export default function CharitySelector({ userId }: { userId: string }) {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchCharitiesAndProfile = async () => {
      const [{ data: cData }, { data: pData }] = await Promise.all([
        supabase.from('charities').select('*').eq('is_active', true),
        supabase.from('profiles').select('charity_id').eq('id', userId).single()
      ])

      if (cData) setCharities(cData)
      if (pData?.charity_id) setSelectedCharityId(pData.charity_id)
      setLoading(false)
    }

    fetchCharitiesAndProfile()
  }, [userId])

  const handleUpdate = async (id: string) => {
    setSaving(true)
    await supabase.from('profiles').update({ charity_id: id }).eq('id', userId)
    setSelectedCharityId(id)
    setSaving(false)
  }

  if (loading) return <div className="p-6 bg-card border rounded-lg">Loading charities...</div>

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-4">
      <h2 className="text-xl font-semibold">Your Selected Charity</h2>
      <p className="text-sm text-muted-foreground">Select the charity you want to support with your subscription.</p>
      
      <div className="space-y-3 mt-4">
        {charities.map((charity) => (
          <div 
            key={charity.id} 
            className={`p-4 border rounded-md cursor-pointer transition-colors ${selectedCharityId === charity.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
            onClick={() => handleUpdate(charity.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{charity.name}</h3>
              {selectedCharityId === charity.id && <span className="text-primary text-sm font-medium">Selected</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{charity.description}</p>
          </div>
        ))}
      </div>
      {saving && <p className="text-sm text-muted-foreground animate-pulse">Saving selection...</p>}
    </div>
  )
}
