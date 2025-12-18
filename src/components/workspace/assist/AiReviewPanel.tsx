'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ClipboardCheck, Loader2, RefreshCw } from 'lucide-react'

interface AiReviewPanelProps {
  chapterId?: string
  onChapterUpdated?: () => void
}

interface ReviewResponse {
  strengths: string[]
  issues: string[]
  suggestions: string[]
  scoring?: {
    plot: number
    character: number
    style: number
  }
}

const FOCUS_OPTIONS = [
  { value: 'plot', label: '剧情逻辑' },
  { value: 'character', label: '人物塑造' },
  { value: 'style', label: '语言风格' },
  { value: 'pacing', label: '节奏节拍' },
]

export function AiReviewPanel({ chapterId }: AiReviewPanelProps) {
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [focus, setFocus] = useState<string[]>(['plot', 'character', 'style'])
  const [analysis, setAnalysis] = useState<ReviewResponse>()
  const [isLoading, setIsLoading] = useState(false)

  const loadChapter = useCallback(async () => {
    if (!chapterId) {
      toast({ description: '请先选择一个章节', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chapters/${chapterId}`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取章节失败')
      }
      setContent(data.chapter.content ?? '')
      toast({ description: '已加载章节正文' })
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '加载章节失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [chapterId, toast])

  const handleReview = useCallback(async () => {
    if (!content.trim()) {
      toast({ description: '请粘贴需要审稿的正文内容', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          focus,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '审稿失败')
      }
      setAnalysis(data.review)
      toast({ description: '已生成审稿报告' })
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '审稿失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [content, focus, toast])

  return (
    <Card className="border border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              AI 审稿助手
            </CardTitle>
            <CardDescription>
              针对剧情逻辑、人物塑造与语言风格给出可执行的改进建议，辅助章节打磨。
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadChapter} disabled={!chapterId || isLoading} className="rounded-xl border-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">载入当前章节</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>正文内容 *</Label>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            placeholder="粘贴章节内容或任意需要审稿的文本..."
            className="rounded-xl border-2"
          />
        </div>
        <div className="space-y-2">
          <Label>重点关注</Label>
          <ToggleGroup
            type="multiple"
            value={focus}
            onValueChange={(values) => values.length ? setFocus(values) : null}
            className="flex flex-wrap gap-2"
          >
            {FOCUS_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="rounded-full border-2 px-3 py-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleReview}
            disabled={isLoading}
            className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在审稿
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                生成审稿意见
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-6">
            {analysis.scoring && (
              <div className="flex flex-wrap gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                {Object.entries(analysis.scoring).map(([key, score]) => (
                  <div key={key} className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-xs">
                    <p className="font-semibold text-foreground">
                      {key === 'plot' ? '剧情' : key === 'character' ? '人物' : '文风'}
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">{score}/10</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
                <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                  优势亮点
                </Badge>
                <ScrollArea className="max-h-[220px]">
                  <ul className="space-y-2 text-sm text-foreground leading-6">
                    {analysis.strengths.map((item, index) => (
                      <li key={index} className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs leading-5">
                        {item}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
                <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                  问题与风险
                </Badge>
                <ScrollArea className="max-h-[220px]">
                  <ul className="space-y-2 text-sm text-foreground leading-6">
                    {analysis.issues.map((item, index) => (
                      <li key={index} className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs leading-5 text-destructive">
                        {item}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5">
              <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                优化建议
              </Badge>
              <ScrollArea className="max-h-[220px]">
                <ol className="space-y-2 text-sm text-foreground leading-6 list-decimal list-inside">
                  {analysis.suggestions.map((item, index) => (
                    <li key={index} className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs leading-5">
                      {item}
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

