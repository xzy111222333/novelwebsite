'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// 淡入动画
export function FadeIn({ children, delay = 0, duration = 0.5, className = '' }: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 滑入动画
export function SlideIn({ children, direction = 'left', delay = 0, className = '' }: {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  className?: string
}) {
  const variants = {
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 },
    up: { y: -50, opacity: 0 },
    down: { y: 50, opacity: 0 }
  }

  return (
    <motion.div
      initial={variants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 缩放动画
export function ScaleIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 悬停效果
export function HoverScale({ children, scale = 1.05, className = '' }: {
  children: React.ReactNode
  scale?: number
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 打字机效果
export function Typewriter({ text, speed = 50, className = '' }: {
  text: string
  speed?: number
  className?: string
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-current ml-1"
        />
      )}
    </span>
  )
}

// 数字计数动画
export function CountUp({ end, start = 0, duration = 2, className = '' }: {
  end: number
  start?: number
  duration?: number
  className?: string
}) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    const increment = (end - start) / (duration * 60)
    let current = start
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [end, start, duration])

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {count.toLocaleString()}
    </motion.span>
  )
}

// 脉冲动画
export function Pulse({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 浮动动画
export function Float({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 旋转动画
export function Rotate({ children, duration = 2, className = '' }: {
  children: React.ReactNode
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 渐变背景动画 - 简化为单色
export function AnimatedGradient({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{
        backgroundColor: ['#1f2937', '#111827', '#1f2937']
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 页面切换动画
export function PageTransition({ children, isVisible }: {
  children: React.ReactNode
  isVisible: boolean
}) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 列表项动画
export function StaggeredList({ children, delay = 0.1 }: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <div>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * delay }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

// 加载动画
export function LoadingSpinner({ size = 'md', className = '' }: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(sizeClasses[size], className)}
    >
      <div className="w-full h-full border-2 border-blue-600 border-t-transparent rounded-full" />
    </motion.div>
  )
}

// 心跳动画
export function Heartbeat({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 摇摆动画
export function Shake({ children, trigger = false, className = '' }: {
  children: React.ReactNode
  trigger?: boolean
  className?: string
}) {
  return (
    <motion.div
      animate={trigger ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 弹跳动画
export function Bounce({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 1, repeat: Infinity, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}