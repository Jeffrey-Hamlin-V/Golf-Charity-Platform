export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">CharityLink</h1>
        <p className="text-zinc-400">Empowering your subscriptions for a better cause.</p>
      </div>
      {children}
    </div>
  )
}
