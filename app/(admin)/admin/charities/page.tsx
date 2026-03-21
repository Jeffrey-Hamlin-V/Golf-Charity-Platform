import CharitiesClient from './CharitiesClient'

export default function AdminCharitiesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Charity Management</h1>
        <p className="text-zinc-400">Add, edit, and curate the list of charities available for user support.</p>
      </div>

      <CharitiesClient />
    </div>
  )
}
