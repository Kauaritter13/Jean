import React from "react"
import type { Metadata } from 'next'
import { Quicksand, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MonsterEasterEgg } from '@/components/monster-easter-egg'
import './globals.css'

const quicksand = Quicksand({ subsets: ["latin"], variable: '--font-quicksand' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Jean & Stephany - Cha de Casa Nova',
  description: 'Lista de presentes para nossa casa nova. Ajude Jean e Stephany a montar o lar deles!',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${quicksand.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <MonsterEasterEgg />
        <Analytics />
      </body>
    </html>
  )
}
