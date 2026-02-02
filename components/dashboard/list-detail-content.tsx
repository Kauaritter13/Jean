'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  addGiftItem, 
  deleteGiftItem, 
  toggleItemPurchased, 
  type GiftList, 
  type GiftItem 
} from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  ExternalLink,
  Loader2,
  Package,
  Link as LinkIcon,
  ShoppingCart,
  Check,
  Gift,
  Sparkles,
  ImageIcon,
  Share2,
  Copy,
  Star,
  Edit
} from 'lucide-react'

interface ListDetailContentProps {
  list: GiftList
  items: GiftItem[]
  isOwner: boolean
}

export function ListDetailContent({ list, items: initialItems, isOwner }: ListDetailContentProps) {
  const [items, setItems] = useState(initialItems)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleAddItem(formData: FormData) {
    setIsAddingItem(true)
    formData.set('listId', list.id)
    
    const result = await addGiftItem(formData)
    
    if (result.success) {
      setIsDialogOpen(false)
      window.location.reload()
    }
    
    setIsAddingItem(false)
  }

  async function handleImportProduct() {
    if (!importUrl.trim()) return
    
    setIsImporting(true)
    setImportError(null)
    
    try {
      // Check if URL is from Shopee
      const isShopee = importUrl.includes('shopee.com.br')
      const endpoint = isShopee ? '/api/import-shopee' : '/api/import-product'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl, listId: list.id }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar produto')
      }
      
      setImportUrl('')
      setIsDialogOpen(false)
      window.location.reload()
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Erro ao importar produto')
    } finally {
      setIsImporting(false)
    }
  }

  async function handleDeleteItem(itemId: string) {
    setIsDeleting(itemId)
    await deleteGiftItem(itemId, list.id)
    setItems(items.filter(i => i.id !== itemId))
    setIsDeleting(null)
  }

  async function handleTogglePurchased(itemId: string, currentStatus: boolean) {
    await toggleItemPurchased(itemId, !currentStatus, list.id)
    setItems(items.map(i => 
      i.id === itemId ? { ...i, is_purchased: !currentStatus } : i
    ))
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/lista/${list.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pendingItems = items.filter(i => !i.is_purchased)
  const purchasedItems = items.filter(i => i.is_purchased)
  const totalValue = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0)
  const progressPercent = items.length > 0 ? (purchasedItems.length / items.length) * 100 : 0

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
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="hover:bg-primary/10">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-serif font-semibold text-lg">{list.name}</h1>
              <p className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {list.is_public && isOwner && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLink}
                className="bg-transparent hover:bg-accent/10 hover:text-accent hover:border-accent transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-primary" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </>
                )}
              </Button>
            )}
            <Link href="/" className="flex items-center gap-2 group">
              <Heart className="w-5 h-5 text-primary group-hover:scale-110 transition-transform animate-heart-beat" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in-up border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{items.length}</div>
              <p className="text-sm text-muted-foreground">Total de itens</p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up stagger-1 border-accent/20 hover:border-accent/40 transition-colors">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-accent">{pendingItems.length}</div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up stagger-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{purchasedItems.length}</div>
              <p className="text-sm text-muted-foreground">Comprados</p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up stagger-3">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">Valor total</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="mb-8 animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso da lista</span>
              <span className="font-medium">{Math.round(progressPercent)}% completo</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        )}

        {/* Add Item Button */}
        {isOwner && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {list.is_public && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-4 py-2 rounded-lg">
                <Share2 className="w-4 h-4" />
                <span>Esta lista pode ser compartilhada com amigos</span>
              </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="animate-fade-in-up transition-all hover:scale-105 animate-pulse-glow ml-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-serif flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Adicionar Item
                  </DialogTitle>
                  <DialogDescription>
                    Adicione um item manualmente ou importe de um link
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="import" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="import" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Importar Link</TabsTrigger>
                    <TabsTrigger value="manual" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Manual</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="import" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="importUrl">Cole o link do produto</Label>
                      <div className="flex gap-2">
                        <Input
                          id="importUrl"
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          placeholder="https://shopee.com.br/... ou https://amazon.com.br/..."
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-accent" />
                        Suportamos Shopee, Amazon, Havan e mais!
                      </p>
                    </div>
                    
                    {importError && (
                      <p className="text-sm text-destructive">{importError}</p>
                    )}
                    
                    <Button 
                      onClick={handleImportProduct}
                      className="w-full" 
                      disabled={isImporting || !importUrl.trim()}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Importar Produto
                        </>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="space-y-4 mt-4">
                    <form action={handleAddItem} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do item *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Ex: Panela de pressao"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Descricao</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Detalhes do produto..."
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Preco (R$)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantidade</Label>
                          <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            defaultValue="1"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">URL da imagem</Label>
                        <Input
                          id="imageUrl"
                          name="imageUrl"
                          type="url"
                          placeholder="https://..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="productUrl">Link do produto</Label>
                        <Input
                          id="productUrl"
                          name="productUrl"
                          type="url"
                          placeholder="https://amazon.com.br/..."
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isAddingItem}>
                        {isAddingItem ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          <>
                            <Package className="w-4 h-4 mr-2" />
                            Adicionar Item
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <Card className="animate-fade-in-up text-center py-16 border-dashed border-2">
            <CardContent className="space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto animate-bounce-soft">
                <Gift className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-semibold mb-2">Nenhum item ainda</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Comece adicionando itens a sua lista! Importe diretamente da Amazon ou Havan.
                </p>
                {isOwner && (
                  <Button onClick={() => setIsDialogOpen(true)} className="animate-pulse-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar primeiro item
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-3 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-accent" />
                  </div>
                  Itens pendentes ({pendingItems.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingItems.map((item, index) => (
                    <ItemCard 
                      key={item.id}
                      item={item}
                      isOwner={isOwner}
                      isDeleting={isDeleting === item.id}
                      onDelete={() => handleDeleteItem(item.id)}
                      onTogglePurchased={() => handleTogglePurchased(item.id, item.is_purchased)}
                      delay={`stagger-${(index % 5) + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-3 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  Itens comprados ({purchasedItems.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                  {purchasedItems.map((item, index) => (
                    <ItemCard 
                      key={item.id}
                      item={item}
                      isOwner={isOwner}
                      isDeleting={isDeleting === item.id}
                      onDelete={() => handleDeleteItem(item.id)}
                      onTogglePurchased={() => handleTogglePurchased(item.id, item.is_purchased)}
                      delay={`stagger-${(index % 5) + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
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

interface ItemCardProps {
  item: GiftItem
  isOwner: boolean
  isDeleting: boolean
  onDelete: () => void
  onTogglePurchased: () => void
  delay: string
}

function ItemCard({ item, isOwner, isDeleting, onDelete, onTogglePurchased, delay }: ItemCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [editPrice, setEditPrice] = useState(item.price?.toString() || '')
  const [editImageUrl, setEditImageUrl] = useState(item.image_url || '')
  const [isSaving, setIsSaving] = useState(false)
  return (
    <Card className={`group animate-fade-in-up ${delay} transition-all duration-300 hover:shadow-lg ${item.is_purchased ? 'opacity-75' : 'hover:scale-[1.02] hover:border-primary/30'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {item.image_url ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
              {item.is_purchased && (
                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-secondary/50 to-muted flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-base line-clamp-2 ${item.is_purchased ? 'line-through text-muted-foreground' : ''}`}>
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
      
      <CardFooter className="flex items-center gap-2 pt-2">
        <div className="flex items-center gap-2 flex-1">
          <Checkbox 
            checked={item.is_purchased}
            onCheckedChange={onTogglePurchased}
            id={`purchased-${item.id}`}
          />
          <label 
            htmlFor={`purchased-${item.id}`}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {item.is_purchased ? 'Comprado' : 'Marcar'}
          </label>
        </div>
        
        <div className="flex items-center gap-1">
          {item.product_url && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
              <a href={item.product_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
          
          {isOwner && (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowEditDialog(true)}
                className="h-8 w-8 hover:text-primary"
                title="Editar produto"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onDelete}
                disabled={isDeleting}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar produto</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do produto na sua lista
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome do produto</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">URL da imagem</Label>
                <Input
                  id="edit-image"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implementar salvamento das alterações
                  setShowEditDialog(false)
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
