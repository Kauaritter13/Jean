import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Heart, Sparkles, Star, PartyPopper } from 'lucide-react'

export default function SignUpSuccessPage() {
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
      </div>
      
      <Card className="w-full max-w-md relative animate-fade-in-scale backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl text-center overflow-hidden">
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardHeader className="space-y-6 pt-8">
          {/* Cute house image */}
          <div className="mx-auto relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center animate-bounce-soft">
              <Image
                src="/images/cha-casa-nova.jpg"
                alt="Cha de casa nova"
                width={80}
                height={80}
                className="rounded-xl"
              />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center animate-wiggle">
              <Mail className="w-5 h-5 text-accent-foreground" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-accent animate-sparkle" />
            <PartyPopper className="w-6 h-6 text-primary animate-bounce-soft" />
            <CardTitle className="text-2xl font-serif">Quase la!</CardTitle>
            <PartyPopper className="w-6 h-6 text-primary animate-bounce-soft stagger-1" style={{ transform: 'scaleX(-1)' }} />
            <Sparkles className="w-5 h-5 text-accent animate-sparkle stagger-2" />
          </div>
          <CardDescription className="text-base">
            Enviamos um email de confirmacao para voce
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-accent/10 border border-border/50">
            <p className="text-muted-foreground">
              Verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-primary/5">
            <Heart className="w-4 h-4 text-primary animate-heart-beat" />
            <span>Logo voces poderao montar sua lista de presentes!</span>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button asChild variant="outline" className="w-full bg-transparent hover:bg-primary/5">
            <Link href="/auth/login">Voltar para login</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Nao recebeu? Verifique a pasta de spam
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
