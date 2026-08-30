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
              <div className="px-8 py-4 flex items-center">
                <img src="/logo-innovar.png" alt="INNOVAR" className="h-20" />
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
