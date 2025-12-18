'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { NovelOverview } from './NovelOverview'
import { BookMarked, Sparkles } from 'lucide-react'

interface ResourceCenterNovel {
  id: string
  title: string
  updatedAt: string
}

interface ResourceCenterProps {
  novels: ResourceCenterNovel[]
  selectedNovelId?: string
  onSelectNovel: (novelId: string) => void
  novelDetail?: Parameters<typeof NovelOverview>[0]['novel']
  onOpenTool: (tool: string) => void
}

export function ResourceCenter({
  novels,
  selectedNovelId,
  onSelectNovel,
  novelDetail,
  onOpenTool
}: ResourceCenterProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-teal-50/10">
      <header className="border-b border-border/40 bg-white/80 backdrop-blur-xl px-8 py-6 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">资料中心</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">全景掌握世界观与角色档案</h1>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              统一管理角色设定、故事大纲与世界观资料，点击下方快捷按钮可快速调出对应的 AI 工作室。
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-[260px]">
            <Select value={selectedNovelId} onValueChange={onSelectNovel}>
              <SelectTrigger className="h-11 rounded-xl border-2 hover-glow font-semibold">
                <SelectValue placeholder="选择作品" />
              </SelectTrigger>
              <SelectContent>
                {novels.map((novel) => (
                  <SelectItem key={novel.id} value={novel.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium">{novel.title}</span>
                      <span className="text-xs text-muted-foreground">{new Date(novel.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenTool('ai-write')} className="rounded-xl border-2 hover-glow font-semibold">
                <Sparkles className="mr-2 h-4 w-4" /> AI 写作
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenTool('outline')} className="rounded-xl border-2 hover-glow font-semibold">
                <BookMarked className="mr-2 h-4 w-4" /> 生成大纲
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenTool('character')} className="rounded-xl border-2 hover-glow font-semibold">
                <Sparkles className="mr-2 h-4 w-4" /> 角色设定
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenTool('more')} className="rounded-xl border-2 hover-glow font-semibold">
                <BookMarked className="mr-2 h-4 w-4" /> 世界观工具
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          {novelDetail ? (
            <NovelOverview novel={novelDetail} />
          ) : (
            <Card className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 p-16 text-center shadow-soft">
              <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">资料中心</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">请选择作品以查看资料</h2>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  支持查看章节概览、角色档案、故事大纲与世界观设定，也可以通过上方快捷按钮直接打开 AI 工具，生成新的资料并保存。
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

