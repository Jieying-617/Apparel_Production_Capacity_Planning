// app/api/capacity/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 获取所有产线及工序产能
export async function GET() {
  const { data: lines, error: lineError } = await supabase.from('production_lines').select('*')
  if (lineError) return NextResponse.json({ error: lineError.message }, { status: 500 })

  const { data: capacities, error: capError } = await supabase.from('line_capacities').select('*')
  if (capError) return NextResponse.json({ error: capError.message }, { status: 500 })

  return NextResponse.json({ success: true, lines, capacities })
}

// POST: 新增产线及其 Cut, Sew, Finish, Pack 极限
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { line_name, apparel_category, cut, sew, finish, pack } = body

    // 1. 插入产线表
    const { data: lineData, error: lineError } = await supabase
      .from('production_lines')
      .insert([{ line_name, apparel_category }])
      .select()

    if (lineError || !lineData) {
      return NextResponse.json({ error: lineError?.message || 'Failed to create line' }, { status: 400 })
    }

    const lineId = lineData[0].id

    // 2. 批量插入四道工序产能
    const capacities = [
      { line_id: lineId, department: 'CUT', daily_capacity_units: cut },
      { line_id: lineId, department: 'SEW', daily_capacity_units: sew },
      { line_id: lineId, department: 'FINISH', daily_capacity_units: finish },
      { line_id: lineId, department: 'PACK', daily_capacity_units: pack },
    ]

    const { error: capError } = await supabase.from('line_capacities').insert(capacities)
    if (capError) {
      return NextResponse.json({ error: capError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Line and capacities created successfully', lineId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}