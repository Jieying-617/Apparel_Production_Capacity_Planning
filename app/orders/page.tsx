// app/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Toast from '@/app/components/Toast'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  
  // 必须显示的字段状态
  const [styleName, setStyleName] = useState('')
  const [apparelCategory, setApparelCategory] = useState('Hoodie')
  const [totalUnits, setTotalUnits] = useState('')
  const [shipmentWindowStart, setShipmentWindowStart] = useState('')
  const [shipmentWindowEnd, setShipmentWindowEnd] = useState('')

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setToast({ message: 'Failed to fetch orders: ' + error.message, type: 'error' })
    } else if (data) {
      setOrders(data)
    }
  }

  // 提交新订单（包含所有必选字段）
  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!styleName || !totalUnits || !shipmentWindowStart || !shipmentWindowEnd) {
      setToast({ message: 'Please fill in all required order details and shipment dates.', type: 'error' })
      return
    }

    const { error } = await supabase.from('orders').insert([
      {
        style_name: styleName,
        apparel_category: apparelCategory,
        total_units: Number(totalUnits),
        shipment_window_start: shipmentWindowStart,
        shipment_window_end: shipmentWindowEnd,
      }
    ])

    if (error) {
      setToast({ message: 'Failed to create order: ' + error.message, type: 'error' })
    } else {
      setToast({ message: `Order "${styleName}" created successfully!`, type: 'success' })
      // 重置表单
      setStyleName('')
      setTotalUnits('')
      setShipmentWindowStart('')
      setShipmentWindowEnd('')
      fetchOrders() // 刷新下方表格
    }
  }

  // 删除订单
  async function handleDeleteOrder(id: string) {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) {
      setToast({ message: 'Failed to delete order: ' + error.message, type: 'error' })
    } else {
      setToast({ message: 'Order deleted successfully.', type: 'success' })
      fetchOrders()
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

      {/* 1. 完整字段的订单录入表单 */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-2">Order Input & Category Mapping</h2>
        <p className="text-sm text-gray-600 mb-4">Capture complete order details including style, category, total units, and shipment date window.</p>

        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block font-medium text-black">Style Name / Code</label>
            <input 
              type="text" 
              value={styleName} 
              onChange={e => setStyleName(e.target.value)} 
              placeholder="e.g. Summer Hoodie #24"
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

          <div>
            <label className="block font-medium text-black">Total Units</label>
            <input 
              type="number" 
              value={totalUnits} 
              onChange={e => setTotalUnits(e.target.value)} 
              placeholder="e.g. 5000"
              className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
            />
          </div>

          <div>
            <label className="block font-medium text-black">Shipment Window Start</label>
            <input 
              type="date" 
              value={shipmentWindowStart} 
              onChange={e => setShipmentWindowStart(e.target.value)} 
              className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
            />
          </div>

          <div>
            <label className="block font-medium text-black">Shipment Window End</label>
            <input 
              type="date" 
              value={shipmentWindowEnd} 
              onChange={e => setShipmentWindowEnd(e.target.value)} 
              className="mt-1 w-full border border-gray-400 rounded p-2 text-black bg-white" 
            />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition">
              Add Order Record
            </button>
          </div>
        </form>
      </div>

      {/* 2. 实时显示的订单管理表格（展示所有必填字段） */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <h2 className="text-lg font-bold text-black mb-3">Order Management List</h2>
        <p className="text-sm text-gray-600 mb-4">All active apparel orders stored and ready for capacity simulation.</p>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No orders added yet. Create your first order above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-black">
              <thead>
                <tr className="bg-gray-100 text-black text-xs uppercase tracking-wider font-bold">
                  <th className="p-3 border border-gray-300">Style Name</th>
                  <th className="p-3 border border-gray-300">Category</th>
                  <th className="p-3 border border-gray-300">Total Units</th>
                  <th className="p-3 border border-gray-300">Shipment Window</th>
                  <th className="p-3 border border-gray-300 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-300 font-medium">{order.style_name}</td>
                    <td className="p-3 border border-gray-300">{order.apparel_category}</td>
                    <td className="p-3 border border-gray-300">{order.total_units}u</td>
                    <td className="p-3 border border-gray-300 text-xs text-gray-700">
                      {order.shipment_window_start} ~ {order.shipment_window_end}
                    </td>
                    <td className="p-3 border border-gray-300 text-center">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded border border-red-300 transition font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}