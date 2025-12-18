'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Zap,
  Award,
  Rocket
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  FadeIn, 
  SlideIn, 
  ScaleIn, 
  HoverScale, 
  CountUp, 
  Pulse, 
  Float
} from '@/components/ui/animations'

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: BookOpen,
      title: '智能创作助手',
      description: '基于先进AI技术，提供角色生成、情节构思、世界观构建等全方位创作支持',
      color: 'bg-gray-900',
      details: ['智能理解创作意图', '个性化内容推荐', '风格一致性保持']
    },
    {
      icon: Sparkles,
      title: 'AI工具箱',
      description: '六大核心AI工具，从角色设定到智能续写，覆盖创作全流程',
      color: 'bg-gray-900',
      details: ['角色生成器', '大纲生成器', '智能续写', '风格优化', '创意灵感']
    },
    {
      icon: Users,
      title: '协作平台',
      description: '支持多人协作创作，实时同步编辑，打造团队创作新体验',
      color: 'bg-gray-900',
      details: ['实时协作', '版本控制', '评论系统', '权限管理']
    }
  ]

  const stats = [
    { label: '用户满意度', value: 98, suffix: '%', icon: Star },
    { label: '创作效率提升', value: 300, suffix: '%', icon: TrendingUp },
    { label: '活跃用户', value: 10000, suffix: '+', icon: Users },
    { label: 'AI工具使用', value: 50000, suffix: '+', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                NovelCraft AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="rounded-xl border-2 font-medium">返回首页</Button>
              </Link>
              <Link href="/app">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium">
                  体验平台
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <Badge className="mb-8 bg-secondary text-secondary-foreground px-5 py-2.5 border-0 text-sm font-medium rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              平台演示
            </Badge>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-foreground tracking-tight">
              体验AI创作的
              <br />
              无限可能
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              NovelCraft AI 通过先进的人工智能技术，为创作者提供从灵感到完稿的全流程支持。
              让我们一起探索AI如何改变传统的创作方式。
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <Button size="lg" className="text-base px-10 h-14 rounded-xl font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Rocket className="w-5 h-5 mr-2" />
                  立即体验
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-xl font-medium border-2">
                了解更多
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <SlideIn direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-foreground tracking-tight">平台数据</h2>
              <p className="text-lg text-muted-foreground">真实数据展示平台实力</p>
            </div>
          </SlideIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <Card className="text-center border-border rounded-2xl">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <stat.icon className="w-7 h-7 text-background" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-3">
                      <CountUp end={stat.value} duration={2} />
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <SlideIn direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-foreground tracking-tight">核心功能</h2>
              <p className="text-lg text-muted-foreground">点击卡片了解更多详情</p>
            </div>
          </SlideIn>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <FadeIn key={index} delay={index * 0.1}>
                    <HoverScale scale={1.01}>
                      <Card 
                        className={cn(
                          "cursor-pointer transition-all duration-300 border rounded-2xl",
                          activeFeature === index 
                            ? "bg-foreground text-background border-foreground" 
                            : "bg-card hover:border-foreground/20"
                        )}
                        onClick={() => setActiveFeature(index)}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-start space-x-6">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                              activeFeature === index ? "bg-background/10" : "bg-secondary"
                            )}>
                              <feature.icon className={cn("w-7 h-7", activeFeature === index ? "text-background" : "text-foreground")} />
                            </div>
                            <div className="flex-1">
                              <h3 className={cn("text-xl font-bold mb-3", activeFeature === index ? "text-background" : "text-foreground")}>
                                {feature.title}
                              </h3>
                              <p className={cn("text-sm leading-relaxed", activeFeature === index ? "text-background/70" : "text-muted-foreground")}>
                                {feature.description}
                              </p>
                            </div>
                            <ArrowRight className={cn("w-6 h-6 transition-transform duration-200", activeFeature === index ? "text-background rotate-90" : "text-muted-foreground" )} />
                          </div>
                        </CardContent>
                      </Card>
                    </HoverScale>
                  </FadeIn>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <ScaleIn>
                <Card className="sticky top-24 border border-border rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-foreground">功能详情</CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      {features[activeFeature].title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {features[activeFeature].details.map((detail, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/80 leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 font-medium">
                        立即体验
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScaleIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <ScaleIn>
            <h2 className="text-5xl font-bold text-primary-foreground mb-8 tracking-tight">
              准备好开始您的AI创作之旅了吗？
            </h2>
          </ScaleIn>
          <FadeIn delay={0.3}>
            <p className="text-xl text-primary-foreground/80 mb-12">
              加入数万名创作者，体验AI驱动的全新创作方式
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <Link href="/app">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 text-base px-10 h-14 rounded-xl font-medium">
                <Rocket className="w-5 h-5 mr-2" />
                免费开始创作
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}