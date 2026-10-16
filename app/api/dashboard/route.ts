// app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 1. 获取所有产线、工序产能、以及排程负载
    const { data: lines } = await supabase.from('production_lines').select('*')
    const { data: capacities } = await supabase.from('line_capacities').select('*')
    const { data: schedules } = await supabase.from('production_schedules').select('*')

    if (!lines || !capacities) {
      return NextResponse.json({ success: true, dashboard: {} })
    }

    // 2. 组装 4 周滚动看板结构与瓶颈计算
    const dashboardResult: any = {}

    for (const line of lines) {
      // 找出该产线各工序的日产能，折算为周产能（假设每周工作 6 天）
      const lineCaps = capacities.filter((c: any) => c.line_id === line.id)
      const capMap: any = { CUT: 0, SEW: 0, FINISH: 0, PACK: 0 }
      lineCaps.forEach((c: any) => {
        capMap[c.department] = c.daily_capacity_units * 6 
      })

      // 初始化 4 周负荷 (Week 1 to 4)
      const weeklyLoads = [
        { CUT: 0, SEW: 0, FINISH: 0, PACK: 0 },
        { CUT: 0, SEW: 0, FINISH: 0, PACK: 0 },
        { CUT: 0, SEW: 0, FINISH: 0, PACK: 0 },
        { CUT: 0, SEW: 0, FINISH: 0, PACK: 0 },
      ]

      // 聚合该产线在各周各工序的已排程负荷
      const lineSchedules = schedules?.filter((s: any) => s.line_id === line.id) || []
      lineSchedules.forEach((sch: any) => {
        const weekIdx = sch.target_week - 1 // 0 到 3
        if (weekIdx >= 0 && weekIdx < 4) {
          weeklyLoads[weekIdx][sch.department as 'CUT' | 'SEW' | 'FINISH' | 'PACK'] += sch.allocated_units
        }
      })

      dashboardResult[line.line_name] = {
        caps: capMap,
        loads: weeklyLoads
      }
    }

    return NextResponse.json({ success: true, dashboard: dashboardResult })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}