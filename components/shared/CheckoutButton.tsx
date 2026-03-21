'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function CheckoutButton({ 
  priceId, 
  userId, 
  className 
}: { 
  priceId: string, 
  userId: string,
  className?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        alert(`Checkout Error: ${data.error || 'Unknown error'}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      console.error(err)
      const e = err as Error
      alert(e.message || 'A network error occurred connecting to checkout.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Subscribe Now'}
    </button>
  )
}
