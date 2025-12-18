'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Copy, Loader2, Wand2, RefreshCw, Sparkles, Upload } from 'lucide-react'

const MODE_OPTIONS = [
  { value: 'polish', label: '润色字句' },
  { value: 'expand', label: '扩写细节' },
  { value: 'tighten', label: '精简句段' },
  { value: 'dialogue', label: '优化对话' },
]

const FOCUS_OPTIONS = [
  { value: 'narrative', label: '叙事节奏' },
  { value: 'emotion', label: '情感表达' },
  { value: 'atmosphere', label: '氛围描写' },
  { value: 'character', label: '人物刻画' },
]

interface AiRefinePanelProps {
  chapterId?: string
  onChapterUpdated?: () => void
}

interface RefineResponse {
  refined: string
  notes?: string[]
}

export function AiRefinePanel({ chapterId, onChapterUpdated }: AiRefinePanelProps) {
  const { toast } = useToast()
  const [source, setSource] = useState('')
  const [mode, setMode] = useState<string>('polish')
  const [focus, setFocus] = useState<string[]>(['narrative', 'emotion'])
  const [instructions, setInstructions] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [result, setResult] = useState<RefineResponse>()

  const loadCurrentChapter = useCallback(async () => {
    if (!chapterId) {
      toast({ description: '请先选择一个章节', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chapters/${chapterId}`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取章节内容失败')
      }
      setSource(data.chapter.content ?? '')
      toast({ description: '已加载当前章节内容' })
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

  useEffect(() => {
    setResult(undefined)
  }, [mode, focus.join(','), instructions])

  const handleRefine = useCallback(async () => {
    if (!source.trim()) {
      toast({ description: '请粘贴需要润色的原文', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: source,
          mode,
          focus,
          instructions,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '润色失败')
      }
      setResult({ refined: data.refined, notes: data.notes })
      toast({ description: '润色完成，已生成优化版本' })
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '润色失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [focus, instructions, mode, source, toast])

  const handleCopy = useCallback(async () => {
    if (!result?.refined) return
    try {
      await navigator.clipboard.writeText(result.refined)
      toast({ description: '优化内容已复制到剪贴板' })
    } catch (error) {
      console.error(error)
      toast({ description: '复制失败，请手动选择文本', variant: 'destructive' })
    }
  }, [result?.refined, toast])

  const handleApply = useCallback(async () => {
    if (!chapterId) {
      toast({ description: '请先选择一个章节', variant: 'destructive' })
      return
    }
    if (!result?.refined) {
      toast({ description: '没有可应用的内容', variant: 'destructive' })
      return
    }
    setIsApplying(true)
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result.refined }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '更新章节失败')
      }
      toast({ description: '章节内容已更新为优化版本' })
      onChapterUpdated?.()
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '更新章节失败',
        variant: 'destructive',
      })
    } finally {
      setIsApplying(false)
    }
  }, [chapterId, onChapterUpdated, result?.refined, toast])

  return (
    <Card className="border border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Wand2 className="h-5 w-5 text-primary" />
              AI 扩写润色
            </CardTitle>
            <CardDescription>
              自定义润色策略，让段落更有质感。可加载当前章节并一键替换。
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadCurrentChapter} disabled={!chapterId || isLoading} className="rounded-xl border-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">载入当前章节</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>原文片段 *</Label>
          <Textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            rows={8}
            placeholder="粘贴需要润色或扩写的内容，可以是段落、对话或场景描写。"
            className="rounded-xl border-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>润色策略</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="rounded-xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>补充说明（可选）</Label>
            <Textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              rows={2}
              placeholder="例如：保持女主角的犀利语气，语句要有节奏感。"
              className="rounded-xl border-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>优化重点</Label>
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
            onClick={handleRefine}
            className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在优化
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成优化版本
              </>
            )}
          </Button>
        </div>

        {result?.refined && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                  AI 优化文本
                </Badge>
                <span className="text-xs text-muted-foreground">已根据指定策略完成润色</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl border-2">
                  <Copy className="mr-2 h-4 w-4" />
                  复制内容
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!chapterId || isApplying}
                  className="rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在应用
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      替换当前章节
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <ScrollArea className="max-h-[400px] rounded-2xl border border-border/70 bg-card/70 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{result.refined}</pre>
              </ScrollArea>
              <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                  优化说明
                </p>
                <Separator />
                <ul className="space-y-2 text-xs leading-5 text-muted-foreground">
                  {result.notes && result.notes.length > 0 ? (
                    result.notes.map((note, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span>{note}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span>已根据选择的重点优化叙事节奏与情感力度。</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span>如需追加特定细节，可在说明中进一步限制写法。</span>
                      </li>
                    </>
                  )}
                </ul>
                <div className="rounded-xl border border-dashed border-border/60 p-3 text-[11px] leading-5 text-muted-foreground">
                  提示：润色后的文本会保持语义一致。如需大幅改写，可选择「扩写细节」并描述新的剧情方向。
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

