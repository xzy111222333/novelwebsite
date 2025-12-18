'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import {
  ChapterComposer,
  CharacterStudio,
  StoryOutlineStudio,
  ChapterNavigator,
  LibraryBoard,
  ResourceCenter,
  AiWritingPanel,
  AiRefinePanel,
  AiContinuationPanel,
  AiDeconstructPanel,
  AiNamingPanel,
  AiReviewPanel,
  AiToolkitPanel,
} from '@/components/workspace'
import { Reorder } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  BookMarked,
  BookOpen,
  Copy,
  Download,
  Feather,
  FileCheck2,
  Globe2,
  Highlighter,
  Layers,
  Library,
  Loader2,
  PenSquare,
  Plus,
  Sparkles,
  Stars,
  Type,
  Users,
} from 'lucide-react'

type NavView = 'workspace' | 'library' | 'resources'
type AssistantTool =
  | 'ai-write'
  | 'ai-expand'
  | 'ai-continue'
  | 'outline'
  | 'world'
  | 'character'
  | 'naming'
  | 'review'
  | 'more'

interface NavigationItem {
  id: NavView
  label: string
  icon: LucideIcon
}

const NAVIGATION: NavigationItem[] = [
  { id: 'workspace', label: '写作', icon: PenSquare },
  { id: 'library', label: '作品库', icon: Library },
  { id: 'resources', label: '资料', icon: Layers },
]

interface ToolDefinition {
  id: AssistantTool
  label: string
  icon: LucideIcon
  description: string
  requireNovel?: boolean
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'ai-write',
    label: 'AI写作',
    icon: Sparkles,
    description: '根据提纲生成章节草稿',
    requireNovel: true,
  },
  {
    id: 'ai-expand',
    label: 'AI扩写润色',
    icon: Highlighter,
    description: '对当前文本进行扩写润色',
    requireNovel: true,
  },
  {
    id: 'ai-continue',
    label: 'AI续写正文',
    icon: Feather,
    description: '延续当前章节的剧情',
    requireNovel: true,
  },
  {
    id: 'outline',
    label: '章纲',
    icon: BookMarked,
    description: '构建完整的故事框架',
    requireNovel: true,
  },
  {
    id: 'world',
    label: 'AI拆书',
    icon: Globe2,
    description: '分析作品并提取要点',
    requireNovel: true,
  },
  {
    id: 'character',
    label: '角色工作室',
    icon: Users,
    description: '生成并保存角色档案',
    requireNovel: true,
  },
  {
    id: 'naming',
    label: 'AI起名',
    icon: Type,
    description: '为角色、势力或地点命名',
  },
  {
    id: 'review',
    label: 'AI审稿',
    icon: FileCheck2,
    description: '智能审稿与优化建议',
    requireNovel: true,
  },
  {
    id: 'more',
    label: '更多AI工具',
    icon: Stars,
    description: '探索更多创作辅助功能',
  },
]

const GENRE_PRESETS = ['奇幻玄幻', '都市言情', '科幻未来', '历史穿越', '悬疑推理', '轻松日常']
const TAG_PRESETS = ['热血冒险', '群像叙事', '慢热治愈', '快节奏', '甜爽文', '成长线', '反转悬疑', '脑洞设定']

interface NovelRecord {
  id: string
  title: string
  description?: string | null
  genre?: string | null
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
  tags?: string[]
}

interface ChapterRecord {
  id: string
  title: string
  wordCount: number
  status: string
  updatedAt?: string
}

interface FullNovel extends NovelRecord {
  chapters: Array<ChapterRecord & { content?: string }>
  characters: Array<{
    id: string
    name: string
    description: string
    personality?: string | null
  }>
  outlines: Array<{
    id: string
    title: string
    content: string
    order: number
  }>
  worldBuilding?: {
    id: string
    title: string
    content: string
    type: string
  } | null
}

interface NovelCreationPayload {
  title: string
  description: string
  genre: string
  tags: string[]
}

interface ChapterCreationPayload {
  title: string
  content: string
}

export default function AppPage() {
  const [navView, setNavView] = useState<NavView>('workspace')
  const [assistantTool, setAssistantTool] = useState<AssistantTool | null>(null)

  const [novels, setNovels] = useState<NovelRecord[]>([])
  const [selectedNovelId, setSelectedNovelId] = useState<string>()
  const [selectedChapterId, setSelectedChapterId] = useState<string>()
  const [fullNovel, setFullNovel] = useState<FullNovel>()
  const [chapters, setChapters] = useState<ChapterRecord[]>([])
  const [reorderDraft, setReorderDraft] = useState<ChapterRecord[]>([])

  const [novelDialogOpen, setNovelDialogOpen] = useState(false)
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false)
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false)

  const [exporting, setExporting] = useState(false)
  const [creatingNovel, setCreatingNovel] = useState(false)
  const [creatingChapter, setCreatingChapter] = useState(false)

  const [novelForm, setNovelForm] = useState({
    title: '',
    description: '',
    genre: GENRE_PRESETS[0],
    tags: [] as string[],
    customTag: '',
  })
  const [chapterForm, setChapterForm] = useState({
    title: '',
    content: '',
  })

  const activeChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === selectedChapterId),
    [chapters, selectedChapterId]
  )

  // 在 app/app/page.tsx 中更新 fetchNovels 函数
const fetchNovels = useCallback(async () => {
  try {
    console.log('开始获取小说列表...')
    const response = await fetch('/api/novels')
    
    // 首先检查响应状态
    if (!response.ok) {
      // 如果是未授权，重定向到登录页
      if (response.status === 401) {
        console.log('未授权，需要重新登录')
        window.location.href = '/auth/signin'
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('非 JSON 响应:', text)
      throw new Error('服务器返回了非 JSON 响应')
    }
    
    const data = await response.json()
    console.log('获取小说列表成功:', data)
    
    if (data.success) {
      setNovels(data.novels)
      if (!selectedNovelId && data.novels.length > 0) {
        setSelectedNovelId(data.novels[0].id)
      }
    } else {
      throw new Error(data.error || '获取作品失败')
    }
  } catch (error) {
    console.error('获取小说列表失败详情:', error)
    toast({
      description: error instanceof Error ? error.message : '获取作品失败',
      variant: 'destructive',
    })
  }
}, [selectedNovelId])
  const fetchNovelDetail = useCallback(async (novelId: string) => {
    try {
      const response = await fetch(`/api/novels/${novelId}`)
      const data = await response.json()
      if (data.success) {
        setFullNovel(data.novel)
      } else {
        throw new Error(data.error || '获取作品详情失败')
      }
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '获取作品详情失败',
        variant: 'destructive',
      })
    }
  }, [])

  const fetchChapters = useCallback(async (novelId: string) => {
    try {
      const response = await fetch(`/api/novels/${novelId}/chapters`)
      const data = await response.json()
      if (data.success) {
        setChapters(data.chapters)
        setReorderDraft(data.chapters)
      } else {
        throw new Error(data.error || '获取章节失败')
      }
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '获取章节失败',
        variant: 'destructive',
      })
    }
  }, [])

  useEffect(() => {
    void fetchNovels()
  }, [fetchNovels])

  useEffect(() => {
    if (!selectedNovelId) {
      setFullNovel(undefined)
      setChapters([])
      setSelectedChapterId(undefined)
      setAssistantTool(null)
      return
    }
    void fetchNovelDetail(selectedNovelId)
    void fetchChapters(selectedNovelId)
  }, [fetchChapters, fetchNovelDetail, selectedNovelId])

  useEffect(() => {
    if (chapters.length === 0) {
      setSelectedChapterId(undefined)
      return
    }
    if (!selectedChapterId || !chapters.some((chapter) => chapter.id === selectedChapterId)) {
      setSelectedChapterId(chapters[0].id)
    }
  }, [chapters, selectedChapterId])

  const createNovel = useCallback(async ({ title, description, genre, tags }: NovelCreationPayload) => {
    if (!title.trim()) {
      toast({ description: '请输入作品标题', variant: 'destructive' })
      return
    }
    setCreatingNovel(true)
    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, genre, tags }),
      })
      const data = await response.json()
      if (!data.success) {
        toast({ description: data.error || '创建失败', variant: 'destructive' })
        return
      }

      toast({ description: '新作品已创建' })
      setNovelDialogOpen(false)
      setNavView('workspace')
      setNovelForm({
        title: '',
        description: '',
        genre: GENRE_PRESETS[0],
        tags: [],
        customTag: '',
      })
      setSelectedNovelId(data.novel.id)
      setAssistantTool(null)
      void fetchNovels()
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '创建作品失败',
        variant: 'destructive',
      })
    } finally {
      setCreatingNovel(false)
    }
  }, [fetchNovels])

  const createChapter = useCallback(
    async ({ title, content }: ChapterCreationPayload) => {
      if (!selectedNovelId) {
        toast({ description: '请先选择一个作品', variant: 'destructive' })
        return
      }
      if (!title.trim()) {
        toast({ description: '请输入章节标题', variant: 'destructive' })
        return
      }
      setCreatingChapter(true)
      try {
        const response = await fetch(`/api/novels/${selectedNovelId}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        })
        const data = await response.json()
        if (!data.success) {
          toast({ description: data.error || '创建失败', variant: 'destructive' })
          return
        }

        toast({ description: '新章节已创建' })
        setChapterDialogOpen(false)
        setChapterForm({ title: '', content: '' })
        setSelectedChapterId(data.chapter.id)
        void fetchChapters(selectedNovelId)
        void fetchNovelDetail(selectedNovelId)
      } catch (error) {
        console.error(error)
        toast({
          description: error instanceof Error ? error.message : '创建章节失败',
          variant: 'destructive',
        })
      } finally {
        setCreatingChapter(false)
      }
    },
    [fetchChapters, fetchNovelDetail, selectedNovelId]
  )

  const handleChapterSaved = useCallback(() => {
    if (!selectedNovelId) return
    void fetchChapters(selectedNovelId)
    void fetchNovelDetail(selectedNovelId)
  }, [fetchChapters, fetchNovelDetail, selectedNovelId])

  const refreshNovelSnapshot = useCallback(() => {
    if (!selectedNovelId) return
    void fetchChapters(selectedNovelId)
    void fetchNovelDetail(selectedNovelId)
  }, [fetchChapters, fetchNovelDetail, selectedNovelId])

  const handleAiChapterCreated = useCallback(
    (chapterId: string) => {
      setSelectedChapterId(chapterId)
      refreshNovelSnapshot()
    },
    [refreshNovelSnapshot]
  )

  const handleAiChapterUpdated = useCallback(() => {
    refreshNovelSnapshot()
  }, [refreshNovelSnapshot])

  const handleDeleteNovel = useCallback(
    async (novelId: string) => {
      const confirmed = window.confirm('确定要删除该作品吗？此操作不可恢复。')
      if (!confirmed) return

      try {
        const response = await fetch(`/api/novels/${novelId}`, { method: 'DELETE' })
        const data = await response.json()
        if (!data.success) {
          toast({ description: data.error || '删除失败', variant: 'destructive' })
          return
        }
        toast({ description: '作品已删除' })
        if (selectedNovelId === novelId) {
          setSelectedNovelId(undefined)
          setSelectedChapterId(undefined)
          setFullNovel(undefined)
          setChapters([])
          setReorderDraft([])
        }
        void fetchNovels()
      } catch (error) {
        console.error(error)
        toast({
          description: error instanceof Error ? error.message : '删除作品失败',
          variant: 'destructive',
        })
      }
    },
    [fetchNovels, selectedNovelId]
  )

  const handleRenameNovel = useCallback(
    async (novelId: string) => {
      const current = novels.find((item) => item.id === novelId)
      const nextTitle = window.prompt('新的作品名称', current?.title ?? '')?.trim()
      if (!nextTitle) return

      try {
        const response = await fetch(`/api/novels/${novelId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: nextTitle }),
        })
        const data = await response.json()
        if (!data.success) {
          toast({ description: data.error || '重命名失败', variant: 'destructive' })
          return
        }
        toast({ description: '作品名称已更新' })
        void fetchNovels()
        if (selectedNovelId === novelId) {
          void fetchNovelDetail(novelId)
        }
      } catch (error) {
        console.error(error)
        toast({
          description: error instanceof Error ? error.message : '重命名失败',
          variant: 'destructive',
        })
      }
    },
    [fetchNovels, fetchNovelDetail, novels, selectedNovelId]
  )

  const handleDeleteChapter = useCallback(
    async (chapterId: string) => {
      if (!selectedNovelId) return
      const confirmed = window.confirm('确定删除该章节吗？')
      if (!confirmed) return
      try {
        const response = await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' })
        const data = await response.json()
        if (!data.success) {
          toast({ description: data.error || '删除失败', variant: 'destructive' })
          return
        }
        toast({ description: '章节已删除' })
        setSelectedChapterId((current) => (current === chapterId ? undefined : current))
        void fetchChapters(selectedNovelId)
        void fetchNovelDetail(selectedNovelId)
      } catch (error) {
        console.error(error)
        toast({
          description: error instanceof Error ? error.message : '删除章节失败',
          variant: 'destructive',
        })
      }
    },
    [fetchChapters, fetchNovelDetail, selectedNovelId]
  )

  const handleReorderChapters = useCallback(
    async (chapterIds: string[]) => {
      if (!selectedNovelId || chapterIds.length === 0) return
      try {
        const response = await fetch(`/api/novels/${selectedNovelId}/chapters`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterIds }),
        })
        const data = await response.json()
        if (!data.success) {
          toast({ description: data.error || '章节排序更新失败', variant: 'destructive' })
          return
        }
        toast({ description: '章节顺序已保存' })
        void fetchChapters(selectedNovelId)
      } catch (error) {
        console.error(error)
        toast({
          description: error instanceof Error ? error.message : '更新章节顺序失败',
          variant: 'destructive',
        })
      }
    },
    [fetchChapters, selectedNovelId]
  )

  const exportNovel = useCallback(
    async (format: 'markdown' | 'text') => {
      if (!fullNovel) return
      setExporting(true)
      try {
        const content = fullNovel.chapters
          .map((chapter, index) => {
            const heading =
              format === 'markdown'
                ? `# 第${index + 1}章 ${chapter.title}`
                : `第${index + 1}章 ${chapter.title}`
            return `${heading}\n\n${chapter.content ?? ''}`
          })
          .join('\n\n')

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fullNovel.title}.${format === 'markdown' ? 'md' : 'txt'}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)

        toast({ description: `已导出 ${format === 'markdown' ? 'Markdown' : 'TXT'} 文件` })
      } catch (error) {
        console.error(error)
        toast({
          description: error instanceof Error ? error.message : '导出失败',
          variant: 'destructive',
        })
      } finally {
        setExporting(false)
      }
    },
    [fullNovel]
  )

  const assistantPanel = useMemo(() => {
    switch (assistantTool) {
      case 'ai-write':
        return (
          <AiWritingPanel
            novelId={selectedNovelId}
            chapterId={selectedChapterId}
            onChapterCreated={handleAiChapterCreated}
            onChapterUpdated={handleAiChapterUpdated}
          />
        )
      case 'ai-expand':
        return (
          <AiRefinePanel
            chapterId={selectedChapterId}
            onChapterUpdated={handleAiChapterUpdated}
          />
        )
      case 'ai-continue':
        return (
          <AiContinuationPanel
            chapterId={selectedChapterId}
            onChapterUpdated={handleAiChapterUpdated}
          />
        )
      case 'outline':
        if (!selectedNovelId) return null
        return (
          <StoryOutlineStudio
            novelId={selectedNovelId}
            onCreated={() => {
              if (selectedNovelId) {
                void fetchNovelDetail(selectedNovelId)
              }
            }}
          />
        )
      case 'world':
        return (
          <AiDeconstructPanel
            novelId={selectedNovelId}
            chapterId={selectedChapterId}
            novelTitle={fullNovel?.title}
            chapters={fullNovel?.chapters}
          />
        )
      case 'character':
        if (!selectedNovelId) return null
        return (
          <CharacterStudio
            novelId={selectedNovelId}
            onCreated={() => {
              if (selectedNovelId) {
                void fetchNovelDetail(selectedNovelId)
              }
            }}
          />
        )
      case 'naming':
        return <AiNamingPanel novelId={selectedNovelId} />
      case 'review':
        return <AiReviewPanel chapterId={selectedChapterId} />
      case 'more':
        return (
          <AiToolkitPanel
            novelId={selectedNovelId}
            onSelectTool={(tool) => setAssistantTool(tool as AssistantTool)}
            onNavigate={(view) => {
              setNavView(view)
              if (view !== 'workspace') {
                setAssistantTool(null)
              }
            }}
          />
        )
      default:
        return null
    }
  }, [
    assistantTool,
    fetchNovelDetail,
    fullNovel?.chapters,
    fullNovel?.title,
    handleAiChapterCreated,
    handleAiChapterUpdated,
    selectedChapterId,
    selectedNovelId,
  ])

  const assistantOpen = Boolean(assistantPanel)

  const openReorderDialog = useCallback(() => {
    setReorderDraft(chapters)
    setIsReorderDialogOpen(true)
  }, [chapters])

  const handleAssistantClick = useCallback(
    (tool: ToolDefinition) => {
      if (tool.requireNovel && !selectedNovelId) {
        toast({ description: '请先选择或创建一个作品', variant: 'destructive' })
        return
      }
      setNavView('workspace')
      setAssistantTool((previous) => (previous === tool.id ? null : tool.id))
    },
    [selectedNovelId]
  )

  const workspaceBadges = useMemo(() => {
    if (!fullNovel) return null
    return [
      { label: '作品状态', value: statusLabel(fullNovel.status) },
      { label: '章节数量', value: `${fullNovel.chapterCount} 章` },
      { label: '总字数', value: `${fullNovel.wordCount.toLocaleString()} 字` },
      {
        label: '作品标签',
        value: fullNovel.tags?.length ? fullNovel.tags.join(' / ') : '未设置',
      },
    ]
  }, [fullNovel])

  const handleAddCustomTag = useCallback(() => {
    setNovelForm((prev) => {
      const tag = prev.customTag.trim()
      if (!tag) return prev
      if (prev.tags.includes(tag)) {
        return { ...prev, customTag: '' }
      }
      return { ...prev, tags: [...prev.tags, tag], customTag: '' }
    })
  }, [])

  const handleCreateNovelSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: NovelCreationPayload = {
      title: novelForm.title.trim(),
      description: novelForm.description.trim(),
      genre: novelForm.genre,
      tags: Array.from(new Set(novelForm.tags.map((tag) => tag.trim()).filter(Boolean))),
    }
    await createNovel(payload)
  }

  const handleCreateChapterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await createChapter({
      title: chapterForm.title.trim(),
      content: chapterForm.content,
    })
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-teal-50/10 text-foreground">
      <aside className="hidden h-screen w-20 flex-col border-r border-border/40 bg-white/80 backdrop-blur-xl p-4 lg:flex shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-600 shadow-card">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <nav className="mt-10 flex flex-1 flex-col gap-3">
          {NAVIGATION.map((item) => {
            const active = navView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setNavView(item.id)
                  if (item.id !== 'workspace') {
                    setAssistantTool(null)
                  }
                }}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs transition-all duration-200',
                  active
                    ? 'bg-gradient-to-br from-primary to-teal-600 text-white shadow-card'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 overflow-hidden">
        {navView === 'library' ? (
          <LibraryBoard
            novels={novels}
            onSelect={(novelId) => {
              setSelectedNovelId(novelId)
              setNavView('workspace')
            }}
            onCreate={() => setNovelDialogOpen(true)}
            onRename={handleRenameNovel}
            onDelete={handleDeleteNovel}
          />
        ) : navView === 'resources' ? (
          <ResourceCenter
            novels={novels}
            selectedNovelId={selectedNovelId}
            onSelectNovel={(novelId) => setSelectedNovelId(novelId)}
            novelDetail={fullNovel ? {
              ...fullNovel,
              chapters: fullNovel.chapters.map(ch => ({
                ...ch,
                updatedAt: ch.updatedAt ?? new Date().toISOString()
              }))
            } : undefined}
            onOpenTool={(toolId) => {
              handleAssistantClick(
                TOOL_DEFINITIONS.find((tool) => tool.id === toolId as AssistantTool) ??
                  TOOL_DEFINITIONS[0]
              )
            }}
          />
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <ChapterNavigator
              novels={novels}
              selectedNovelId={selectedNovelId}
              onSelectNovel={(novelId) => setSelectedNovelId(novelId)}
              onCreateNovel={() => setNovelDialogOpen(true)}
              onRenameNovel={handleRenameNovel}
              onDeleteNovel={handleDeleteNovel}
              onOpenLibrary={() => setNavView('library')}
              chapters={chapters}
              activeChapterId={selectedChapterId}
              onSelectChapter={(chapterId) => {
                setSelectedChapterId(chapterId)
                setAssistantTool(null)
              }}
              onCreateChapter={() => setChapterDialogOpen(true)}
              onOpenReorder={openReorderDialog}
              onDeleteChapter={handleDeleteChapter}
              novelStats={
                fullNovel
                  ? {
                      status: fullNovel.status,
                      wordCount: fullNovel.wordCount,
                      chapterCount: fullNovel.chapterCount,
                      tags: fullNovel.tags,
                    }
                  : undefined
              }
            />
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="border-b border-border/40 bg-white/80 backdrop-blur-xl px-6 py-6 shadow-soft">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">写作工作台</span>
                      </div>
                      <h1 className="text-3xl font-black tracking-tight">
                        {fullNovel ? fullNovel.title : '开始创作你的故事'}
                      </h1>
                      <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
                        点击下方工具条可唤起不同的 AI 助手。默认保留一整块清爽的创作区域，专注于当前章节的内容。
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => exportNovel('text')}
                        disabled={!fullNovel || exporting}
                        className="rounded-xl border-2 hover-glow font-semibold"
                      >
                        {exporting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            正在导出
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            导出 TXT
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => exportNovel('markdown')}
                        disabled={!fullNovel || exporting}
                        className="rounded-xl border-2 hover-glow font-semibold"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        导出 Markdown
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setChapterDialogOpen(true)}
                        disabled={!selectedNovelId}
                        className="rounded-xl border-2 hover-glow font-semibold"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        新建章节
                      </Button>
                      <Button
                        onClick={() => setNovelDialogOpen(true)}
                        className="btn-primary rounded-xl px-6 text-primary-foreground font-bold"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        新建作品
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {workspaceBadges ? (
                      workspaceBadges.map((item) => (
                        <div
                          key={item.label}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10"
                        >
                          <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                          <span className="text-xs font-bold text-primary">{item.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        选择或创建作品后，将展示字数、章节等核心信息。
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {TOOL_DEFINITIONS.map((tool) => {
                      const active = assistantTool === tool.id && assistantOpen
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => handleAssistantClick(tool)}
                          className={cn(
                            'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                            active
                              ? 'bg-gradient-to-br from-primary to-teal-600 text-white shadow-card'
                              : 'bg-white/80 border border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 shadow-soft'
                          )}
                        >
                          <tool.icon className="h-4 w-4" />
                          {tool.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-col gap-3 xl:hidden">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select
                        value={selectedNovelId}
                        onValueChange={(value) => setSelectedNovelId(value)}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-2">
                          <SelectValue placeholder="选择作品" />
                        </SelectTrigger>
                        <SelectContent>
                          {novels.map((novel) => (
                            <SelectItem key={novel.id} value={novel.id}>
                              {novel.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedChapterId}
                        onValueChange={(value) => setSelectedChapterId(value)}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-2">
                          <SelectValue placeholder="选择章节" />
                        </SelectTrigger>
                        <SelectContent>
                          {chapters.map((chapter, index) => (
                            <SelectItem key={chapter.id} value={chapter.id}>
                              第{index + 1}章 {chapter.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setNavView('library')}
                        className="flex-1 rounded-xl border-2"
                      >
                        查看作品库
                      </Button>
                      <Button
                        variant="outline"
                        onClick={openReorderDialog}
                        disabled={!chapters.length}
                        className="flex-1 rounded-xl border-2"
                      >
                        调整章节顺序
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto px-6 pb-12">
                {selectedNovelId && selectedChapterId ? (
                  <ChapterComposer
                    novelId={selectedNovelId}
                    chapterId={selectedChapterId}
                    onSaved={handleChapterSaved}
                  />
                ) : selectedNovelId ? (
                  <div className="flex h-full items-center justify-center rounded-3xl border-2 border-dashed border-border/50 bg-card/40 p-16 text-center">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">请选择左侧的章节以开始写作</h2>
                      <p className="text-sm text-muted-foreground">
                        如果尚未创建章节，可以点击上方的「新建章节」按钮，或使用 AI 工具生成大纲后再细化内容。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl border-2 border-dashed border-border/50 bg-card/40 p-16 text-center">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">尚未选择作品</h2>
                      <p className="text-sm text-muted-foreground">
                        打开作品库选择一个作品，或直接点击「新建作品」快速开始。
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => setNovelDialogOpen(true)} className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                          新建作品
                        </Button>
                        <Button variant="outline" onClick={() => setNavView('library')} className="rounded-xl border-2">
                          浏览作品库
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>

            <aside
              className={cn(
                'hidden w-[420px] overflow-y-auto border-l border-border/60 bg-card/60 p-6 transition-transform duration-300 lg:block',
                assistantOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'
              )}
            >
              {assistantPanel}
            </aside>
          </div>
        )}
      </div>

      <Dialog open={novelDialogOpen} onOpenChange={setNovelDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>新建作品</DialogTitle>
            <DialogDescription>预设的类型与标签可直接使用，后续仍可在作品设置中调整。</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNovelSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>作品标题 *</Label>
              <Input
                value={novelForm.title}
                onChange={(event) => setNovelForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="例如：星际旅人的回响"
                required
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label>一句话简介</Label>
              <Textarea
                value={novelForm.description}
                onChange={(event) =>
                  setNovelForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={3}
                placeholder="概述故事的核心冲突、人物与世界观"
                className="rounded-xl border-2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>预设类型</Label>
                <Select
                  value={novelForm.genre}
                  onValueChange={(value) => setNovelForm((prev) => ({ ...prev, genre: value }))}
                >
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRE_PRESETS.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>自定义标签</Label>
                <div className="flex gap-2">
                  <Input
                    value={novelForm.customTag}
                    onChange={(event) => setNovelForm((prev) => ({ ...prev, customTag: event.target.value }))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleAddCustomTag()
                      }
                    }}
                    placeholder="输入后按回车添加"
                    className="rounded-xl border-2"
                  />
                  <Button type="button" variant="outline" onClick={handleAddCustomTag} className="rounded-xl border-2">
                    添加
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>推荐标签</Label>
              <ToggleGroup
                type="multiple"
                value={novelForm.tags}
                onValueChange={(values) => setNovelForm((prev) => ({ ...prev, tags: values }))}
                className="flex flex-wrap gap-2"
              >
                {TAG_PRESETS.map((tag) => (
                  <ToggleGroupItem
                    key={tag}
                    value={tag}
                    className="rounded-full border-2 px-4 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {tag}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {novelForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  已选择：
                  {novelForm.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full border-2 px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNovelDialogOpen(false)
                  setNovelForm({
                    title: '',
                    description: '',
                    genre: GENRE_PRESETS[0],
                    tags: [],
                    customTag: '',
                  })
                }}
                className="rounded-xl border-2"
              >
                取消
              </Button>
              <Button type="submit" disabled={creatingNovel} className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                {creatingNovel ? '创建中…' : '创建作品'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建章节</DialogTitle>
            <DialogDescription>为当前作品添加一个新的章节，稍后随时可在写作区域继续完善。</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateChapterSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>章节标题 *</Label>
              <Input
                value={chapterForm.title}
                onChange={(event) => setChapterForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="例如：第1章 星港重逢"
                required
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label>章节初稿（可选）</Label>
              <Textarea
                value={chapterForm.content}
                onChange={(event) => setChapterForm((prev) => ({ ...prev, content: event.target.value }))}
                rows={6}
                placeholder="可以先写一个大致框架，稍后回到编辑器继续创作。"
                className="rounded-xl border-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setChapterDialogOpen(false)
                  setChapterForm({ title: '', content: '' })
                }}
                className="rounded-xl border-2"
              >
                取消
              </Button>
              <Button type="submit" disabled={creatingChapter} className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                {creatingChapter ? '创建中…' : '创建章节'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>章节顺序管理</DialogTitle>
            <DialogDescription>拖拽章节卡片调整顺序，保存后立即同步至写作工作台。</DialogDescription>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-80">
            <Reorder.Group axis="y" values={reorderDraft} onReorder={setReorderDraft} className="space-y-3">
              {reorderDraft.map((chapter, index) => (
                <Reorder.Item
                  key={chapter.id}
                  value={chapter}
                  className="flex cursor-grab items-center justify-between rounded-xl border border-border/60 bg-card/80 p-3 text-sm text-foreground shadow-sm transition hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{chapter.title}</p>
                      <p className="text-xs text-muted-foreground">{chapter.wordCount.toLocaleString()} 字</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-[10px]">
                    {statusLabel(chapter.status)}
                  </Badge>
                </Reorder.Item>
              ))}
              {reorderDraft.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
                  当前作品还没有章节，创建后即可在此重排。
                </div>
              )}
            </Reorder.Group>
          </ScrollArea>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsReorderDialogOpen(false)} className="rounded-xl border-2">
              取消
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsReorderDialogOpen(false)
                void handleReorderChapters(reorderDraft.map((chapter) => chapter.id))
              }}
              className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              保存顺序
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function statusLabel(status: string) {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'writing':
      return '创作中'
    case 'completed':
      return '已完结'
    case 'published':
      return '已发布'
    default:
      return status
  }
}
