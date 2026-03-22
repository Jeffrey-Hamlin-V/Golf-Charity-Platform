'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Edit, X, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Charity } from '@/types'

export default function UsersClient({ charities }: { charities: Charity[] }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

  // Edit states for modal
  const [editStatus, setEditStatus] = useState('')
  const [editPlan, setEditPlan] = useState('')
  const [editCharity, setEditCharity] = useState('')
  const [editPct, setEditPct] = useState(10)

  // Score Add States
  const [newScore, setNewScore] = useState('')
  const [newScoreDate, setNewScoreDate] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openModal = (user: any) => {
    setSelectedUser(user)
    setEditStatus(user.subscription_status)
    setEditPlan(user.subscription_plan)
    setEditCharity(user.charity_id || '')
    setEditPct(user.charity_contribution_pct || 10)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedUser.id,
        updates: {
          subscription_status: editStatus,
          subscription_plan: editPlan,
          charity_id: editCharity || null,
          charity_contribution_pct: Number(editPct)
        }
      })
    })
    
    await fetchUsers()
    setSaving(false)
    setSelectedUser(null)
  }

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('Delete this score?')) return

    await fetch('/api/admin/users/scores', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoreId })
    })

    // Update local state cleanly
    setSelectedUser({
      ...selectedUser,
      scores: selectedUser.scores.filter((s: any) => s.id !== scoreId)
    })
    fetchUsers()
  }

  const handleAddScore = async () => {
    if (!newScore || !newScoreDate) return

    setSaving(true)
    await fetch('/api/admin/users/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUser.id,
        score: newScore,
        playedAt: newScoreDate
      })
    })

    setNewScore('')
    setNewScoreDate('')
    
    // Simplest way to hydrate modal is refetch and update user object
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data)
    
    const refreshedUser = data.find((u: any) => u.id === selectedUser.id)
    if (refreshedUser) setSelectedUser(refreshedUser)
      
    setSaving(false)
  }

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    return (u.full_name?.toLowerCase() || '').includes(term) || (u.email?.toLowerCase() || '').includes(term)
  })

  // Group UI
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="text-sm text-zinc-400 font-medium">
          {filteredUsers.length} Users Found
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">User Details</th>
                  <th className="px-6 py-4 font-medium">Subscription</th>
                  <th className="px-6 py-4 font-medium">Scores logged</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.full_name || 'Anonymous'}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                      <div className="text-xs text-zinc-600 mt-1">Joined {format(new Date(user.created_at), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-bold ${
                          user.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {user.subscription_status}
                        </span>
                        <span className="text-xs text-zinc-400 capitalize">{user.subscription_plan}</span>
                      </div>
                      <div className="text-xs text-pink-400 max-w-[150px] truncate">
                        {charities.find(c => c.id === user.charity_id)?.name || 'No Charity'} ({user.charity_contribution_pct}%)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {user.scores?.length || 0} / 5
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openModal(user)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors inline-block"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      No users match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950/50">
              <div>
                <h3 className="text-lg font-bold text-white">Edit User Profile</h3>
                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              {/* Subscription Core */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                  <select 
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white"
                  >
                    <option value="active">Active</option>
                    <option value="canceled">Canceled</option>
                    <option value="past_due">Past Due</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan Tier</label>
                  <select 
                    value={editPlan} 
                    onChange={(e) => setEditPlan(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              {/* Charity Core */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Supported Charity</label>
                  <select 
                    value={editCharity} 
                    onChange={(e) => setEditCharity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white"
                  >
                    <option value="">None Selected</option>
                    {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contribution %</label>
                  <input 
                    type="number" 
                    min="10" max="100" 
                    value={editPct} 
                    onChange={(e) => setEditPct(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              {/* Score Manipulation */}
              <div className="pt-6 border-t border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-4">Player Score Management</h4>
                
                <div className="flex flex-col gap-2 mb-6">
                  {(!selectedUser.scores || selectedUser.scores.length === 0) ? (
                    <p className="text-sm text-zinc-500 py-2">No scores logged for this user.</p>
                  ) : (
                    selectedUser.scores.map((s: any) => (
                      <div key={s.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                            {s.score}
                          </span>
                          <span className="text-sm text-zinc-400">{format(new Date(s.played_at), 'PPP')}</span>
                        </div>
                        <button onClick={() => handleDeleteScore(s.id)} className="text-red-500 hover:text-red-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-zinc-500">New Score</label>
                    <input 
                      type="number" min="1" max="45"
                      value={newScore} onChange={e => setNewScore(e.target.value)}
                      placeholder="e.g. 36" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="flex-[2] space-y-1">
                    <label className="text-xs text-zinc-500">Date Played</label>
                    <input 
                      type="date" 
                      value={newScoreDate} onChange={e => setNewScoreDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"  
                    />
                  </div>
                  <button 
                    onClick={handleAddScore}
                    disabled={saving || (selectedUser.scores?.length >= 5) || !newScore || !newScoreDate}
                    className="h-9 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1"/> Add
                  </button>
                </div>
                {selectedUser.scores?.length >= 5 && (
                  <p className="text-xs text-orange-400 mt-2">Maximum 5 scores reached. Delete one to add more.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center gap-3">
              <button
                onClick={async () => {
                  const role = selectedUser.role === 'admin' ? 'subscriber' : 'admin'
                  if (!confirm(`Are you sure you want to change this user to ${role}?`)) return
                  setSaving(true)
                  await fetch('/api/admin/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedUser.id, updates: { role } })
                  })
                  await fetchUsers()
                  setSelectedUser(null)
                  setSaving(false)
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${selectedUser.role === 'admin' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'}`}
              >
                {selectedUser.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
              </button>
              
              <div className="flex gap-3">
                <button onClick={() => setSelectedUser(null)} className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveProfile} disabled={saving} className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center shadow-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Profile Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
