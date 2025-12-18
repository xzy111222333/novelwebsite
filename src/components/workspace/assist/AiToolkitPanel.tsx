'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ReactNode } from 'react'
import { Compass, Library, PenLine, Sparkles, Wand2 } from 'lucide-react'

interface AiToolkitPanelProps {
  onSelectTool: (tool: string) => void
  onNavigate?: (view: 'workspace' | 'library' | 'resources') => void
  novelId?: string
}

interface QuickAction {
  label: string
  description: string
  icon: ReactNode
  onClick: () => void
}

export function AiToolkitPanel({ onSelectTool, onNavigate, novelId }: AiToolkitPanelProps) {
  const actions: QuickAction[] = [
    {
      label: '世界观构建工作室',
      description: '生成文明设定、势力结构与地理背景，整理你的世界观素材。',
      icon: <Wand2 className="h-4 w-4 text-primary" />,
      onClick: () => onNavigate?.('resources'),
    },
    {
      label: '章节概览面板',
      description: '回顾所有章节的节奏与进度，评估剧情结构是否平衡。',
      icon: <Library className="h-4 w-4 text-primary" />,
      onClick: () => onNavigate?.('resources'),
    },
    {
      label: '灵感提示库',
      description: '查看预设提纲与灵感模板，快速搭建章节骨架。',
      icon: <Compass className="h-4 w-4 text-primary" />,
      onClick: () => onSelectTool('ai-write'),
    },
  ]

  return (
    <Card className="border border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          更多 AI 工具
        </CardTitle>
        <CardDescription>
          集成常用写作增强功能、世界观构建入口与灵感资源，帮助你打造自己的创作工作流。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">快速跳转</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <div key={action.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {action.icon}
                      {action.label}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground leading-5">
                      {action.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={action.onClick} className="rounded-xl border-2">
                    打开
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">推荐写作流程</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <WorkflowStep
              index={1}
              title="梳理章节结构"
              description="使用「章纲生成」快速列出章节节点，再到写作工作台完善细节。"
              onClick={() => onSelectTool('outline')}
            />
            <WorkflowStep
              index={2}
              title="塑造关键角色"
              description="通过角色工作室生成角色档案，统一性格、目标与成长线。"
              onClick={() => onSelectTool('character')}
            />
            <WorkflowStep
              index={3}
              title="扩写与润色"
              description="结合 AI 续写与润色助手，保持语气一致并提升文字质量。"
              onClick={() => onSelectTool('ai-expand')}
            />
            <WorkflowStep
              index={4}
              title="拆书复盘"
              description="定期使用拆书解析与审稿助手，及时发现节奏或人物问题。"
              onClick={() => onSelectTool('world')}
            />
          </div>
        </div>

        {novelId ? (
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full border-2 px-3 py-1 text-xs">
                提示
              </Badge>
              <p className="text-xs text-muted-foreground leading-4">
                当前作品 ID：{novelId}。所有 AI 生成的角色、大纲与世界观都会自动挂载到该作品下，便于后续整理。
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
            请选择作品后，AI 工具可自动保存生成的档案与资料。
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface WorkflowStepProps {
  index: number
  title: string
  description: string
  onClick: () => void
}

function WorkflowStep({ index, title, description, onClick }: WorkflowStepProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {index}
          </span>
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClick} className="rounded-xl">
          <PenLine className="mr-2 h-4 w-4" />
          使用工具
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground leading-5">{description}</p>
    </div>
  )
}

