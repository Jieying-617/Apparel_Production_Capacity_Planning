// app/lines/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Toast from '@/app/components/Toast'

export default function CapacityLinesPage() {
  const [lines, setLines] = useState<any[]>([])
  
  // 表单状态
  const [lineName, setLineName] = useState('')
  const [apparelCategory, setApparelCategory] = useState('Hoodie')
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchLines()
  }, [])

  async function fetchLines() {
    const { data, error } = await supabase
      .from('production_lines')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setToast({ message: 'Failed to fetch production lines: ' + error.message, type: 'error' })
    } else if (data) {
      setLines(data)
    }
  }

  // 新增产线
  async function handleCreateLine(e: React.FormEvent) {
    e.preventDefault()
    if (!lineName) {
      setToast({ message: 'Please enter a production line name.', type: 'error' })
      return
    }

    const { error } = await supabase.from('production_lines').insert([
      {
        line_name: lineName,
        apparel_category: apparelCategory,
        is_active: true // 默认激活
      }
    ])

    if (error) {
      setToast({ message: 'Failed to create production line: ' + error.message, type: 'error' })
    } else {
      setToast({ message: `Production line "${lineName}" successfully configured!`, type: 'success' })
      setLineName('')
      fetchLines()
    }
  }

  // 切换激活 / 禁用状态 (Toggle Active / Disabled)
  async function handleToggleStatus(line: any) {
    const newStatus = line.is_active === false ? true : false
    const { error } = await supabase
      .from('production_lines')
      .update({ is_active: newStatus })
      .eq('id', line.id)

    if (error) {
      setToast({ message: 'Failed to update line status: ' + error.message, type: 'error' })
    } else {
      setToast({ 
        message: `Production line "${line.line_name}" is now ${newStatus ? 'Active' : 'Disabled'}.`, 
        type: 'success' 
      })
      fetchLines()
    }
  }

  // 删除产线
  async function handleDeleteLine(line: any) {
    if (!confirm(`Are you sure you want to delete production line "${line.line_name}"?`)) {
      return
    }

    const { error } = await supabase
      .from('production_lines')
      .delete()
      .eq('id', line.id)

    if (error) {
      setToast({ message: 'Failed to delete line: ' + error.message, type: 'error' })
    } else {
      setToast({ message: `Production line "${line.line_name}" deleted successfully.`, type: 'success' })
      fetchLines()
    }
  }

  return (
    <div className="space-y-6 w-full relative">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* 1. 产线配置表单 */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-2">Configure Production Line</h2>
        <p className="text-sm text-gray-600 mb-4">Set up factory capacity lines and assign apparel categories.</p>

        <form onSubmit={handleCreateLine} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block font-medium text-black">Line Name</label>
            <input 
              type="text" 
              value={lineName} 
              onChange={e => setLineName(e.target.value)} 
              placeholder="e.g. Line-A"
              className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
            />
          </div>

          <div>
            <label className="block font-medium text-black">Apparel Category</label>
            <select 
              value={apparelCategory} 
              onChange={e => setApparelCategory(e.target.value)}
              className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white"
            >
              <option value="Hoodie">Hoodie</option>
              <option value="Jacket">Jacket</option>
              <option value="Pants">Pants</option>
              <option value="T-Shirt">T-Shirt</option>
              <option value="Activewear">Activewear</option>
            </select>
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition">
              Save Line Configuration
            </button>
          </div>
        </form>
      </div>

      {/* 2. 已配置产线列表（支持 Active/Disabled 切换与删除） */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <h2 className="text-lg font-bold text-black mb-3">Configured Production Lines</h2>
        <p className="text-sm text-gray-600 mb-4">Manage line operational status or remove obsolete production lines from capacity planning.</p>

        {lines.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No production lines configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-black">
              <thead>
                <tr className="bg-gray-100 text-black text-xs uppercase tracking-wider font-bold">
                  <th className="p-3 border border-gray-300">Line Name</th>
                  <th className="p-3 border border-gray-300">Category</th>
                  <th className="p-3 border border-gray-300 text-center">Status</th>
                  <th className="p-3 border border-gray-300 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(line => {
                  const isActive = line.is_active !== false // 默认为 true
                  return (
                    <tr key={line.id} className="border-b border-gray-200">
                      <td className="p-3 border border-gray-300 font-medium">{line.line_name}</td>
                      <td className="p-3 border border-gray-300">{line.apparel_category}</td>
                      <td className="p-3 border border-gray-300 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${
                          isActive 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}>
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3 border border-gray-300 text-center space-x-2">
                        <button 
                          onClick={() => handleToggleStatus(line)}
                          className={`text-xs px-3 py-1 rounded border transition font-medium ${
                            isActive 
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300' 
                              : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
                          }`}
                        >
                          {isActive ? 'Disable' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteLine(line)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded border border-red-300 transition font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}