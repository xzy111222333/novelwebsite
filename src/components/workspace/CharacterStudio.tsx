'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CharacterStudioProps {
  novelId?: string
  onCreated?: () => void
}

export function CharacterStudio({ novelId, onCreated }: CharacterStudioProps) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    role: '',
    personality: '',
    background: '',
    storyContext: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('生成角色失败')
      }

      const data = await response.json()
      if (data.success) {
        setResult(data.character)
        toast({ description: '角色设定生成完成' })
      } else {
        throw new Error(data.error || '生成角色失败')
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '角色生成失败',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!novelId) {
      toast({
        variant: 'destructive',
        description: '请先选择一个项目',
      })
      return
    }

    if (!result) {
      toast({
        variant: 'destructive',
        description: '请先生成角色设定',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId,
          name: form.name || '未命名角色',
          description: result,
          personality: form.personality,
          background: form.background,
        }),
      })

      if (!response.ok) {
        throw new Error('保存角色失败')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || '保存角色失败')
      }

      toast({ description: '角色已保存到角色库' })
      onCreated?.()
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '角色保存失败',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border border-border bg-card rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">角色创作助手</span>
          <Badge variant="outline" className="text-sm px-3 py-1 rounded-full border-2">AI</Badge>
        </CardTitle>
      </CardHeader>
      <Separator className="mx-6" />
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">角色姓名</Label>
            <Input
              value={form.name}
              placeholder="例如：林语柔"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">角色定位</Label>
            <Input
              value={form.role}
              placeholder="主角 / 反派 / 配角"
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">性格特征</Label>
            <Textarea
              value={form.personality}
              placeholder="描述角色的性格、优点、缺点"
              rows={3}
              onChange={(event) => setForm({ ...form, personality: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">背景设定</Label>
            <Textarea
              value={form.background}
              placeholder="成长经历、家庭背景、重要事件"
              rows={3}
              onChange={(event) => setForm({ ...form, background: event.target.value })}
              className="rounded-xl border-2"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">故事背景</Label>
            <Textarea
              value={form.storyContext}
              placeholder="故事的大世界观，帮助 AI 更好理解"
              rows={3}
              onChange={(event) => setForm({ ...form, storyContext: event.target.value })}
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
                生成角色设定
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || !result}
            className="rounded-xl border-2 font-medium"
          >
            {isSaving ? '保存中...' : '保存到角色库'}
          </Button>
        </div>

        {result && (
          <ScrollArea className="max-h-[360px] rounded-xl border-2 border-border bg-card p-5 text-sm leading-relaxed">
            <pre className="whitespace-pre-wrap font-sans text-foreground">{result}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}


