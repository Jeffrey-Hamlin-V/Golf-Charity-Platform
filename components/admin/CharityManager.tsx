'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Charity } from '@/types'

export default function CharityManager() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
      if (data) setCharities(data)
      setLoading(false)
    }
    fetchCharities()
  }, [])

  if (loading) return <div>Loading charities...</div>

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Featured</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {charities.map((charity) => (
              <tr key={charity.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{charity.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${charity.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {charity.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">{charity.is_featured ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
