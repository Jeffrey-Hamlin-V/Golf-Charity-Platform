'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Heart, CheckCircle2, XCircle, Search, Loader2 } from 'lucide-react'
import { Charity } from '@/types'

export default function CharitiesClient() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    image_url: '',
    website: '',
    is_featured: false,
    is_active: true
  })

  const fetchCharities = async () => {
    const res = await fetch('/api/admin/charities')
    const data = await res.json()
    setCharities(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCharities()
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm({ name: '', description: '', image_url: '', website: '', is_featured: false, is_active: true })
    setModalOpen(true)
  }

  const openEdit = (c: Charity) => {
    setEditingId(c.id)
    setForm({
      name: c.name,
      description: c.description,
      image_url: c.image_url || '',
      website: c.website || '',
      is_featured: c.is_featured,
      is_active: c.is_active
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete "${name}"? This could break user profiles that are actively linked to it.`)) return
    
    await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE', payload: { id } })
    })
    fetchCharities()
  }

  const handleToggleFeatured = async (c: Charity) => {
    await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        payload: { id: c.id, is_featured: !c.is_featured }
      })
    })
    fetchCharities()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = editingId ? { ...form, id: editingId } : form
    const action = editingId ? 'UPDATE' : 'CREATE'

    await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    })

    await fetchCharities()
    setSaving(false)
    setModalOpen(false)
  }

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" placeholder="Search charities..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          />
        </div>
        <button onClick={openNew} className="h-9 px-4 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-lg flex items-center shadow-sm whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> Add Charity
        </button>
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
                  <th className="px-6 py-4 font-medium">Organization</th>
                  <th className="px-6 py-4 font-medium">Status / Featured</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" /> {c.name}
                      </div>
                      {c.website && <a href={c.website} target="_blank" className="text-xs text-blue-400 hover:underline mt-1">{c.website}</a>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {c.is_active ? 
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400"><CheckCircle2 className="w-3" /> Active</span> :
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-500"><XCircle className="w-3" /> Inactive</span>
                        }
                        <button onClick={() => handleToggleFeatured(c)} className={`text-xs px-2 py-1 rounded-full font-medium inline-block w-max transition-colors ${c.is_featured ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                          {c.is_featured ? '★ Featured' : 'Not Featured'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-400 line-clamp-2 max-w-sm" title={c.description}>{c.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(c)} className="p-2 text-zinc-400 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-2 text-red-500 hover:text-red-400 transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No charities found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">{editingId ? 'Edit Charity' : 'Add New Charity'}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Charity Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Description *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Website URL</label>
                  <input type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Logo Image URL</label>
                  <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-pink-500 focus:ring-0 focus:ring-offset-0" />
                  <span className="text-sm font-medium text-zinc-300">Active (Visible)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-yellow-500 focus:ring-0 focus:ring-offset-0" />
                  <span className="text-sm font-medium text-zinc-300">Featured Highlight</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button disabled={saving} type="submit" className="px-5 py-2.5 text-sm font-bold bg-pink-600 hover:bg-pink-500 text-white rounded-lg flex items-center shadow-sm disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Details
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
