'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { format } from 'date-fns'

export default function UserTable() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (data) setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  if (loading) return <div>Loading users...</div>

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Subscription</th>
              <th className="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.subscription_status}
                  </span>
                </td>
                <td className="px-6 py-4">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
