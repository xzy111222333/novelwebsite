'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface StoryOutlineStudioProps {
  novelId?: string
  onCreated?: () => void
}

export function StoryOutlineStudio({ novelId, onCreated }: StoryOutlineStudioProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [outline, setOutline] = useState('')
  const [form, setForm] = useState({
    title: '',
    genre: '',
    mainPlot: '',
    chapterCount: '20',
    style: '',
  })

  const handleGenerate = async () => {
    if (!form.title) {
      toast({ variant: 'destructive', description: '请先填写小说标题' })
      return
    }
    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          chapterCount: Number(form.chapterCount) || 20,
        }),
      })

      if (!response.ok) {
        throw new Error('生成大纲失败')
      }

      const data = await response.json()
      if (data.success) {
        setOutline(data.outline)
        toast({ description: '故事大纲生成完成' })
      } else {
        throw new Error(data.error || '生成失败')
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '生成失败',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!novelId) {
      toast({ variant: 'destructive', description: '请先选择一个项目' })
      return
    }
    if (!outline) {
      toast({ variant: 'destructive', description: '请先生成大纲内容' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/outlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId,
          title: form.title || '未命名大纲',
          content: outline,
        }),
      })

      if (!response.ok) {
        throw new Error('保存大纲失败')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || '保存失败')
      }

      toast({ description: '大纲已保存' })
      onCreated?.()
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '保存失败',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border border-border bg-card rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">故事大纲工作室</span>
          <Badge variant="outline" className="text-sm px-3 py-1 rounded-full border-2">AI</Badge>
        </CardTitle>
      </CardHeader>
      <Separator className="mx-6" />
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">小说标题 *</Label>
            <Input
              value={form.title}
              placeholder="输入小说名称"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">类型</Label>
              <Input
                value={form.genre}
                placeholder="例如：都市奇幻"
                onChange={(event) => setForm({ ...form, genre: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">章节数</Label>
              <Input
                value={form.chapterCount}
                onChange={(event) => setForm({ ...form, chapterCount: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">主要情节</Label>
            <Textarea
              value={form.mainPlot}
              placeholder="简单描述故事主线与冲突"
              rows={3}
              onChange={(event) => setForm({ ...form, mainPlot: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">写作风格</Label>
            <Textarea
              value={form.style}
              placeholder="希望呈现的文字风格"
              rows={2}
              onChange={(event) => setForm({ ...form, style: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                正在生成
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成故事大纲
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isSaving || !outline} className="rounded-xl border-2 font-medium">
            {isSaving ? '保存中...' : '保存大纲'}
          </Button>
        </div>

        {outline && (
          <ScrollArea className="max-h-[360px] rounded-xl border-2 border-border bg-card p-5 text-sm leading-relaxed">
            <pre className="whitespace-pre-wrap font-sans text-foreground">{outline}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}


