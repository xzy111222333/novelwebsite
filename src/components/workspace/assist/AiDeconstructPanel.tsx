'use client'

import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { FileSearch, Loader2, Sparkles, Workflow } from 'lucide-react'

interface ChapterSummary {
  id: string
  title: string
  content?: string | null
}

interface AiDeconstructPanelProps {
  novelId?: string
  chapterId?: string
  novelTitle?: string
  chapters?: ChapterSummary[]
}

interface DeconstructResponse {
  summary: string
  plotBeats: string[]
  characters: Array<{ name: string; insight: string }>
  themes: string[]
  suggestions: string[]
}

type SourceOption = 'chapter' | 'novel' | 'custom'

export function AiDeconstructPanel({ novelId, chapterId, novelTitle, chapters = [] }: AiDeconstructPanelProps) {
  const { toast } = useToast()
  const [source, setSource] = useState<SourceOption>('chapter')
  const [customText, setCustomText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<DeconstructResponse>()

  const activeChapter = useMemo(() => chapters.find((item) => item.id === chapterId), [chapters, chapterId])

  const getPayloadContent = useCallback(async (): Promise<string> => {
    if (source === 'custom') {
      if (!customText.trim()) {
        throw new Error('请粘贴需要解析的文本内容')
      }
      return customText
    }
    if (source === 'chapter') {
      if (!chapterId) {
        throw new Error('请先选择一个章节')
      }
      if (activeChapter?.content) {
        return activeChapter.content
      }
      const response = await fetch(`/api/chapters/${chapterId}`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取章节内容失败')
      }
      return data.chapter.content ?? ''
    }
    // novel
    if (!novelId) {
      throw new Error('请先选择作品')
    }
    const hasContent = chapters.some((chapter) => (chapter.content ?? '').trim().length > 0)
    if (hasContent) {
      return chapters
        .map((chapter, index) => `第${index + 1}章 ${chapter.title}\n${chapter.content ?? ''}`)
        .join('\n\n')
    }
    const response = await fetch(`/api/novels/${novelId}`)
    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.error || '获取作品内容失败')
    }
    const fetchedChapters: ChapterSummary[] = data.novel.chapters || []
    return fetchedChapters
      .map((chapter: ChapterSummary, index: number) => `第${index + 1}章 ${chapter.title}\n${chapter.content ?? ''}`)
      .join('\n\n')
  }, [activeChapter?.content, chapterId, chapters, customText, novelId, source])

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true)
    try {
      const content = await getPayloadContent()
      if (!content.trim()) {
        throw new Error('文本内容为空，请确认章节是否已有正文')
      }
      const response = await fetch('/api/ai/deconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          scope: source,
          title: source === 'novel' ? novelTitle : activeChapter?.title,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '解析失败')
      }
      setAnalysis(data.analysis)
      toast({ description: '已生成拆书分析' })
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '解析失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [activeChapter?.title, getPayloadContent, novelTitle, source, toast])

  return (
    <Card className="border border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Workflow className="h-5 w-5 text-primary" />
              AI 拆书解析
            </CardTitle>
            <CardDescription>
              快速梳理文本的剧情结构、人物线索与主题重点，可用于回顾章节或拆解优秀范文。
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
            {source === 'novel' ? '整本作品' : source === 'chapter' ? '当前章节' : '自定义文本'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label>解析范围</Label>
            <Select value={source} onValueChange={(value: SourceOption) => setSource(value)}>
              <SelectTrigger className="rounded-xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chapter">当前章节</SelectItem>
                <SelectItem value="novel">整本作品</SelectItem>
                <SelectItem value="custom">自定义文本</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground leading-5">
              章节模式将优先使用已选章节；整本模式会汇总所有章节正文。
            </p>
          </div>
          {source === 'custom' ? (
            <div className="space-y-2">
              <Label>自定义文本 *</Label>
              <Textarea
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                rows={7}
                placeholder="粘贴需要拆解的文本段落或章节..."
                className="rounded-xl border-2"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 p-4 text-xs text-muted-foreground leading-5">
              {source === 'chapter' ? (
                <div>
                  <p className="font-semibold text-foreground">
                    {activeChapter ? `当前章节：${activeChapter.title}` : '尚未选择章节'}
                  </p>
                  <p className="mt-2">
                    将自动读取章节末端的文本。若章节内容较长，解析时会综合整篇信息并给出重点摘要。
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-foreground">
                    整本作品：{novelTitle ?? '未命名作品'}
                  </p>
                  <p className="mt-2">
                    会整合所有章节正文，提炼出剧情节奏、角色成长线与主题表达，适合做全局梳理。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在解析
              </>
            ) : (
              <>
                <FileSearch className="mr-2 h-4 w-4" />
                生成拆书报告
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-6">
            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                  故事概览
                </Badge>
                <span className="text-xs text-muted-foreground">核心剧情总结</span>
              </div>
              <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">{analysis.summary}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                    剧情节奏
                  </Badge>
                  <span className="text-xs text-muted-foreground">关键情节点</span>
                </div>
                <Separator />
                <ol className="space-y-2 text-sm leading-6 text-foreground">
                  {analysis.plotBeats.map((beat, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                      <span>{beat}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                    角色洞察
                  </Badge>
                  <span className="text-xs text-muted-foreground">人物动机与矛盾</span>
                </div>
                <Separator />
                <div className="space-y-3 text-sm leading-6 text-foreground">
                  {analysis.characters.map((character, index) => (
                    <div key={index} className="rounded-xl border border-border/60 bg-card/70 p-3">
                      <p className="font-semibold">{character.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{character.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                    主题意象
                  </Badge>
                  <span className="text-xs text-muted-foreground">高频母题与象征</span>
                </div>
                <Separator />
                <ul className="space-y-2 text-sm text-foreground">
                  {analysis.themes.map((theme, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-[6px] h-[6px] w-[6px] rounded-full bg-primary" />
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                    写作建议
                  </Badge>
                  <span className="text-xs text-muted-foreground">待优化与可深化方向</span>
                </div>
                <Separator />
                <ul className="space-y-2 text-sm text-foreground">
                  {analysis.suggestions.map((tip, index) => (
                    <li key={index} className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs leading-5">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

