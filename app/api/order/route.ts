// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 获取所有订单
export async function GET() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, orders: data })
}

// POST: 录入新订单
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { style_name, apparel_category, total_units, shipment_window_start, shipment_window_end } = body

    const { data, error } = await supabase.from('orders').insert([
      {
        style_name,
        apparel_category,
        total_units,
        shipment_window_start,
        shipment_window_end,
      }
    ]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, order: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}