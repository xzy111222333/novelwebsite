'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface NovelOverviewProps {
  novel?: {
    id: string
    title: string
    description?: string | null
    genre?: string | null
    status: string
    wordCount: number
    chapterCount: number
    tags?: string[]
    characters: Array<{
      id: string
      name: string
      description: string
      personality?: string | null
    }>
    chapters: Array<{
      id: string
      title: string
      wordCount: number
      status: string
      updatedAt: string
    }>
    outlines: Array<{
      id: string
      title: string
      content: string
      order: number
    }>
    worldBuilding?: {
      id: string
      title: string
      content: string
      type: string
    } | null
  }
}

export function NovelOverview({ novel }: NovelOverviewProps) {
  const stats = useMemo(() => {
    if (!novel) {
      return []
    }
    return [
      { label: '作品状态', value: statusLabel(novel.status) },
      { label: '总章节', value: `${novel.chapterCount} 章` },
      { label: '总字数', value: `${novel.wordCount} 字` },
      { label: '角色数量', value: `${novel.characters.length} 个` },
    ]
  }, [novel])

  if (!novel) {
    return (
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5 p-16 text-center rounded-3xl shadow-soft">
        <p className="text-base text-muted-foreground font-medium">请选择一个作品以查看全局概览。</p>
      </Card>
    )
  }

  return (
    <Card className="border border-border/40 bg-white/90 backdrop-blur-sm rounded-3xl shadow-card">
      <CardHeader className="pb-6 px-8 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">{novel.title}</CardTitle>
            {novel.description && (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed font-medium">
                {novel.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(novel.tags || []).map((tag) => (
              <div key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 px-8 pb-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-gradient-to-br from-primary/5 to-teal-50/50 border border-primary/10 p-5 shadow-soft">
              <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
              <p className="mt-3 text-2xl font-black text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="chapters" className="w-full">
          <TabsList className="bg-primary/5 border border-primary/10 rounded-xl p-1">
            <TabsTrigger value="chapters" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-soft">章节概览</TabsTrigger>
            <TabsTrigger value="characters" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-soft">角色档案</TabsTrigger>
            <TabsTrigger value="outlines" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-soft">故事大纲</TabsTrigger>
            <TabsTrigger value="world" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-soft">世界观</TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="mt-6">
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead className="font-semibold">章节标题</TableHead>
                    <TableHead className="font-semibold">字数</TableHead>
                    <TableHead className="font-semibold">状态</TableHead>
                    <TableHead className="font-semibold">最近更新</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {novel.chapters.map((chapter) => (
                    <TableRow key={chapter.id}>
                      <TableCell className="font-medium">{chapter.title}</TableCell>
                      <TableCell>{chapter.wordCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-2">
                          {statusLabel(chapter.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(chapter.updatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {novel.chapters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-16 text-center text-base text-muted-foreground">
                        暂无章节
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <ScrollArea className="max-h-[420px] rounded-xl border border-border p-5">
              <div className="space-y-4">
                {novel.characters.map((character) => (
                  <div key={character.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-base font-semibold text-foreground">{character.name}</p>
                      <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-2">角色档案</Badge>
                    </div>
                    <Separator className="mb-4" />
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {character.description}
                    </p>
                  </div>
                ))}
                {novel.characters.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                    <p className="text-sm text-muted-foreground">暂无角色设定，前往角色工作室生成并保存。</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="outlines" className="mt-6">
            <ScrollArea className="max-h-[420px] rounded-xl border border-border p-5">
              <div className="space-y-4">
                {novel.outlines.map((outline) => (
                  <div key={outline.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-base font-semibold text-foreground">
                        {outline.order}. {outline.title}
                      </p>
                      <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-2">大纲</Badge>
                    </div>
                    <Separator className="mb-4" />
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {outline.content}
                    </p>
                  </div>
                ))}
                {novel.outlines.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                    <p className="text-sm text-muted-foreground">暂无故事大纲，使用故事大纲工作室生成并保存。</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="world" className="mt-6">
            {novel.worldBuilding ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-bold text-foreground tracking-tight">{novel.worldBuilding.title}</p>
                  <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-2">{novel.worldBuilding.type}</Badge>
                </div>
                <Separator className="mb-5" />
                <ScrollArea className="max-h-[380px]">
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {novel.worldBuilding.content}
                  </p>
                </ScrollArea>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                <p className="text-sm text-muted-foreground">暂无世界观设定，使用世界观工作室生成并保存。</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function statusLabel(status: string) {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'writing':
      return '写作中'
    case 'completed':
      return '已完成'
    case 'published':
      return '已发布'
    default:
      return status
  }
}


