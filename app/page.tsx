// app/page.tsx
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState('正在测试连接...')
  const [lines, setLines] = useState<any[]>([])

  useEffect(() => {
    async function testSupabaseConnection() {
      try {
        // 尝试查询 production_lines 表
        const { data, error } = await supabase.from('production_lines').select('*')

        if (error) {
          console.error('Supabase 错误:', error)
          setConnectionStatus(`❌ 连接失败: ${error.message}`)
        } else {
          setConnectionStatus('✅ Supabase 连接成功！')
          setLines(data || [])
        }
      } catch (err: any) {
        console.error('网络或未知错误:', err)
        setConnectionStatus(`❌ 连接异常: ${err.message}`)
      }
    }

    testSupabaseConnection()
    redirect('/capacity')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
        <h1 className="text-xl font-bold text-gray-800">🏭 工厂产能规划系统 - 连通性测试</h1>
        
        {/* 状态展示 */}
        <div className="p-4 rounded-lg bg-gray-100 font-medium text-sm">
          {connectionStatus}
        </div>

        {/* 展示从数据库拉取的数据 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">已读取到的产线数据:</h2>
          <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(lines, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}