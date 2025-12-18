'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WorkspaceLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  assistant?: ReactNode
}

export function WorkspaceLayout({ sidebar, main, assistant }: WorkspaceLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 gap-8 bg-background p-8 md:grid-cols-[340px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)_380px]">
      <div className="hidden md:block">{sidebar}</div>
      <div className={cn('flex flex-col gap-6', assistant ? 'lg:col-span-1' : 'md:col-span-1')}>
        {main}
      </div>
      {assistant && <div className="hidden lg:block">{assistant}</div>}
    </div>
  )
}


