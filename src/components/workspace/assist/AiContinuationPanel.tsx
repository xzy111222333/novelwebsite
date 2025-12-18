'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, PencilLine, PlusCircle, Sparkles } from 'lucide-react'

interface AiContinuationPanelProps {
  chapterId?: string
  onChapterUpdated?: () => void
}

export function AiContinuationPanel({ chapterId, onChapterUpdated }: AiContinuationPanelProps) {
  const { toast } = useToast()
  const [seed, setSeed] = useState('')
  const [direction, setDirection] = useState('')
  const [length, setLength] = useState('600')
  const [suggestion, setSuggestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const canGenerate = seed.trim().length > 0

  const loadDefaultSeed = useCallback(async () => {
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
      const content: string = data.chapter.content ?? ''
      if (!content.trim()) {
        toast({ description: '当前章节为空，请先写入开头再尝试续写', variant: 'destructive' })
        return
      }
      const tail = content.trim().slice(-800)
      setSeed(tail)
      toast({ description: '已提取末段内容作为续写依据' })
    } catch (error) {
      console.error(error)
      toast({ description: error instanceof Error ? error.message : '加载章节失败', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [chapterId, toast])

  useEffect(() => {
    setSuggestion('')
  }, [seed, direction, length])

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      toast({ description: '请提供一个续写的起始段落', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/continue-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: seed,
          context: undefined,
          style: undefined,
          direction,
          length: Number(length) || 600,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '续写失败')
      }
      setSuggestion(data.content)
      toast({ description: '续写建议已生成' })
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '续写失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [canGenerate, direction, length, seed, toast])

  const handleAppend = useCallback(async () => {
    if (!chapterId) {
      toast({ description: '请先选择一个章节', variant: 'destructive' })
      return
    }
    if (!suggestion.trim()) {
      toast({ description: '暂无可追加的续写内容', variant: 'destructive' })
      return
    }
    setIsApplying(true)
    try {
      const response = await fetch(`/api/chapters/${chapterId}`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取章节内容失败')
      }
      const base: string = data.chapter.content ?? ''
      const merged = base ? `${base.trim()}\n\n${suggestion}` : suggestion
      const update = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: merged }),
      })
      const updateData = await update.json()
      if (!update.ok || !updateData.success) {
        throw new Error(updateData.error || '保存续写失败')
      }
      toast({ description: '续写内容已追加到章节末尾' })
      onChapterUpdated?.()
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '保存续写失败',
        variant: 'destructive',
      })
    } finally {
      setIsApplying(false)
    }
  }, [chapterId, onChapterUpdated, suggestion, toast])

  const helperText = useMemo(() => {
    if (!suggestion) {
      return '可选取章节末段作为种子段落，给出续写方向，生成自然衔接的新内容。'
    }
    return '请检查续写逻辑后再应用到章节中，可继续生成不同版本。'
  }, [suggestion])

  return (
    <Card className="border border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <PencilLine className="h-5 w-5 text-primary" />
              AI 续写正文
            </CardTitle>
            <CardDescription>{helperText}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDefaultSeed}
            disabled={!chapterId || isLoading}
            className="rounded-xl border-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">提取章节末段</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>续写种子段 *</Label>
          <Textarea
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            rows={6}
            placeholder="粘贴章节末端的最近一段内容，用于保持衔接与语气一致。"
            className="rounded-xl border-2"
          />
        </div>
        <div className="space-y-2">
          <Label>续写方向（可选）</Label>
          <Textarea
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
            rows={3}
            placeholder="说明接下来需要发生的事件、情绪或者伏笔。例：揭露旧友加入敌对的理由，并加入星港环境描写。"
            className="rounded-xl border-2"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>续写字数</Label>
            <Input
              value={length}
              onChange={(event) => setLength(event.target.value)}
              className="rounded-xl border-2"
              placeholder="例如 600"
            />
          </div>
          <div className="space-y-2 text-xs text-muted-foreground leading-5">
            <Label className="text-xs text-muted-foreground">提示</Label>
            <p>建议长度 400-800 字，更容易和原文衔接；可多次生成挑选最佳版本。</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在续写
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成续写建议
              </>
            )}
          </Button>
        </div>

        {suggestion && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                  AI 续写结果
                </Badge>
                <span className="text-xs text-muted-foreground">检查逻辑后可一键追加到章节</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(suggestion)
                      toast({ description: '续写内容已复制' })
                    } catch (error) {
                      console.error(error)
                      toast({ description: '复制失败，请手动选择文本', variant: 'destructive' })
                    }
                  }}
                  className="rounded-xl border-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  复制内容
                </Button>
                <Button
                  size="sm"
                  onClick={handleAppend}
                  disabled={!chapterId || isApplying}
                  className="rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      应用中
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      追加到当前章节
                    </>
                  )}
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[420px] rounded-2xl border border-border/70 bg-card/70 p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{suggestion}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

