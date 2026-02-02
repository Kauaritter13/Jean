'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Heart, Gift, Home, Sparkles, ChevronDown, Users, Star } from 'lucide-react'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-4 h-4 rounded-full bg-primary/30 animate-float" />
        <div className="absolute top-40 right-[15%] w-3 h-3 rounded-full bg-accent/40 animate-float stagger-2" />
        <div className="absolute top-60 left-[20%] w-2 h-2 rounded-full bg-secondary/50 animate-float stagger-3" />
        <div className="absolute top-32 right-[25%] w-5 h-5 rounded-full bg-primary/20 animate-float-slow stagger-4" />
        <Star className="absolute top-48 left-[30%] w-4 h-4 text-accent/30 animate-sparkle" />
        <Star className="absolute top-24 right-[35%] w-3 h-3 text-primary/30 animate-sparkle stagger-2" />
        <Heart className="absolute top-56 right-[10%] w-5 h-5 text-primary/20 animate-heart-beat stagger-3" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-dots">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-float-slow stagger-2" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-secondary/20 blur-2xl animate-float stagger-3" />

        {/* Content */}
        <div 
          className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Cute house image */}
          <div className="mb-8 animate-bounce-soft">
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src="/images/cha-casa-nova.jpg"
                alt="Cha de casa nova"
                fill
                className="object-contain rounded-2xl shadow-lg"
                priority
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-accent animate-sparkle" />
            <Heart className="w-10 h-10 text-primary animate-heart-beat" />
            <Sparkles className="w-6 h-6 text-accent animate-sparkle stagger-2" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-4 text-foreground">
            <span className="text-balance bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
              Jean & Stephany
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary font-medium mb-4 animate-fade-in-up stagger-1">
            Cha de Casa Nova
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in-up stagger-2">
            Estamos comecando uma nova fase juntos e queremos compartilhar 
            essa felicidade com voces. Ajudem-nos a montar nosso lar!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow"
            >
              <Link href="/auth/sign-up">
                <Gift className="mr-2 h-5 w-5" />
                Criar Nossa Lista
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-secondary/50"
            >
              <Link href="/auth/login">
                <Users className="mr-2 h-5 w-5" />
                Ja tenho conta
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"
          style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
        >
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-background via-secondary/5 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Home className="w-4 h-4" />
              Como funciona
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
              Simples e <span className="text-primary">facil</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Uma forma pratica de organizar os presentes para nossa casa nova
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                title: 'Crie sua lista',
                description: 'Adicione os itens que voce precisa para sua casa nova, de moveis a utensilios',
                color: 'primary',
                delay: 'stagger-1',
              },
              {
                icon: Gift,
                title: 'Importe produtos',
                description: 'Importe itens diretamente da Amazon ou Havan com apenas um link',
                color: 'accent',
                delay: 'stagger-2',
              },
              {
                icon: Users,
                title: 'Compartilhe',
                description: 'Gere um link e envie para amigos e familiares sem precisar de cadastro',
                color: 'primary',
                delay: 'stagger-3',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-card border border-border/50 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-${feature.color}/30 animate-fade-in-up ${feature.delay}`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:bg-${feature.color}/20 transition-all group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Star className="w-8 h-8 text-accent animate-sparkle" />
              <Heart className="w-14 h-14 text-primary animate-heart-beat" />
              <Star className="w-8 h-8 text-accent animate-sparkle stagger-2" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Pronto para <span className="text-primary">comecar</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Crie sua conta agora e comece a montar a lista de presentes perfeita para sua casa nova.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-10 py-6 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow-yellow bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/auth/sign-up">
                Comecar agora
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 bg-muted/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary animate-heart-beat" />
            <span className="font-serif font-medium text-lg">Jean & Stephany</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Feito com <Heart className="w-4 h-4 text-primary inline" /> para nossa casa nova
          </p>
        </div>
      </footer>
    </main>
  )
}
