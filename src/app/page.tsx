'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  PenTool,
  Download,
  Sparkles,
  ArrowRight,
  FileText,
  Users,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const coreFeatures = [
    {
      icon: PenTool,
      title: '写作工作台',
      description: '简洁优雅的编辑器，专注创作本身，支持章节管理和实时保存'
    },
    {
      icon: Users,
      title: '角色管理',
      description: '创建丰富的人物档案，记录关系、动机与成长轨迹'
    },
    {
      icon: FileText,
      title: '大纲规划',
      description: '结构化故事情节，把握叙事节奏，让故事层层推进'
    },
    {
      icon: Settings,
      title: '世界观设定',
      description: '构建完整的世界背景，设定历史、地理与文化规则'
    }
  ]

  const tools = [
    {
      name: '角色生成',
      description: '智能生成人物设定',
      icon: Users
    },
    {
      name: '世界构建',
      description: '完善世界观设定',
      icon: Settings
    },
    {
      name: '大纲生成',
      description: '智能故事结构规划',
      icon: FileText
    },
    {
      name: '智能续写',
      description: 'AI辅助内容创作',
      icon: PenTool
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-teal-50/20">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrollY > 10 ? "glass-effect shadow-soft" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <img src="/logo-64.png" alt="轻写" className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl shadow-card" />
              <span className="text-lg lg:text-xl font-bold text-foreground tracking-tight">
                轻写
              </span>
            </div>

            <div className="flex items-center gap-6 lg:gap-8">
              <a href="#features" className="hidden md:inline-block text-muted-foreground hover:text-primary transition-colors text-sm font-medium">功能</a>
              <a href="#tools" className="hidden md:inline-block text-muted-foreground hover:text-primary transition-colors text-sm font-medium">工具</a>
              <Link href="/auth/signin">
                <Button className="btn-primary text-primary-foreground text-sm px-6 lg:px-8 h-10 lg:h-11 rounded-xl font-semibold">
                  开始写作
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 lg:pt-40 pb-20 lg:pb-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 shadow-soft">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">专为创作者打造的写作空间</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-[1.1] text-foreground tracking-tight">
              专注于
              <span className="block mt-2 bg-gradient-to-r from-primary via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                写作本身
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              简洁的界面设计、完整的创作工具与沉浸式体验，让你专注于故事的每一个字。
              数据安全存储，多设备同步。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/signup">
                <Button size="lg" className="btn-primary text-primary-foreground text-base px-10 h-14 rounded-xl font-bold">
                  <PenTool className="w-5 h-5 mr-2" />
                  免费注册体验
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-xl font-semibold border-2 hover-glow">
                  已有账户登录
                </Button>
              </Link>
            </div>

            {/* Preview cards */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="aspect-square rounded-2xl border border-border/60 bg-card/80 shadow-card hover-lift p-4 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-teal-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-24 lg:py-32 px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">核心功能</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-foreground tracking-tight">
              精心设计的创作工具
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              从构思到完稿，每个功能都为写作者量身打造
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="group card-surface hover-lift rounded-3xl border border-border/40 shadow-card overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-teal-50 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-soft group-hover:shadow-card transition-shadow duration-300">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section id="tools" className="py-24 lg:py-32 px-6 lg:px-8 bg-gradient-to-br from-teal-50/40 to-cyan-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">AI 助手</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-foreground tracking-tight">
              AI 辅助创作
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              智能工具箱，为你的创作提供灵感和效率
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <div 
                key={index} 
                className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-border/60 p-8 shadow-card hover-lift hover-glow transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-teal-50 rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:shadow-card transition-shadow">
                  <tool.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-3 text-base">{tool.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-teal-500 to-cyan-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bS0yIDEyYzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
            准备好开始创作了吗？
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            注册账户，安全存储你的作品，随时随地继续创作
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 text-base px-12 h-14 rounded-xl font-bold shadow-elevated hover:shadow-float transition-all">
                <PenTool className="w-5 h-5 mr-2" />
                免费注册体验
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base px-12 h-14 rounded-xl font-semibold">
                已有账户登录
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 lg:py-16 px-6 lg:px-8 border-t border-border/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo-64.png" alt="轻写" className="w-9 h-9 rounded-xl shadow-card" />
              <span className="text-base font-bold text-foreground">轻写</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 轻写. 为故事创作者打造。
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}