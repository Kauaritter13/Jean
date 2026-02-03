'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { type GiftList, type GiftItem } from '@/app/dashboard/actions'
import { isValidCPF, formatCPF } from '@/lib/cpf-validator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Gift,
  ExternalLink,
  ShoppingCart,
  Check,
  Sparkles,
  ImageIcon,
  Home,
  Star,
  PartyPopper,
  Edit,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface PublicListContentProps {
  list: GiftList
  items: GiftItem[]
  ownerName: string
}

export function PublicListContent({ list, items, ownerName }: PublicListContentProps) {
  const [localItems, setLocalItems] = useState(items)
  const pendingItems = localItems.filter(i => !i.is_purchased)
  const purchasedItems = localItems.filter(i => i.is_purchased)
  const totalValue = localItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0)
  const purchasedValue = purchasedItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0)
  const progressPercent = localItems.length > 0 ? (purchasedItems.length / localItems.length) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-4 h-4 rounded-full bg-primary/30 animate-float" />
        <div className="absolute top-40 right-[15%] w-3 h-3 rounded-full bg-accent/40 animate-float stagger-2" />
        <Star className="absolute top-48 left-[30%] w-4 h-4 text-accent/30 animate-sparkle" />
        <Heart className="absolute top-56 right-[10%] w-5 h-5 text-primary/20 animate-heart-beat stagger-3" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-6 h-6 text-primary group-hover:scale-110 transition-transform animate-heart-beat" />
            <span className="font-serif font-semibold text-lg">Jean & Stephany</span>
          </Link>
          
          <Badge variant="secondary" className="animate-fade-in-up">
            <Gift className="w-3 h-3 mr-1" />
            Lista Publica
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-secondary/20 via-background to-background overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-50" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
            <Sparkles className="w-6 h-6 text-accent animate-sparkle" />
            <PartyPopper className="w-8 h-8 text-primary animate-bounce-soft" />
            <Sparkles className="w-6 h-6 text-accent animate-sparkle stagger-2" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 animate-fade-in-up stagger-1">
            {list.name}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-2 animate-fade-in-up stagger-2">
            Lista de presentes
          </p>
          
          {list.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in-up stagger-3">
              {list.description}
            </p>
          )}
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-8 px-4 border-b border-border/50 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 animate-fade-in-up">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{purchasedItems.length}</div>
                <div className="text-sm text-muted-foreground">Comprados</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{pendingItems.length}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold">{items.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            
            <div className="w-full md:w-64 animate-fade-in-up stagger-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {localItems.length === 0 ? (
          <Card className="animate-fade-in-up text-center py-16">
            <CardContent className="space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-bounce-soft">
                <Gift className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-semibold mb-2">Lista vazia</h3>
                <p className="text-muted-foreground">
                  Ainda não há itens nesta lista.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-3 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-accent" />
                  </div>
                  Itens disponiveis ({pendingItems.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingItems.map((item, index) => (
                    <PublicItemCard 
                      key={item.id}
                      item={item}
                      delay={`stagger-${(index % 5) + 1}`}
                      onPurchaseChange={(updatedItem) => {
                        setLocalItems(prev => 
                          prev.map(i => i.id === updatedItem.id ? updatedItem : i)
                        )
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-3 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  Ja comprados ({purchasedItems.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                  {purchasedItems.map((item, index) => (
                    <PublicItemCard 
                      key={item.id}
                      item={item}
                      delay={`stagger-${(index % 5) + 1}`}
                      onPurchaseChange={(updatedItem) => {
                        setLocalItems(prev => 
                          prev.map(i => i.id === updatedItem.id ? updatedItem : i)
                        )
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 bg-muted/10">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary animate-heart-beat" />
            <span className="font-serif font-medium">Jean & Stephany</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Obrigado por nos ajudar a montar nossa casa nova!
          </p>
          <Button asChild variant="outline" size="sm" className="bg-transparent">
            <Link href="/auth/sign-up">
              <Home className="w-4 h-4 mr-2" />
              Criar minha propria lista
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  )
}

interface PublicItemCardProps {
  item: GiftItem
  delay: string
  onPurchaseChange?: (item: GiftItem) => void
}

function PublicItemCard({ item, delay, onPurchaseChange }: PublicItemCardProps) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showUnmarkDialog, setShowUnmarkDialog] = useState(false)
  const [purchaserName, setPurchaserName] = useState('')
  const [purchaserCPF, setPurchaserCPF] = useState('')
  const [unmarkCPF, setUnmarkCPF] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [unmarkCpfError, setUnmarkCpfError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMarkAsPurchased = async () => {
    if (!purchaserName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome',
        variant: 'destructive',
      })
      return
    }

    if (!purchaserCPF.trim()) {
      setCpfError('CPF é obrigatório')
      return
    }

    if (!isValidCPF(purchaserCPF)) {
      setCpfError('CPF inválido. Por favor, verifique o número informado.')
      return
    }

    setCpfError('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/mark-purchased', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          purchasedByName: purchaserName.trim(),
          purchasedByCPF: purchaserCPF.replace(/\D/g, ''),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao marcar como comprado')
      }

      const { data } = await response.json()
      
      toast({
        title: 'Sucesso!',
        description: 'Item marcado como comprado',
      })

      onPurchaseChange?.(data)
      setShowPurchaseDialog(false)
      setPurchaserName('')
      setPurchaserCPF('')
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível marcar o item como comprado',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnmarkAsPurchased = async () => {
    if (!unmarkCPF.trim()) {
      setUnmarkCpfError('CPF é obrigatório para desmarcar')
      return
    }

    if (!isValidCPF(unmarkCPF)) {
      setUnmarkCpfError('CPF inválido. Por favor, verifique o número informado.')
      return
    }

    setUnmarkCpfError('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/mark-purchased', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: item.id,
          cpf: unmarkCPF.replace(/\D/g, '')
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao desmarcar')
      }

      const { data } = await response.json()
      
      toast({
        title: 'Item desmarcado',
        description: 'O item está disponível novamente',
      })

      onPurchaseChange?.(data)
      setShowUnmarkDialog(false)
      setUnmarkCPF('')
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível desmarcar o item',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Card className={`group animate-fade-in-up ${delay} transition-all duration-300 hover:shadow-lg overflow-hidden flex flex-col ${item.is_purchased ? 'opacity-75' : 'hover:scale-[1.02]'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3 min-h-[80px]">
          {item.image_url ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
              {item.is_purchased && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <CardTitle className={`text-sm font-semibold break-words ${item.is_purchased ? 'line-through text-muted-foreground' : ''}`}>
              {item.name}
            </CardTitle>
            {item.source && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {item.source}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          {item.price ? (
            <span className={`font-bold text-lg ${item.is_purchased ? 'text-muted-foreground' : 'text-primary'}`}>
              R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Preco nao informado</span>
          )}
          {item.quantity > 1 && (
            <Badge variant="outline">Qtd: {item.quantity}</Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col gap-2 mt-auto">
        {item.is_purchased ? (
          <>
            <div className="w-full text-center py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Comprado por {item.purchased_by_name || 'alguém'}
            </div>
            <Button 
              onClick={() => setShowUnmarkDialog(true)}
              disabled={isLoading}
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Desmarcar compra
            </Button>
          </>
        ) : (
          <>
            {item.product_url && (
              <Button asChild className="w-full" variant="default">
                <a href={item.product_url} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ver na loja
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
            <Button 
              onClick={() => setShowPurchaseDialog(true)}
              variant={item.product_url ? "outline" : "default"}
              className="w-full"
            >
              <Gift className="w-4 h-4 mr-2" />
              Vou comprar
            </Button>
          </>
        )}
        
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como comprado</DialogTitle>
              <DialogDescription>
                Você vai presentear com "{item.name}". 
                Informe seu nome e CPF para que eles saibam quem presenteou!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Seu nome</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={purchaserCPF}
                  onChange={(e) => {
                    const value = e.target.value
                    setPurchaserCPF(value)
                    // Clear error when user starts typing
                    if (cpfError) {
                      setCpfError('')
                    }
                  }}
                  maxLength={14}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMarkAsPurchased()
                    }
                  }}
                />
                {cpfError && (
                  <p className="text-sm text-destructive">{cpfError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Seu CPF será utilizado apenas para impedir que alguém desmarque seus presentes
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPurchaseDialog(false)
                  setPurchaserName('')
                  setPurchaserCPF('')
                  setCpfError('')
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleMarkAsPurchased}
                disabled={isLoading}
              >
                {isLoading ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unmark Purchase Dialog */}
        <Dialog open={showUnmarkDialog} onOpenChange={setShowUnmarkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desmarcar compra</DialogTitle>
              <DialogDescription>
                Para desmarcar este item, você precisa confirmar com o seu CPF.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="unmark-cpf">CPF</Label>
                <Input
                  id="unmark-cpf"
                  placeholder="000.000.000-00"
                  value={unmarkCPF}
                  onChange={(e) => {
                    const value = e.target.value
                    setUnmarkCPF(value)
                    // Clear error when user starts typing
                    if (unmarkCpfError) {
                      setUnmarkCpfError('')
                    }
                  }}
                  maxLength={14}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnmarkAsPurchased()
                    }
                  }}
                />
                {unmarkCpfError && (
                  <p className="text-sm text-destructive">{unmarkCpfError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUnmarkDialog(false)
                  setUnmarkCPF('')
                  setUnmarkCpfError('')
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUnmarkAsPurchased}
                disabled={isLoading}
              >
                {isLoading ? 'Desmarcando...' : 'Desmarcar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
