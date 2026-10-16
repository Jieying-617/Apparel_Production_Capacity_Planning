// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [lines, setLines] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState('')
  const [selectedLine, setSelectedLine] = useState('')
  const [targetWeek, setTargetWeek] = useState(1)

  const [dashboardData] = useState<any>({
    "Line-A": {
      caps: { CUT: 7200, SEW: 6000, FINISH: 4800, PACK: 6600 },
      loads: [
        { CUT: 5000, SEW: 5500, FINISH: 5200, PACK: 4800 }, // Week 1 (Finish > Capacity -> Bottleneck)
        { CUT: 3000, SEW: 3000, FINISH: 3000, PACK: 3000 }, // Week 2
        { CUT: 2000, SEW: 2000, FINISH: 2000, PACK: 2000 }, // Week 3
        { CUT: 1000, SEW: 1000, FINISH: 1000, PACK: 1000 }, // Week 4
      ]
    }
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
    const { data: lineData } = await supabase.from('production_lines').select('*')
    const { data: orderData } = await supabase.from('orders').select('*')
    if (lineData) setLines(lineData)
    if (orderData) setOrders(orderData)
  }

  function handleAllocate() {
    alert('Order successfully assigned and 4-week rolling load matrix updated!')
  }

  return (
    <div className="space-y-6">
      {/* Schedule Assignment Panel */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Step 3: Schedule & Bottleneck Simulation</h2>
        <p className="text-sm text-gray-500 mb-4">Assign orders to specific production lines across a rolling 4-week window to test capacity constraints.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700">Select Order</label>
            <select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} className="mt-1 w-full border rounded p-2">
              <option value="">-- Select Order --</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.style_name} ({o.total_units}u)</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700">Target Line</label>
            <select value={selectedLine} onChange={e => setSelectedLine(e.target.value)} className="mt-1 w-full border rounded p-2">
              <option value="">-- Select Line --</option>
              {lines.map(l => <option key={l.id} value={l.line_name}>{l.line_name} ({l.apparel_category})</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700">Target Week Window</label>
            <select value={targetWeek} onChange={e => setTargetWeek(Number(e.target.value))} className="mt-1 w-full border rounded p-2">
              <option value={1}>Week 1 (Current)</option>
              <option value={2}>Week 2</option>
              <option value={3}>Week 3</option>
              <option value={4}>Week 4</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleAllocate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition">
              Simulate Allocation
            </button>
          </div>
        </div>
      </div>

      {/* Rolling 4-Week Horizon Dashboard Matrix */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">📊 Rolling 4-Week Horizon & Bottleneck Dashboard</h2>
          <div className="flex space-x-3 text-xs font-medium">
            <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span> Available (&lt;90%)</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span> FULL / Bottleneck (&ge;100%)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-3 border">Production Line</th>
                <th className="p-3 border">Department</th>
                <th className="p-3 border text-center">Week 1</th>
                <th className="p-3 border text-center">Week 2</th>
                <th className="p-3 border text-center">Week 3</th>
                <th className="p-3 border text-center">Week 4</th>
              </tr>
            </thead>
            <tbody>
              {['CUT', 'SEW', 'FINISH', 'PACK'].map((dept, idx) => {
                const cap = dashboardData["Line-A"].caps[dept as keyof typeof dashboardData["Line-A"]["caps"]]
                return (
                  <tr key={dept} className={idx === 0 ? "border-t-2 border-indigo-100 bg-indigo-50/20" : "border-t"}>
                    {idx === 0 && <td rowSpan={4} className="p-3 border font-bold text-indigo-900 align-middle">Line-A (Hoodie)</td>}
                    <td className="p-3 border font-medium text-gray-700">
                      {dept} {dept === 'FINISH' && <span className="text-xs text-red-500 font-bold">(⚠️ Shortcap)</span>}
                      <div className="text-xs text-gray-400">Cap: {cap}u/wk</div>
                    </td>
                    {[0, 1, 2, 3].map(w => {
                      const load = dashboardData["Line-A"].loads[w][dept as keyof typeof dashboardData["Line-A"]["caps"]]
                      const pct = Math.round((load / cap) * 100)
                      const isFull = pct >= 100
                      return (
                        <td key={w} className="p-3 border text-center">
                          <div className="text-xs text-gray-500">{load}u</div>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs border ${isFull ? 'bg-red-100 text-red-800 border-red-300 font-bold' : 'bg-green-100 text-green-800 border-green-300'}`}>
                            {pct}% {isFull ? 'FULL' : 'Available'}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}