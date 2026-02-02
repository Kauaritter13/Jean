'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/auth/actions'
import { createGiftList, deleteGiftList, type GiftList } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  Heart, 
  Plus, 
  Gift, 
  LogOut, 
  Trash2, 
  ExternalLink,
  Loader2,
  ListPlus,
  Sparkles,
  Home,
  Share2,
  Copy,
  Check,
  Star
} from 'lucide-react'

interface DashboardContentProps {
  user: User
  initialLists: GiftList[]
}

export function DashboardContent({ user, initialLists }: DashboardContentProps) {
  const [lists, setLists] = useState(initialLists)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCreateList(formData: FormData) {
    setIsCreating(true)
    formData.set('isPublic', isPublic.toString())
    
    const result = await createGiftList(formData)
    
    if (result.success) {
      setIsDialogOpen(false)
      window.location.reload()
    }
    
    setIsCreating(false)
  }

  async function handleDeleteList(listId: string) {
    setIsDeleting(listId)
    await deleteGiftList(listId)
    setLists(lists.filter(l => l.id !== listId))
    setIsDeleting(null)
  }

  async function handleCopyLink(listId: string) {
    const url = `${window.location.origin}/lista/${listId}`
    await navigator.clipboard.writeText(url)
    setCopiedId(listId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-4 h-4 rounded-full bg-primary/30 animate-float" />
        <div className="absolute top-40 right-[15%] w-3 h-3 rounded-full bg-accent/40 animate-float stagger-2" />
        <Star className="absolute top-48 left-[30%] w-4 h-4 text-accent/30 animate-sparkle" />
        <Heart className="absolute bottom-32 right-[20%] w-5 h-5 text-primary/20 animate-heart-beat stagger-3" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-6 h-6 text-primary group-hover:scale-110 transition-transform animate-heart-beat" />
            <span className="font-serif font-semibold text-lg">Jean & Stephany</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Ola, <span className="font-medium text-foreground">{displayName}</span>
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="hover:text-primary">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Suas Listas de Presentes</h1>
            <p className="text-muted-foreground">Gerencie os itens para sua casa nova</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="animate-fade-in-up stagger-1 transition-all hover:scale-105 animate-pulse-glow">
                <Plus className="w-4 h-4 mr-2" />
                Nova Lista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form action={handleCreateList}>
                <DialogHeader>
                  <DialogTitle className="font-serif flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Criar Nova Lista
                  </DialogTitle>
                  <DialogDescription>
                    Crie uma nova lista para organizar os presentes
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da lista</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Cozinha, Sala, Quarto..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descricao (opcional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Uma breve descricao da lista..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic" className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-primary" />
                        Lista publica
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que outros vejam e acessem esta lista pelo link
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <ListPlus className="w-4 h-4 mr-2" />
                        Criar Lista
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lists Grid */}
        {lists.length === 0 ? (
          <Card className="animate-fade-in-up text-center py-16 border-dashed border-2">
            <CardContent className="space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto animate-bounce-soft">
                <Gift className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-semibold mb-2">Nenhuma lista ainda</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Comece criando sua primeira lista de presentes e compartilhe com seus amigos e familiares!
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="animate-pulse-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira lista
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list, index) => (
              <Card 
                key={list.id}
                className={`group animate-fade-in-up stagger-${(index % 5) + 1} transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:scale-[1.02]`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all group-hover:scale-110 group-hover:rotate-3">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{list.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          {list.is_public ? (
                            <>
                              <Share2 className="w-3 h-3" />
                              Publica
                            </>
                          ) : (
                            'Privada'
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {list.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {list.description}
                    </p>
                  </CardContent>
                )}
                
                <CardFooter className="flex gap-2">
                  <Button asChild variant="default" size="sm" className="flex-1">
                    <Link href={`/dashboard/list/${list.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir
                    </Link>
                  </Button>
                  
                  {list.is_public && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyLink(list.id)}
                      className="bg-transparent hover:bg-accent/10 hover:text-accent hover:border-accent"
                    >
                      {copiedId === list.id ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteList(list.id)}
                    disabled={isDeleting === list.id}
                    className="bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isDeleting === list.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Floating decoration */}
      <div className="fixed bottom-8 right-8 pointer-events-none">
        <Sparkles className="w-10 h-10 text-accent/30 animate-float" />
      </div>
    </div>
  )
}
