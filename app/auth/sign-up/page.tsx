'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signUp } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Mail, Lock, User, Loader2, Sparkles, Star, Home } from 'lucide-react'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await signUp(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/5 p-4">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-52 h-52 rounded-full bg-accent/15 blur-3xl animate-float-slow stagger-2" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-secondary/30 blur-2xl animate-float stagger-3" />
        <Star className="absolute top-32 left-[20%] w-5 h-5 text-accent/40 animate-sparkle" />
        <Star className="absolute top-48 right-[25%] w-4 h-4 text-primary/40 animate-sparkle stagger-2" />
        <Heart className="absolute bottom-40 left-[30%] w-6 h-6 text-primary/30 animate-heart-beat stagger-3" />
        <Home className="absolute top-1/2 left-[15%] w-5 h-5 text-accent/20 animate-float stagger-4" />
      </div>
      
      <Card className="w-full max-w-md relative animate-fade-in-scale backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl">
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center animate-pulse-glow">
              <Image
                src="/images/cha-casa-nova.jpg"
                alt="Cha de casa nova"
                width={56}
                height={56}
                className="rounded-lg"
              />
            </div>
            <Heart className="absolute -bottom-1 -right-1 w-6 h-6 text-primary animate-heart-beat" />
          </div>
          <div>
            <CardTitle className="text-2xl font-serif flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-sparkle" />
              Crie sua conta
              <Sparkles className="w-5 h-5 text-accent animate-sparkle stagger-1" />
            </CardTitle>
            <CardDescription className="mt-2">Comece a montar a lista de presentes da sua casa nova</CardDescription>
          </div>
        </CardHeader>
        
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-fade-in-up">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">Seu nome</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Como voce quer ser chamado?"
                  required
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  required
                  minLength={6}
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button 
              type="submit" 
              className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-pulse-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <Home className="mr-2 h-4 w-4" />
                  Criar conta
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground text-center">
              Ja tem uma conta?{' '}
              <Link 
                href="/auth/login" 
                className="text-primary hover:underline font-medium transition-colors"
              >
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
