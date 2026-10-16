// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Toast from '@/app/components/Toast'

export default function DashboardPage() {
  const [lines, setLines] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [capacities, setCapacities] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  
  // 全局参数状态（损耗率与每周工作天数，支持动态配置）
  const [settings, setSettings] = useState({
    cut_loss_rate: 0.05,
    sew_loss_rate: 0.02,
    finish_loss_rate: 0.01,
    pack_loss_rate: 0.00,
    weekly_working_days: 6
  })

  const [selectedOrder, setSelectedOrder] = useState('')
  const [selectedLineId, setSelectedLineId] = useState('')
  const [targetWeek, setTargetWeek] = useState(1)

  // 表格专属筛选状态
  const [tableFilterWeek, setTableFilterWeek] = useState('')
  const [tableFilterLineId, setTableFilterLineId] = useState('')

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    const { data: lineData } = await supabase.from('production_lines').select('*')
    const { data: orderData } = await supabase.from('orders').select('*')
    const { data: capData } = await supabase.from('line_capacities').select('*')
    const { data: schedData } = await supabase.from('production_schedules').select('*').order('created_at', { ascending: false })
    
    // 获取全局动态参数设置
    const { data: settingsData } = await supabase.from('factory_settings').select('*').single()

    if (lineData) setLines(lineData)
    if (orderData) setOrders(orderData)
    if (capData) setCapacities(capData)
    if (schedData) setSchedules(schedData)
    if (settingsData) {
      setSettings({
        cut_loss_rate: Number(settingsData.cut_loss_rate ?? 0.05),
        sew_loss_rate: Number(settingsData.sew_loss_rate ?? 0.02),
        finish_loss_rate: Number(settingsData.finish_loss_rate ?? 0.01),
        pack_loss_rate: Number(settingsData.pack_loss_rate ?? 0.00),
        weekly_working_days: Number(settingsData.weekly_working_days ?? 6)
      })
    }
  }

  // 排程分配表单的下拉列表：仅允许选择激活状态（Active）的产线
  const activeLines = lines.filter(l => l.is_active !== false)

  // 仿真分配：根据当前的全局动态损耗率计算各工序负荷
  async function handleAllocate() {
    if (!selectedOrder || !selectedLineId) {
      setToast({ message: 'Please select both an order and an active target line.', type: 'error' })
      return
    }

    const orderObj = orders.find(o => o.id === selectedOrder)
    const lineObj = activeLines.find(l => l.id === selectedLineId)
    if (!orderObj || !lineObj) return

    const totalUnits = orderObj.total_units || 0

    // 使用全局动态损耗率计算各工序负荷
    const cutLoad = Math.round(totalUnits * (1 + settings.cut_loss_rate))
    const sewLoad = Math.round(totalUnits * (1 + settings.sew_loss_rate))
    const finishLoad = Math.round(totalUnits * (1 + settings.finish_loss_rate))
    const packLoad = Math.round(totalUnits * (1 + settings.pack_loss_rate))

    const { error } = await supabase.from('production_schedules').insert([
      {
        line_id: selectedLineId,
        order_id: selectedOrder,
        target_week: Number(targetWeek),
        cut_load: cutLoad,
        sew_load: sewLoad,
        finish_load: finishLoad,
        pack_load: packLoad
      }
    ])

    if (error) {
      setToast({ message: 'Failed to record schedule: ' + error.message, type: 'error' })
    } else {
      setToast({ message: `Successfully allocated "${orderObj.style_name}" (${totalUnits}u) to ${lineObj.line_name} for Week ${targetWeek}!`, type: 'success' })
      fetchDashboardData()
    }
  }

  async function handleDeleteSchedule(scheduleId: string) {
    const { error } = await supabase.from('production_schedules').delete().eq('id', scheduleId)
    if (error) {
      setToast({ message: 'Failed to remove schedule: ' + error.message, type: 'error' })
    } else {
      setToast({ message: 'Allocated order record removed successfully.', type: 'success' })
      fetchDashboardData()
    }
  }

  // 动态每周产能计算：每日产能 * 动态每周工作天数（weekly_working_days）
  function getWeeklyCapacity(lineId: string, dept: string) {
    const capRow = capacities.find(c => c.line_id === lineId && c.department === dept)
    const dailyCap = capRow ? capRow.daily_capacity_units : 1000 
    return dailyCap * settings.weekly_working_days 
  }

  function calculateLoad(lineId: string, weekNum: number, dept: string) {
    const matchingSchedules = schedules.filter(s => String(s.line_id) === String(lineId) && Number(s.target_week) === Number(weekNum))
    let total = 0
    matchingSchedules.forEach((s: any) => {
      if (dept === 'CUT') total += Number(s.cut_load || 0)
      if (dept === 'SEW') total += Number(s.sew_load || 0)
      if (dept === 'FINISH') total += Number(s.finish_load || 0)
      if (dept === 'PACK') total += Number(s.pack_load || 0)
    })
    return total
  }

  function getOrderName(orderId: string) {
    const o = orders.find(item => item.id === orderId)
    return o ? `${o.style_name} (${o.total_units}u)` : 'Unknown Order'
  }

  function getLineObj(lineId: string) {
    return lines.find(item => item.id === lineId)
  }

  // 看板渲染所有产线（包含 Active 和 Disabled）
  const displayedLines = selectedLineId 
    ? lines.filter(l => l.id === selectedLineId) 
    : lines

  // 已分配订单明细表格复合筛选
  const filteredSchedules = schedules.filter((sched: any) => {
    const matchWeek = tableFilterWeek ? Number(sched.target_week) === Number(tableFilterWeek) : true
    const matchLine = tableFilterLineId ? String(sched.line_id) === String(tableFilterLineId) : true
    return matchWeek && matchLine
  })

  return (
    <div className="space-y-6 w-full relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Schedule Assignment Panel */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-2">Schedule & Bottleneck Simulation</h2>
        <p className="text-sm text-gray-600 mb-4">Assign orders to active production lines across a rolling 4-week window using current dynamic factory parameters.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="block font-medium text-black">Select Order</label>
            <select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white">
              <option value="">-- Select Order --</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.style_name} ({o.total_units}u)</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium text-black">Target Line (Active Only)</label>
            <select value={selectedLineId} onChange={e => setSelectedLineId(e.target.value)} className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white">
              <option value="">-- All Lines (Active & Disabled) --</option>
              {lines.map(l => (
                <option key={l.id} value={l.id}>
                  {l.line_name} ({l.apparel_category}) {l.is_active === false ? '- [Disabled]' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-black">Target Week Window</label>
            <select value={targetWeek} onChange={e => setTargetWeek(Number(e.target.value))} className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white">
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

      {/* Assigned Order Records & Storage */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-black">Assigned Order Records & Storage</h2>
            <p className="text-sm text-gray-600">Filter records by specific week or line view below without altering master simulation loads.</p>
          </div>
          <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-black whitespace-nowrap">Filter Line:</span>
              <select 
                value={tableFilterLineId} 
                onChange={e => setTableFilterLineId(e.target.value)} 
                className="border border-gray-400 rounded p-1.5 text-sm text-black bg-white"
              >
                <option value="">-- All Lines --</option>
                {lines.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.line_name} {l.is_active === false ? '(Disabled)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-black whitespace-nowrap">Filter Week:</span>
              <select 
                value={tableFilterWeek} 
                onChange={e => setTableFilterWeek(e.target.value)} 
                className="border border-gray-400 rounded p-1.5 text-sm text-black bg-white"
              >
                <option value="">-- All Weeks --</option>
                <option value="1">Week 1</option>
                <option value="2">Week 2</option>
                <option value="3">Week 3</option>
                <option value="4">Week 4</option>
              </select>
            </div>
          </div>
        </div>

        {filteredSchedules.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No order allocations found for the selected view.</p>
        ) : (
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm text-black">
              <thead>
                <tr className="bg-gray-100 text-black text-xs uppercase tracking-wider font-bold">
                  <th className="p-2 border border-gray-300">Order Style</th>
                  <th className="p-2 border border-gray-300">Assigned Line</th>
                  <th className="p-2 border border-gray-300 text-center">Target Week</th>
                  <th className="p-2 border border-gray-300 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((sched: any) => {
                  const lineObj = getLineObj(sched.line_id)
                  const isLineDisabled = lineObj && lineObj.is_active === false

                  return (
                    <tr key={sched.id} className="border-b border-gray-200">
                      <td className="p-2 border border-gray-300 font-medium">{getOrderName(sched.order_id)}</td>
                      <td className="p-2 border border-gray-300">
                        <div className="flex items-center space-x-2">
                          <span>{lineObj ? lineObj.line_name : 'Unknown Line'}</span>
                          {isLineDisabled && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-300 text-[10px] rounded font-semibold">
                              [Disabled Line]
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 border border-gray-300 text-center font-semibold">Week {sched.target_week}</td>
                      <td className="p-2 border border-gray-300 text-center">
                        <button onClick={() => handleDeleteSchedule(sched.id)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded border border-red-300 transition font-medium">
                          Delete Allocation
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

      {/* Rolling 4-Week Horizon Dashboard Matrix */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-black">
            {selectedLineId ? "Filtered Line Capacity Dashboard" : "Rolling 4-Week Horizon & Bottleneck Dashboard (Dynamic Calculation)"}
          </h2>
          <div className="flex space-x-3 text-xs font-medium text-black">
            <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span> Available (&lt;100%)</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span> FULL / Bottleneck (&ge;100%)</span>
          </div>
        </div>

        <div className="space-y-8">
          {displayedLines.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No production lines available for view.</p>
          ) : (
            displayedLines.map(line => {
              const isLineDisabled = line.is_active === false

              return (
                <div key={line.id} className={`border rounded-lg overflow-hidden ${isLineDisabled ? 'border-dashed border-gray-400 bg-gray-50' : 'border-gray-300'}`}>
                  <div className={`px-4 py-2 border-b flex justify-between items-center ${isLineDisabled ? 'bg-gray-200 border-gray-300 text-gray-600' : 'bg-gray-100 border-gray-300 text-black'}`}>
                    <span className="font-bold text-sm flex items-center space-x-2">
                      <span>Production Line: {line.line_name}</span>
                      <span className="font-normal">({line.apparel_category})</span>
                      {isLineDisabled && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-300 text-xs rounded font-bold">
                          [Disabled Line]
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-600">Working Days / Week: {settings.weekly_working_days}d</span>
                  </div>
                  <table className="w-full text-left border-collapse text-sm text-black">
                    <thead>
                      <tr className="bg-gray-50 text-black text-xs uppercase tracking-wider font-bold">
                        <th className="p-3 border-b border-r border-gray-300 w-1/4">Department (Loss Rate)</th>
                        <th className="p-3 border-b border-r border-gray-300 text-center">Week 1</th>
                        <th className="p-3 border-b border-r border-gray-300 text-center">Week 2</th>
                        <th className="p-3 border-b border-r border-gray-300 text-center">Week 3</th>
                        <th className="p-3 border-b border-gray-300 text-center">Week 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { dept: 'CUT', rate: `${settings.cut_loss_rate * 100}%` },
                        { dept: 'SEW', rate: `${settings.sew_loss_rate * 100}%` },
                        { dept: 'FINISH', rate: `${settings.finish_loss_rate * 100}%` },
                        { dept: 'PACK', rate: `${settings.pack_loss_rate * 100}%` },
                      ].map(({ dept, rate }) => {
                        const weeklyCap = getWeeklyCapacity(line.id, dept)
                        return (
                          <tr key={dept} className="border-b border-gray-200">
                            <td className="p-3 border-r border-gray-300 font-medium text-black bg-white">
                              {dept} <span className="text-xs text-gray-500 font-normal">({rate} loss)</span>
                              {dept === 'FINISH' && <span className="text-xs text-red-600 font-bold ml-1">(Bottleneck)</span>}
                              <div className="text-xs text-gray-600">Weekly Cap: {weeklyCap}u</div>
                            </td>
                            {[1, 2, 3, 4].map(weekNum => {
                              const load = calculateLoad(line.id, weekNum, dept)
                              const pct = Math.round((load / weeklyCap) * 100)
                              const isFull = pct >= 100
                              return (
                                <td key={weekNum} className="p-3 border-r border-gray-300 text-center last:border-r-0">
                                  <div className="text-xs text-black font-semibold">{load}u</div>
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs border mt-1 ${isFull ? 'bg-red-100 text-red-800 border-red-300 font-bold' : 'bg-green-100 text-green-800 border-green-300'}`}>
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
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}