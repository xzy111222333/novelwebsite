'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ListFilter, PanelsTopLeft, MoreHorizontal, GripVertical } from 'lucide-react'
import { Reorder } from 'framer-motion'

interface NovelSidebarProps {
  novels: Array<{
    id: string
    title: string
    description?: string | null
    status: string
    chapterCount: number
    wordCount: number
    updatedAt: string
    tags?: string[]
  }>
  activeNovelId?: string
  chapters: Array<{
    id: string
    title: string
    wordCount: number
    status: string
  }>
  activeChapterId?: string
  onNovelSelect?: (novelId: string) => void
  onChapterSelect?: (chapterId: string) => void
  onCreateNovel?: () => void
  onCreateChapter?: () => void
  onRenameNovel?: (novelId: string) => void
  onDeleteNovel?: (novelId: string) => void
  onReorderChapters?: (chapterIds: string[]) => void
}

export function NovelSidebar({
  novels,
  activeNovelId,
  chapters,
  activeChapterId,
  onNovelSelect,
  onChapterSelect,
  onCreateNovel,
  onCreateChapter,
  onRenameNovel,
  onDeleteNovel,
  onReorderChapters,
}: NovelSidebarProps) {
  const { toast } = useToast()
  const [searchValue, setSearchValue] = useState('')
  const [tab, setTab] = useState<'novels' | 'chapters'>('novels')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false)
  const [reorderDraft, setReorderDraft] = useState<typeof chapters>([])

  useEffect(() => {
    setReorderDraft(chapters)
  }, [chapters])

  useEffect(() => {
    if (activeNovelId) {
      setTab('chapters')
    }
  }, [activeNovelId])

  const filteredNovels = useMemo(() => {
    return novels.filter((novel) => {
      const matchesStatus = statusFilter === 'all' || novel.status === statusFilter
      const matchesTag = !tagFilter || (novel.tags || []).includes(tagFilter)
      const matchesSearch = !searchValue
        || [novel.title, novel.description, ...(novel.tags || [])]
          .filter(Boolean)
          .some((fragment) => fragment!.toLowerCase().includes(searchValue.toLowerCase()))
      return matchesStatus && matchesTag && matchesSearch
    })
  }, [novels, searchValue, statusFilter, tagFilter])

  const filteredChapters = useMemo(() => {
    if (!searchValue) return chapters
    return chapters.filter((chapter) =>
      chapter.title.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [chapters, searchValue])

  const handleCreateNovel = useCallback(() => {
    if (!onCreateNovel) {
      toast({ variant: 'destructive', description: '暂不支持创建小说' })
      return
    }
    onCreateNovel()
  }, [onCreateNovel, toast])

  const handleCreateChapter = useCallback(() => {
    if (!activeNovelId) {
      toast({ variant: 'destructive', description: '请先选择一个小说项目' })
      return
    }
    onCreateChapter?.()
  }, [activeNovelId, onCreateChapter, toast])

  return (
    <Card className="flex h-full flex-col gap-6 border border-border bg-card p-6 rounded-2xl">
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">快速检索</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="搜索小说或章节"
            className="pl-10 rounded-xl border-2"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-xl p-1">
          <TabsTrigger value="novels" className="rounded-lg font-medium">作品库</TabsTrigger>
          <TabsTrigger value="chapters" disabled={!activeNovelId} className="rounded-lg font-medium">
            章节
          </TabsTrigger>
        </TabsList>

        <TabsContent value="novels" className="mt-6 flex-1">
          <div className="flex items-center justify-between pb-4">
            <Label className="text-sm font-semibold text-foreground">全部作品</Label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="px-2 rounded-lg" onClick={() => setShowFilters((prev) => !prev)}>
                <ListFilter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCreateNovel} className="rounded-lg border-2 font-medium">
                <Plus className="mr-1 h-4 w-4" /> 新建
              </Button>
            </div>
          </div>
          {showFilters && (
            <div className="mb-4 space-y-4 rounded-xl border border-border bg-secondary/30 p-4 text-xs">
              <div className="space-y-2">
                <p className="font-semibold text-foreground text-sm">作品状态</p>
                <ToggleGroup type="single" value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)} className="gap-2 flex-wrap">
                  {[
                    { value: 'all', label: '全部' },
                    { value: 'draft', label: '草稿' },
                    { value: 'writing', label: '写作中' },
                    { value: 'completed', label: '已完成' },
                    { value: 'published', label: '已发布' },
                  ].map((item) => (
                    <ToggleGroupItem key={item.value} value={item.value} className="rounded-full border-2 bg-card px-4 py-1.5 text-xs font-medium text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                      {item.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground text-sm">标签</p>
                <Input
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value.trim())}
                  placeholder="输入标签，例如：奇幻"
                  className="h-9 rounded-lg border-2"
                />
              </div>
            </div>
          )}
          <ScrollArea className="h-[calc(100vh-320px)] pr-3">
            <div className="space-y-3">
              {filteredNovels.map((novel) => (
                <div key={novel.id} className={cn('rounded-xl border bg-card px-5 py-4 transition-all hover:border-foreground/20', activeNovelId === novel.id && 'border-foreground bg-secondary/30')}>
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" className="flex-1 text-left" onClick={() => onNovelSelect?.(novel.id)}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">{novel.title}</p>
                        <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-2">
                          {statusLabel(novel.status)}
                        </Badge>
                      </div>
                      {novel.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{novel.description}</p>
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => onNovelSelect?.(novel.id)} className="rounded-lg">进入写作</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRenameNovel?.(novel.id)} className="rounded-lg">重命名</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteNovel?.(novel.id)} className="text-destructive rounded-lg">
                          删除作品
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{novel.chapterCount} 章节</span>
                    <span>{novel.wordCount} 字</span>
                    <span>更新 {new Date(novel.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {(novel.tags || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(novel.tags || []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 rounded-md">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredNovels.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">暂无匹配作品，尝试更换筛选条件。</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chapters" className="mt-6 flex-1">
          <div className="flex items-center justify-between pb-4">
            <Label className="text-sm font-semibold text-foreground">章节列表</Label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="px-2 rounded-lg" onClick={() => setIsReorderDialogOpen(true)}>
                <PanelsTopLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCreateChapter} className="rounded-lg border-2 font-medium">
                <Plus className="mr-1 h-4 w-4" /> 新建章节
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-320px)] pr-3">
            <div className="space-y-2">
              {filteredChapters.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onChapterSelect?.(chapter.id)}
                  className={cn(
                    'block w-full rounded-xl border bg-card px-4 py-3 text-left transition-all hover:border-foreground/20',
                    activeChapterId === chapter.id && 'border-foreground bg-secondary/30'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{chapter.title}</p>
                    <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-2">
                      {statusLabel(chapter.status)}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{chapter.wordCount} 字</p>
                </button>
              ))}
              {filteredChapters.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">暂无章节或搜索无结果。</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="space-y-2 text-xs text-muted-foreground rounded-lg bg-secondary/30 p-4">
        <p className="font-semibold text-foreground">小提示</p>
        <p>· 点击作品即可快速切换项目</p>
        <p>· 在章节页可以直接重排与管理章节</p>
      </div>

      <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>章节顺序管理</DialogTitle>
            <DialogDescription>拖拽章节卡片调整顺序，保存后即时同步至写作工作台。</DialogDescription>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-80">
            <Reorder.Group axis="y" values={reorderDraft} onReorder={setReorderDraft} className="space-y-3">
              {reorderDraft.map((chapter) => (
                <Reorder.Item
                  key={chapter.id}
                  value={chapter}
                  className="flex cursor-grab items-center justify-between rounded-xl border bg-white/80 p-3 text-sm text-slate-700 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-slate-300" />
                    <span className="font-medium">{chapter.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{chapter.wordCount} 字</span>
                </Reorder.Item>
              ))}
              {reorderDraft.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  当前作品还没有章节，创建后即可在此重排。
                </div>
              )}
            </Reorder.Group>
          </ScrollArea>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsReorderDialogOpen(false)}>
              取消
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsReorderDialogOpen(false)
                onReorderChapters?.(reorderDraft.map((chapter) => chapter.id))
              }}
            >
              保存顺序
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function statusLabel(status: string) {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'writing':
      return '写作中'
    case 'completed':
      return '已完成'
    case 'published':
      return '已发布'
    default:
      return status
  }
}


