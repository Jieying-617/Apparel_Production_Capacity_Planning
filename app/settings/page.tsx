// app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Toast from '@/app/components/Toast'

export default function SettingsPage() {
  const [cutLoss, setCutLoss] = useState(5)
  const [sewLoss, setSewLoss] = useState(2)
  const [finishLoss, setFinishLoss] = useState(1)
  const [packLoss, setPackLoss] = useState(0)
  const [workingDays, setWorkingDays] = useState(6)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    const { data } = await supabase.from('factory_settings').select('*').single()
    if (data) {
      setCutLoss(data.cut_loss_rate * 100)
      setSewLoss(data.sew_loss_rate * 100)
      setFinishLoss(data.finish_loss_rate * 100)
      setPackLoss(data.pack_loss_rate * 100)
      setWorkingDays(data.weekly_working_days)
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      id: 1,
      cut_loss_rate: cutLoss / 100,
      sew_loss_rate: sewLoss / 100,
      finish_loss_rate: finishLoss / 100,
      pack_loss_rate: packLoss / 100,
      weekly_working_days: Number(workingDays)
    }

    const { error } = await supabase.from('factory_settings').upsert([payload])

    if (error) {
      setToast({ message: 'Failed to update settings: ' + error.message, type: 'error' })
    } else {
      setToast({ 
        message: 'Global parameters updated successfully! All horizon loads recalculated.', 
        type: 'success' 
      })
    }
  }

  return (
    // 使用 w-full max-w-xl mx-auto 实现整体容器居中
    <div className="w-full max-w-xl mx-auto space-y-6 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-2 text-center">Global Simulation Parameters</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Configure department loss/multiplier rates and weekly working days. Changes instantly re-evaluate factory capacity and loads.</p>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-black">Cut Loss Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={cutLoss} 
                onChange={e => setCutLoss(Number(e.target.value))} 
                className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
              />
            </div>
            <div>
              <label className="block font-medium text-black">Sew Loss Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={sewLoss} 
                onChange={e => setSewLoss(Number(e.target.value))} 
                className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-black">Finish Loss Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={finishLoss} 
                onChange={e => setFinishLoss(Number(e.target.value))} 
                className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
              />
            </div>
            <div>
              <label className="block font-medium text-black">Pack Loss Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={packLoss} 
                onChange={e => setPackLoss(Number(e.target.value))} 
                className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-black">Weekly Working Days (Days / Week)</label>
            <input 
              type="number" 
              min="1" 
              max="7"
              value={workingDays} 
              onChange={e => setWorkingDays(Number(e.target.value))} 
              className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
            />
            <p className="text-xs text-gray-500 mt-1">Used to compute weekly capacity: <code>daily_capacity_units * weekly_working_days</code></p>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded transition">
              Save Parameters & Recalculate Horizon
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}