import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StacksMint - NFT Minting Platform',
  description: 'Mint NFTs on Stacks blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
