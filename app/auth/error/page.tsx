import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-serif">Ops! Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro durante a autenticacao
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground">
            Por favor, tente novamente ou entre em contato se o problema persistir.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Tentar novamente</Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/">Voltar ao inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
