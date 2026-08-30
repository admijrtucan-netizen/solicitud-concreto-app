import './globals.css'
import Sidebar from './components/Sidebar'

export const metadata = {
  title: 'INNOVAR - Concreto Fresco',
  description: 'Plataforma profesional de gestión de solicitudes de concreto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--brand-gray-light)' }}>
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <header className="bg-white border-b" style={{ borderBottomColor: '#e5e7eb' }}>
              <div className="px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src="/logo-innovar.png" alt="INNOVAR" className="h-16" />
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--brand-black)' }}>INNOVAR</h1>
                    <p className="text-sm" style={{ color: 'var(--brand-gray-medium)' }}>Concreto Fresco</p>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <div className="px-8 py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
