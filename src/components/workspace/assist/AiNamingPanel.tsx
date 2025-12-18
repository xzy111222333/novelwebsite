'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Copy, Loader2, Sparkles } from 'lucide-react'

interface NamingSuggestion {
  name: string
  meaning: string
}

interface AiNamingPanelProps {
  novelId?: string
}

export function AiNamingPanel({ novelId }: AiNamingPanelProps) {
  const { toast } = useToast()
  const [type, setType] = useState<'character' | 'organization' | 'location' | 'artifact'>('character')
  const [gender, setGender] = useState<'any' | 'male' | 'female'>('any')
  const [style, setStyle] = useState<'classical' | 'modern' | 'fantasy' | 'mystery'>('classical')
  const [keywords, setKeywords] = useState('')
  const [background, setBackground] = useState('')
  const [suggestions, setSuggestions] = useState<NamingSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!keywords.trim() && !background.trim()) {
      toast({ description: '请至少提供关键词或背景描述', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/naming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          gender,
          style,
          keywords,
          background,
          novelId,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '生成名称失败')
      }
      setSuggestions(data.suggestions)
      toast({ description: '已生成命名方案' })
    } catch (error) {
      console.error(error)
      toast({
        description: error instanceof Error ? error.message : '生成名称失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [background, gender, keywords, novelId, style, toast, type])

  const handleCopy = useCallback(async (suggestion: NamingSuggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.name)
      toast({ description: `已复制名称「${suggestion.name}」` })
    } catch (error) {
      console.error(error)
      toast({ description: '复制失败，请手动选择文本', variant: 'destructive' })
    }
  }, [toast])

  return (
    <Card className="border border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 起名助手
          </CardTitle>
          <CardDescription>
            根据角色定位、风格偏好与关键词生成一组富有意境的名称，并附带含义说明。
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>命名对象</Label>
            <Select value={type} onValueChange={(value: typeof type) => setType(value)}>
              <SelectTrigger className="rounded-xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="character">角色</SelectItem>
                <SelectItem value="organization">组织势力</SelectItem>
                <SelectItem value="location">地点场景</SelectItem>
                <SelectItem value="artifact">道具 / 圣物</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>性别倾向</Label>
            <Select value={gender} onValueChange={(value: typeof gender) => setGender(value)}>
              <SelectTrigger className="rounded-xl border-2" disabled={type !== 'character'}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">不限</SelectItem>
                <SelectItem value="male">偏男性</SelectItem>
                <SelectItem value="female">偏女性</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>风格偏好</Label>
            <Select value={style} onValueChange={(value: typeof style) => setStyle(value)}>
              <SelectTrigger className="rounded-xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classical">古风雅致</SelectItem>
                <SelectItem value="modern">现代简洁</SelectItem>
                <SelectItem value="fantasy">奇幻浪漫</SelectItem>
                <SelectItem value="mystery">悬疑冷冽</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>关键词 *</Label>
            <Input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              className="rounded-xl border-2"
              placeholder="古筝、星海、守护者..."
            />
          </div>
          <div className="space-y-2">
            <Label>背景设定（可选）</Label>
            <Textarea
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              rows={3}
              className="rounded-xl border-2"
              placeholder="角色身份、阵营、性格，或地点的历史与氛围..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在生成
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成命名方案
              </>
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <ScrollArea className="max-h-[420px] rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.name} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                        {suggestion.name}
                      </Badge>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">命名建议</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(suggestion)} className="rounded-xl border-2">
                      <Copy className="mr-2 h-4 w-4" />
                      复制
                    </Button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground whitespace-pre-wrap">
                    {suggestion.meaning}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

