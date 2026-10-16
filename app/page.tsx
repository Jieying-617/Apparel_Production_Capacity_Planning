// app/page.tsx
'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {

  useEffect(() => {
    // async function testSupabaseConnection() {
    //   try {
    //     // 尝试查询 production_lines 表
    //     const { data, error } = await supabase.from('production_lines').select('*')

    //     if (error) {
    //       console.error('Supabase 错误:', error)
    //       setConnectionStatus(`❌ 连接失败: ${error.message}`)
    //     } else {
    //       setConnectionStatus('✅ Supabase 连接成功！')
    //       setLines(data || [])
    //     }
    //   } catch (err: any) {
    //     console.error('网络或未知错误:', err)
    //     setConnectionStatus(`❌ 连接异常: ${err.message}`)
    //   }
    // }

    // testSupabaseConnection()
    redirect('/capacity')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
    </div>
  )
}