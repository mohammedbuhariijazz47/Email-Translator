import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Gmail AI Translator',
  description: 'AI-powered multilingual email translator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
