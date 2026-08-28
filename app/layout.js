import './globals.css'

export const metadata = {
  title: 'Sistema de Solicitudes y Reportes - Concreto Fresco',
  description: 'App para registrar solicitudes de servicio y informes de campo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Grupo Tucán - Sistema de Solicitudes
              </h1>
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
