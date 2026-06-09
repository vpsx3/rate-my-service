import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rate My Service',
  description: 'Find trusted Tibia servicers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
