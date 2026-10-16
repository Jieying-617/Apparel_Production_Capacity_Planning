// app/components/Toast.tsx
'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  // 设置 5 秒后自动触发 onClose
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* 移除了 animate-bounce，改为平稳的提示框样式 */}
      <div className={`pointer-events-auto flex items-center px-6 py-4 rounded-xl shadow-2xl border text-sm font-medium max-w-md text-center transition-all ${
        type === 'success' 
          ? 'bg-white text-green-800 border-green-300 shadow-green-100' 
          : 'bg-white text-red-800 border-red-300 shadow-red-100'
      }`}>
        <span className="flex-1">{message}</span>
        <button 
          onClick={onClose} 
          className="ml-4 text-gray-400 hover:text-black font-bold text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  )
}