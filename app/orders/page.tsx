// app/orders/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OrdersPage() {
  const [styleName, setStyleName] = useState('')
  const [category, setCategory] = useState('')
  const [units, setUnits] = useState(10000)
  const [startWindow, setStartWindow] = useState('')
  const [endWindow, setEndWindow] = useState('')

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('orders').insert([
      {
        style_name: styleName,
        apparel_category: category,
        total_units: units,
        shipment_window_start: startWindow,
        shipment_window_end: endWindow,
      }
    ])

    if (error) {
      alert('Failed to record order: ' + error.message)
    } else {
      alert('Order successfully captured! Proceed to Step 3 for scheduling and bottleneck analysis.')
      setStyleName('')
      setCategory('')
      setUnits(10000)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Step 2: Order Input & Category Mapping</h2>
      <p className="text-sm text-gray-500 mb-6">Capture incoming buyer order specifications, target quantities, and shipment delivery windows.</p>

      <form onSubmit={handleCreateOrder} className="space-y-4 text-sm">
        <div>
          <label className="block font-medium text-gray-700">Style Name / Order ID</label>
          <input type="text" value={styleName} onChange={e => setStyleName(e.target.value)} placeholder="e.g. Summer Zip Hoodie #204" required className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Apparel Category</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Fleece Hoodie" required className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Total Units (Pieces)</label>
          <input type="number" value={units} onChange={e => setUnits(Number(e.target.value))} required className="mt-1 w-full border rounded p-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700">Shipment Window Start</label>
            <input type="date" value={startWindow} onChange={e => setStartWindow(e.target.value)} required className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Shipment Window End</label>
            <input type="date" value={endWindow} onChange={e => setEndWindow(e.target.value)} required className="mt-1 w-full border rounded p-2" />
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition">
          Submit Order & Schedule
        </button>
      </form>
    </div>
  )
}