// app/capacity/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CapacityPage() {
  const [lines, setLines] = useState<any[]>([])
  const [lineName, setLineName] = useState('')
  const [category, setCategory] = useState('')
  const [cut, setCut] = useState(1200)
  const [sew, setSew] = useState(1000)
  const [finish, setFinish] = useState(800) // Default bottleneck department
  const [pack, setPack] = useState(1100)

  useEffect(() => {
    fetchLines()
  }, [])

  async function fetchLines() {
    const { data } = await supabase.from('production_lines').select('*')
    if (data) setLines(data)
  }

  async function handleAddLine(e: React.FormEvent) {
    e.preventDefault()
    const { data: lineData, error: lineError } = await supabase
      .from('production_lines')
      .insert([{ line_name: lineName, apparel_category: category }])
      .select()

    if (lineError || !lineData) {
      alert('Failed to create production line: ' + lineError?.message)
      return
    }

    const lineId = lineData[0].id

    const capacities = [
      { line_id: lineId, department: 'CUT', daily_capacity_units: cut },
      { line_id: lineId, department: 'SEW', daily_capacity_units: sew },
      { line_id: lineId, department: 'FINISH', daily_capacity_units: finish },
      { line_id: lineId, department: 'PACK', daily_capacity_units: pack },
    ]

    const { error: capError } = await supabase.from('line_capacities').insert(capacities)
    if (capError) {
      alert('Failed to configure capacity limits: ' + capError.message)
    } else {
      alert('Production line and departmental capacities configured successfully!')
      setLineName('')
      setCategory('')
      fetchLines()
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Step 1: Define Capacity by Production Line</h2>
        <p className="text-sm text-gray-500 mb-6">Establish baseline daily output limits for Cut, Sew, Finish, and Pack based on apparel categories to identify factory bottlenecks.</p>

        <form onSubmit={handleAddLine} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Production Line Name</label>
            <input type="text" value={lineName} onChange={e => setLineName(e.target.value)} placeholder="e.g. Line-C" required className="mt-1 w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apparel Category</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Denim Jacket" required className="mt-1 w-full border rounded p-2 text-sm" />
          </div>

          <div className="col-span-2 grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
            <div>
              <label className="text-xs font-semibold text-gray-600">Cut Daily Limit</label>
              <input type="number" value={cut} onChange={e => setCut(Number(e.target.value))} className="mt-1 w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Sew Daily Limit</label>
              <input type="number" value={sew} onChange={e => setSew(Number(e.target.value))} className="mt-1 w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-red-600">Finish (⚠️ Bottleneck)</label>
              <input type="number" value={finish} onChange={e => setFinish(Number(e.target.value))} className="mt-1 w-full border rounded p-1.5 text-sm bg-red-50 text-red-700 font-bold" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Pack Daily Limit</label>
              <input type="number" value={pack} onChange={e => setPack(Number(e.target.value))} className="mt-1 w-full border rounded p-1.5 text-sm" />
            </div>
          </div>

          <div className="col-span-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded text-sm transition">
              Save Line & Capacity Profile
            </button>
          </div>
        </form>
      </div>

      {/* Configured Lines List */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-md font-bold text-gray-800 mb-4">Configured Production Lines</h3>
        <ul className="divide-y text-sm">
          {lines.map(line => (
            <li key={line.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-indigo-900">{line.line_name}</span> 
                <span className="ml-2 text-gray-500">({line.apparel_category})</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Active</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}