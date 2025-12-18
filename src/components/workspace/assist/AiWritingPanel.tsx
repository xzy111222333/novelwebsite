'use client'

import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Copy,
  FilePlus2,
  Loader2,
  RefreshCw,
  Sparkles,
  Type,
} from 'lucide-react'

const GENRE_OPTIONS = [
  { value: 'fantasy', label: '奇幻玄幻' },
  { value: 'romance', label: '都市言情' },
  { value: 'scifi', label: '科幻未来' },
  { value: 'mystery', label: '悬疑推理' },
  { value: 'history', label: '历史架空' },
  { value: 'wuxia', label: '武侠仙侠' },
]

const STYLE_OPTIONS = [
  { value: 'descriptive', label: '细腻描写' },
  { value: 'dialogue', label: '对话驱动' },
  { value: 'action', label: '动作张力' },
  { value: 'emotional', label: '情感渲染' },
  { value: 'humorous', label: '幽默轻松' },
]

const LENGTH_OPTIONS = [
  { value: 'short', label: '短篇·1000-3000字' },
  { value: 'medium', label: '中篇·3000-8000字' },
  { value: 'long', label: '长篇·8000-15000字' },
]

interface AiWritingPanelProps {
  novelId?: string
  chapterId?: string
  onChapterCreated?: (chapterId: string) => void
  onChapterUpdated?: () => void
}

export function AiWritingPanel({
  novelId,
  chapterId,
  onChapterCreated,
  onChapterUpdated,
}: AiWritingPanelProps) {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState('')
  const [genre, setGenre] = useState<string>('fantasy')
  const [style, setStyle] = useState<string>('descriptive')
  const [length, setLength] = useState<string>('medium')
  const [draftTitle, setDraftTitle] = useState('AI 章节草稿')
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('append')

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState('')
  const [metadata, setMetadata] = useState<{ wordCount?: number; genre?: string; style?: string; length?: string }>()

  const canCreateChapter = Boolean(novelId && result.trim())
  const canUpdateChapter = Boolean(chapterId && result.trim())

  const helperText = useMemo(() => {
    if (!result) {
      return '输入关键词或剧情提纲，生成结构完整的章节草稿。可以指定题材、风格与篇幅。'
    }
    return '草稿生成完成，可以复制、创建新章节或应用到当前章节。'
  }, [result])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ description: '请先填写创作提示或剧情梗概', variant: 'destructive' })
      return
    }
    setIsGenerating(true)
    try {
      const response = await fetch('/api/novel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, genre, style, length }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '生成章节草稿失败')
      }
      setResult(data.content)
      setMetadata({
        wordCount: data.metadata?.wordCount,
        genre: data.metadata?.genre,
        style: data.metadata?.style,
        length: data.metadata?.length,
      })
      toast({ description: '章节草稿生成完成' })
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '生成章节草稿失败',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [genre, length, prompt, style, toast])

  const handleCopy = useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast({ description: '已复制到剪贴板' })
    } catch (error) {
      console.error(error)
      toast({ description: '复制失败，请手动选择文本', variant: 'destructive' })
    }
  }, [result, toast])

  const handleCreateChapter = useCallback(async () => {
    if (!novelId) {
      toast({ description: '请先选择一个作品', variant: 'destructive' })
      return
    }
    if (!result.trim()) {
      toast({ description: '没有可保存的内容', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    try {
      const response = await fetch(`/api/novels/${novelId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftTitle || 'AI 章节草稿',
          content: result,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '创建章节失败')
      }
      toast({ description: '草稿已保存为新章节' })
      onChapterCreated?.(data.chapter.id)
    } catch (error) {
      console.error(error)
      toast({ description: error instanceof Error ? error.message : '创建章节失败', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }, [draftTitle, novelId, onChapterCreated, result, toast])

  const handleApplyToChapter = useCallback(async () => {
    if (!chapterId) {
      toast({ description: '请先在左侧选择一个章节', variant: 'destructive' })
      return
    }
    if (!result.trim()) {
      toast({ description: '暂无可应用的内容', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    try {
      let contentToSave = result
      if (applyMode === 'append') {
        const existingResponse = await fetch(`/api/chapters/${chapterId}`)
        const chapterData = await existingResponse.json()
        if (!existingResponse.ok || !chapterData.success) {
          throw new Error(chapterData.error || '无法读取当前章节')
        }
        const previousContent = chapterData.chapter.content ?? ''
        contentToSave = previousContent ? `${previousContent.trim()}\n\n${result}` : result
      }

      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '应用内容失败')
      }
      toast({ description: applyMode === 'append' ? '已追加至当前章节' : '章节内容已更新' })
      onChapterUpdated?.()
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '更新章节失败',
      })
    } finally {
      setIsSaving(false)
    }
  }, [applyMode, chapterId, onChapterUpdated, result, toast])

  return (
    <Card className="border border-border bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 章节写作
            </CardTitle>
            <CardDescription>{helperText}</CardDescription>
          </div>
          {metadata?.wordCount && (
            <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
              约 {metadata.wordCount} 字
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-background/80 p-5">
          <div className="space-y-2">
            <Label>创作提示 *</Label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              placeholder="例如：女主角在星港重逢旧友，却发现他已加入敌对组织。需要展示情感冲突与世界观细节。"
              className="rounded-xl border-2"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>题材类型</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>写作风格</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>篇幅</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button
              onClick={handleGenerate}
              className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在生成
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成章节草稿
                </>
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">章节草稿</p>
                  <p className="text-xs text-muted-foreground">复制、保存或同步到工作区</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl border-2">
                  <Copy className="mr-2 h-4 w-4" />
                  复制内容
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateChapter}
                  disabled={!canCreateChapter || isSaving}
                  className="rounded-xl border-2"
                >
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  保存为新章节
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyToChapter}
                  disabled={!canUpdateChapter || isSaving}
                  className="rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {applyMode === 'append' ? '追加到当前章节' : '覆盖当前章节'}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
              <ScrollArea className="rounded-2xl border border-border/70 bg-card/70 p-4 max-h-[420px]">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{result}</pre>
              </ScrollArea>
              <div className="space-y-4 rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">新章节标题</Label>
                  <Input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    className="rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">应用方式</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={applyMode === 'append' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApplyMode('append')}
                      className={cn(
                        'rounded-xl border-2',
                        applyMode === 'append' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : undefined
                      )}
                    >
                      追加
                    </Button>
                    <Button
                      type="button"
                      variant={applyMode === 'replace' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApplyMode('replace')}
                      className={cn(
                        'rounded-xl border-2',
                        applyMode === 'replace' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : undefined
                      )}
                    >
                      覆盖
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-xs text-muted-foreground leading-5">
                  <p>使用建议：</p>
                  <ul className="space-y-1">
                    <li>· 生成后可以先保存为草稿，再在工作区细化润色。</li>
                    <li>· 追加模式会在章节末尾补充草稿，不影响现有内容。</li>
                    <li>· 覆盖模式会直接替换当前章节，请谨慎使用。</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

