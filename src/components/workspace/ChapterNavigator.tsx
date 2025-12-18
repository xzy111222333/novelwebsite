'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { BookOpen, ChevronRight, EllipsisVertical, FolderOpen, GripVertical, Plus, Trash2 } from 'lucide-react'

interface ChapterNavigatorNovel {
  id: string
  title: string
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
}

interface ChapterNavigatorChapter {
  id: string
  title: string
  status: string
  wordCount: number
  updatedAt?: string
}

interface ChapterNavigatorProps {
  novels: ChapterNavigatorNovel[]
  selectedNovelId?: string
  onSelectNovel: (novelId: string) => void
  onCreateNovel: () => void
  onRenameNovel?: (novelId: string) => void
  onDeleteNovel?: (novelId: string) => void
  onOpenLibrary: () => void
  chapters: ChapterNavigatorChapter[]
  activeChapterId?: string
  onSelectChapter: (chapterId: string) => void
  onCreateChapter: () => void
  onOpenReorder: () => void
  onDeleteChapter?: (chapterId: string) => void
  novelStats?: {
    status: string
    wordCount: number
    chapterCount: number
    tags?: string[]
  }
}

const statusLabelMap: Record<string, string> = {
  draft: '草稿',
  writing: '创作中',
  completed: '已完结',
  published: '已发布'
}

export function ChapterNavigator({
  novels,
  selectedNovelId,
  onSelectNovel,
  onCreateNovel,
  onRenameNovel,
  onDeleteNovel,
  onOpenLibrary,
  chapters,
  activeChapterId,
  onSelectChapter,
  onCreateChapter,
  onOpenReorder,
  onDeleteChapter,
  novelStats
}: ChapterNavigatorProps) {
  const selectedNovel = useMemo(
    () => novels.find((item) => item.id === selectedNovelId),
    [novels, selectedNovelId]
  )

  const statusLabel = novelStats ? statusLabelMap[novelStats.status] ?? novelStats.status : undefined

  return (
    <aside className="hidden xl:flex h-full w-80 flex-col border-r border-border/40 bg-white/80 backdrop-blur-xl shadow-soft">
      <div className="space-y-4 border-b border-border/40 p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">作品选择</p>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-bold text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              {selectedNovel?.title ?? '暂未选择作品'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onOpenLibrary} className="rounded-xl hover:bg-primary/5 hover:text-primary" aria-label="打开作品库">
              <FolderOpen className="h-4 w-4" />
            </Button>
            {selectedNovelId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary">
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  {onRenameNovel && (
                    <DropdownMenuItem onClick={() => onRenameNovel(selectedNovelId)}>重命名作品</DropdownMenuItem>
                  )}
                  {onDeleteNovel && (
                    <DropdownMenuItem className="text-destructive" onClick={() => onDeleteNovel(selectedNovelId)}>
                      删除作品
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Select
          value={selectedNovelId}
          onValueChange={onSelectNovel}
        >
          <SelectTrigger className="h-11 rounded-xl border-2 hover-glow font-semibold">
            <SelectValue placeholder="选择或创建作品" />
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

        <div className="flex items-center gap-2">
          <Button onClick={onCreateNovel} className="flex-1 rounded-xl btn-primary text-primary-foreground font-bold">
            <Plus className="mr-2 h-4 w-4" />
            新建作品
          </Button>
          <Button variant="outline" onClick={onOpenReorder} disabled={chapters.length === 0} className="rounded-xl border-2 hover-glow font-semibold">
            <GripVertical className="mr-2 h-4 w-4" />
            调整顺序
          </Button>
        </div>

        {novelStats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-teal-50/50 border border-primary/10 p-3 shadow-soft">
              <p className="text-xs font-semibold text-muted-foreground">作品状态</p>
              <p className="mt-2 text-sm font-bold text-primary">{statusLabel}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-teal-50/50 border border-primary/10 p-3 shadow-soft">
              <p className="text-xs font-semibold text-muted-foreground">总字数</p>
              <p className="mt-2 text-sm font-bold text-primary">{novelStats.wordCount.toLocaleString()} 字</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-teal-50/50 border border-primary/10 p-3 shadow-soft">
              <p className="text-xs font-semibold text-muted-foreground">章节数</p>
              <p className="mt-2 text-sm font-bold text-primary">{novelStats.chapterCount} 章</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-teal-50/50 border border-primary/10 p-3 shadow-soft">
              <p className="text-xs font-semibold text-muted-foreground">标签</p>
              <p className="mt-2 text-xs text-muted-foreground font-medium">
                {novelStats.tags?.length ? novelStats.tags.join(' / ') : '暂未设置'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">章节</span>
          <Button variant="ghost" size="sm" onClick={onCreateChapter} className="rounded-xl px-3 hover:bg-primary/5 hover:text-primary font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            新建
          </Button>
        </div>
        <Separator className="bg-border/40" />
        <ScrollArea className="flex-1">
          <div className="space-y-2 px-4 py-4">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={cn(
                  'group flex items-center gap-2 rounded-2xl border bg-white/80 px-3 py-3 transition-all duration-200 shadow-soft',
                  activeChapterId === chapter.id 
                    ? 'border-primary/40 bg-gradient-to-br from-primary/10 to-teal-50/50 shadow-card' 
                    : 'border-border/40 hover:border-primary/20 hover:bg-primary/5'
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectChapter(chapter.id)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold",
                      activeChapterId === chapter.id ? "text-primary" : "text-foreground"
                    )}>
                      第 {index + 1} 章
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate">
                      {chapter.title}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">{chapter.wordCount.toLocaleString()} 字</span>
                    {chapter.updatedAt && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <ChevronRight className="h-3 w-3" />
                        {new Date(chapter.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </button>
                {onDeleteChapter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    onClick={() => onDeleteChapter(chapter.id)}
                    aria-label="删除章节"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {chapters.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 px-4 py-12 text-center text-xs text-muted-foreground font-medium">
                还没有章节，点击右上角「新建」开始创作你的第一个章节。
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border/40 p-6">
        <Button
          onClick={onCreateChapter}
          className="w-full rounded-xl btn-primary text-primary-foreground font-bold"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加章节
        </Button>
      </div>
    </aside>
  )
}
