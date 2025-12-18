'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WorldStudioProps {
  novelId?: string
  onCreated?: () => void
}

export function WorldStudio({ novelId, onCreated }: WorldStudioProps) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    worldName: '',
    worldType: '',
    timePeriod: '',
    geography: '',
    technology: '',
    magic: '',
    culture: '',
    politics: '',
    religion: '',
    additional: '',
  })
  const [result, setResult] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('setting')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('生成世界观失败')
      }

      const data = await response.json()
      if (data.success) {
        setResult(data.world)
        toast({ description: '世界观设定生成完成' })
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
    if (!result) {
      toast({ variant: 'destructive', description: '请先生成世界观内容' })
      return
    }
    if (!title) {
      toast({ variant: 'destructive', description: '请为世界观命名' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId,
          title,
          type,
          content: result,
        }),
      })

      if (!response.ok) {
        throw new Error('保存世界观失败')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || '保存失败')
      }

      toast({ description: '世界观设定已保存' })
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
          <span className="text-xl font-bold tracking-tight">世界观工作室</span>
          <Badge variant="outline" className="text-sm px-3 py-1 rounded-full border-2">AI</Badge>
        </CardTitle>
      </CardHeader>
      <Separator className="mx-6" />
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">世界名称</Label>
              <Input
                value={form.worldName}
                placeholder="如：星海之境"
                onChange={(event) => setForm({ ...form, worldName: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">世界类型</Label>
              <Input
                value={form.worldType}
                placeholder="奇幻 / 科幻 / 城市 等"
                onChange={(event) => setForm({ ...form, worldType: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">时代背景</Label>
            <Input
              value={form.timePeriod}
              placeholder="未来 / 中世纪 / 现代..."
              onChange={(event) => setForm({ ...form, timePeriod: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">地理环境</Label>
            <Textarea
              value={form.geography}
              rows={3}
              placeholder="描述大陆、城市、气候等"
              onChange={(event) => setForm({ ...form, geography: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">科技水平</Label>
              <Textarea
                value={form.technology}
                rows={2}
                onChange={(event) => setForm({ ...form, technology: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">魔法体系</Label>
              <Textarea
                value={form.magic}
                rows={2}
                onChange={(event) => setForm({ ...form, magic: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">文化特色</Label>
              <Textarea
                value={form.culture}
                rows={2}
                onChange={(event) => setForm({ ...form, culture: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">政治体系</Label>
              <Textarea
                value={form.politics}
                rows={2}
                onChange={(event) => setForm({ ...form, politics: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">宗教信仰</Label>
              <Textarea
                value={form.religion}
                rows={2}
                onChange={(event) => setForm({ ...form, religion: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">其他补充</Label>
              <Textarea
                value={form.additional}
                rows={2}
                onChange={(event) => setForm({ ...form, additional: event.target.value })}
                className="rounded-xl border-2"
              />
            </div>
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
                生成世界观设定
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isSaving || !result} className="rounded-xl border-2 font-medium">
            {isSaving ? '保存中...' : '保存世界观'}
          </Button>
        </div>

        <div className="grid gap-4 rounded-xl border border-border bg-secondary/20 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">世界观标题 *</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-xl border-2" />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">归类</Label>
              <Input
                value={type}
                onChange={(event) => setType(event.target.value)}
                placeholder="setting / history / culture"
                className="rounded-xl border-2"
              />
            </div>
          </div>
          {result && (
            <ScrollArea className="max-h-[360px] rounded-xl border-2 border-border bg-card p-5 text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap font-sans text-foreground">{result}</pre>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


