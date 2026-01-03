"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

type AdminUser = {
  id: string
  email: string
  name?: string | null
  avatar?: string | null
  is_admin?: boolean
  is_banned?: boolean
  created_at: string
  updated_at: string
}

type AdminNovel = {
  id: string
  title: string
  description?: string | null
  genre?: string | null
  status?: string | null
  tags?: string | null
  cover_image?: string | null
  is_banned?: boolean
  word_count: number
  chapter_count: number
  user_id: string
  user_email?: string | null
  user_name?: string | null
  created_at: string
  updated_at: string
}

type UserFormState = {
  email: string
  name: string
  avatar: string
  password: string
  is_admin: boolean
  is_banned: boolean
}

type NovelFormState = {
  title: string
  description: string
  genre: string
  status: string
  tags: string
  cover_image: string
  user_id: string
  is_banned: boolean
}

const NOVEL_STATUSES = ["draft", "writing", "completed", "published"]

export function AdminPanel() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [novels, setNovels] = useState<AdminNovel[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingNovels, setLoadingNovels] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [novelQuery, setNovelQuery] = useState("")

  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [novelDialogOpen, setNovelDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedNovel, setSelectedNovel] = useState<AdminNovel | null>(null)

  const [userForm, setUserForm] = useState<UserFormState>({
    email: "",
    name: "",
    avatar: "",
    password: "",
    is_admin: false,
    is_banned: false,
  })

  const [novelForm, setNovelForm] = useState<NovelFormState>({
    title: "",
    description: "",
    genre: "",
    status: "draft",
    tags: "",
    cover_image: "",
    user_id: "",
    is_banned: false,
  })

  const userOptions = useMemo(() => {
    return users.map((user) => ({
      id: user.id,
      label: `${user.email}${user.name ? ` (${user.name})` : ""}`,
    }))
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!userQuery.trim()) return users
    const q = userQuery.trim().toLowerCase()
    return users.filter((user) => {
      const parts = [user.email, user.name, user.id].filter(Boolean) as string[]
      return parts.some((part) => part.toLowerCase().includes(q))
    })
  }, [userQuery, users])

  const filteredNovels = useMemo(() => {
    if (!novelQuery.trim()) return novels
    const q = novelQuery.trim().toLowerCase()
    return novels.filter((novel) => {
      const parts = [
        novel.title,
        novel.user_email,
        novel.user_name,
        novel.user_id,
        novel.genre,
      ].filter(Boolean) as string[]
      return parts.some((part) => part.toLowerCase().includes(q))
    })
  }, [novelQuery, novels])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "获取用户列表失败")
      }
      setUsers(data.users)
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "获取用户列表失败",
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadNovels = async () => {
    setLoadingNovels(true)
    try {
      const res = await fetch("/api/admin/novels")
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "获取作品列表失败")
      }
      setNovels(data.novels)
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "获取作品列表失败",
      })
    } finally {
      setLoadingNovels(false)
    }
  }

  useEffect(() => {
    void loadUsers()
    void loadNovels()
  }, [])

  const openUserDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setUserForm({
      email: user.email ?? "",
      name: user.name ?? "",
      avatar: user.avatar ?? "",
      password: "",
      is_admin: Boolean(user.is_admin),
      is_banned: Boolean(user.is_banned),
    })
    setUserDialogOpen(true)
  }

  const openNovelDialog = (novel: AdminNovel) => {
    setSelectedNovel(novel)
    setNovelForm({
      title: novel.title ?? "",
      description: novel.description ?? "",
      genre: novel.genre ?? "",
      status: novel.status ?? "draft",
      tags: novel.tags ?? "",
      cover_image: novel.cover_image ?? "",
      user_id: novel.user_id,
      is_banned: Boolean(novel.is_banned),
    })
    setNovelDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    if (!userForm.email.trim()) {
      toast({ variant: "destructive", description: "邮箱不能为空" })
      return
    }
    const payload: Record<string, any> = {
      email: userForm.email.trim(),
      name: userForm.name,
      avatar: userForm.avatar,
      is_admin: userForm.is_admin,
      is_banned: userForm.is_banned,
    }
    if (userForm.password.trim()) {
      payload.password = userForm.password.trim()
    }

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "更新用户失败")
      }
      toast({ description: "用户信息已更新" })
      setUserDialogOpen(false)
      await loadUsers()
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "更新用户失败",
      })
    }
  }

  const handleUpdateNovel = async () => {
    if (!selectedNovel) return
    if (!novelForm.title.trim()) {
      toast({ variant: "destructive", description: "作品标题不能为空" })
      return
    }
    const payload: Record<string, any> = {
      title: novelForm.title.trim(),
      description: novelForm.description,
      genre: novelForm.genre,
      status: novelForm.status,
      tags: novelForm.tags,
      cover_image: novelForm.cover_image,
      user_id: novelForm.user_id,
      is_banned: novelForm.is_banned,
    }

    try {
      const res = await fetch(`/api/admin/novels/${selectedNovel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "更新作品失败")
      }
      toast({ description: "作品信息已更新" })
      setNovelDialogOpen(false)
      await loadNovels()
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "更新作品失败",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border border-border/60 bg-white/80 shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl font-bold">管理员控制台</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">用户管理</TabsTrigger>
              <TabsTrigger value="novels">作品管理</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  用户总数：{users.length}，当前显示：{filteredUsers.length}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={userQuery}
                    onChange={(event) => setUserQuery(event.target.value)}
                    placeholder="搜索邮箱/昵称/ID"
                    className="h-9 w-64 rounded-lg border-2"
                  />
                  <Button variant="outline" onClick={loadUsers} disabled={loadingUsers}>
                    刷新
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white/90">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>邮箱</TableHead>
                      <TableHead>昵称</TableHead>
                      <TableHead>管理员</TableHead>
                      <TableHead>封禁</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.name || "-"}</TableCell>
                        <TableCell>{user.is_admin ? "是" : "否"}</TableCell>
                        <TableCell>{user.is_banned ? "是" : "否"}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(user.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openUserDialog(user)}>
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                          暂无匹配用户
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="novels" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  作品总数：{novels.length}，当前显示：{filteredNovels.length}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={novelQuery}
                    onChange={(event) => setNovelQuery(event.target.value)}
                    placeholder="搜索标题/作者/ID"
                    className="h-9 w-64 rounded-lg border-2"
                  />
                  <Button variant="outline" onClick={loadNovels} disabled={loadingNovels}>
                    刷新
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white/90">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>作者</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>封禁</TableHead>
                      <TableHead>字数</TableHead>
                      <TableHead>章节</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNovels.map((novel) => (
                      <TableRow key={novel.id}>
                        <TableCell className="font-medium">{novel.title}</TableCell>
                        <TableCell>
                          {novel.user_email || novel.user_name || novel.user_id}
                        </TableCell>
                        <TableCell>{novel.status || "-"}</TableCell>
                        <TableCell>{novel.is_banned ? "是" : "否"}</TableCell>
                        <TableCell>{novel.word_count.toLocaleString()}</TableCell>
                        <TableCell>{novel.chapter_count}</TableCell>
                        <TableCell>{new Date(novel.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openNovelDialog(novel)}>
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredNovels.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                          暂无匹配作品
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户资料、管理员权限或封禁状态</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input
                value={userForm.email}
                onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>昵称</Label>
              <Input
                value={userForm.name}
                onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>头像地址</Label>
              <Input
                value={userForm.avatar}
                onChange={(event) => setUserForm((prev) => ({ ...prev, avatar: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>重置密码</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="不填写则保持原密码"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <Label>管理员</Label>
                <p className="text-xs text-muted-foreground">允许进入管理后台</p>
              </div>
              <Switch
                checked={userForm.is_admin}
                onCheckedChange={(value) => setUserForm((prev) => ({ ...prev, is_admin: value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <Label>封禁</Label>
                <p className="text-xs text-muted-foreground">禁止登录与接口访问</p>
              </div>
              <Switch
                checked={userForm.is_banned}
                onCheckedChange={(value) => setUserForm((prev) => ({ ...prev, is_banned: value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateUser}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={novelDialogOpen} onOpenChange={setNovelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑作品</DialogTitle>
            <DialogDescription>修改作品信息、作者归属或封禁状态</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>标题</Label>
                <Input
                  value={novelForm.title}
                  onChange={(event) => setNovelForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>作者</Label>
                <Select
                  value={novelForm.user_id}
                  onValueChange={(value) => setNovelForm((prev) => ({ ...prev, user_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择用户" />
                  </SelectTrigger>
                  <SelectContent>
                    {userOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>简介</Label>
              <Textarea
                rows={3}
                value={novelForm.description}
                onChange={(event) => setNovelForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>类型</Label>
                <Input
                  value={novelForm.genre}
                  onChange={(event) => setNovelForm((prev) => ({ ...prev, genre: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={novelForm.status}
                  onValueChange={(value) => setNovelForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOVEL_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>标签（原始）</Label>
              <Input
                value={novelForm.tags}
                onChange={(event) => setNovelForm((prev) => ({ ...prev, tags: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>封面地址</Label>
              <Input
                value={novelForm.cover_image}
                onChange={(event) => setNovelForm((prev) => ({ ...prev, cover_image: event.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <Label>封禁</Label>
                <p className="text-xs text-muted-foreground">作者无法访问该作品</p>
              </div>
              <Switch
                checked={novelForm.is_banned}
                onCheckedChange={(value) => setNovelForm((prev) => ({ ...prev, is_banned: value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNovelDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateNovel}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
