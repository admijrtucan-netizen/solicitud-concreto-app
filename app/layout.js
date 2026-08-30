import './globals.css'

export const metadata = {
  title: 'INNOVAR - Concreto Fresco',
  description: 'App para registrar solicitudes de servicio e informes de campo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <img src="/logo-innovar.svg" alt="INNOVAR" className="h-16" />
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-8 px-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
