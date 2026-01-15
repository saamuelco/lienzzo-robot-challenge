import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/login/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bot, History, LogOut, PlayCircle } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()

  // Verificamos sesión en el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si el proxy fallara , esto es una segunda barrera de seguridad
  if (!user) {
    return redirect('/login')
  }

  // Extraemos el nombre del email para saludar (ej: "samuel" de "samuel@test.com")
  const userName = user.email?.split('@')[0] || 'Usuario'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Lienzzo.bot</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">
              Hola, <span className="font-semibold text-gray-900">{userName}</span>
            </span>
            
            {/* Formulario para Logout (Server Action) */}
            <form action={signOut}>
              <button 
                type="submit"
                className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de control</h1>
          <p className="mt-2 text-gray-600">Selecciona la tarea que desees realizar.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          
          {/* NUEVA SIMULACIÓN */}
          <Link 
            href="/simulations"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-indigo-500"
          >
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-indigo-50 transition-transform group-hover:scale-150" />
            
            <div className="relative flex flex-col items-start gap-4">
              <div className="rounded-lg bg-indigo-600 p-3 text-white shadow-sm">
                <PlayCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nueva simulación</h2>
                <p className="mt-2 text-gray-500">
                  Configura comandos y lanza una simulación del robot por la cuadrícula evitando obstáculos.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 font-medium text-indigo-600 group-hover:gap-2 transition-all">
                Empezar simulación <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>

          {/* HISTORIAL */}
          <Link 
            href="/history"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-gray-400"
          >
            <div className="relative flex flex-col items-start gap-4">
              <div className="rounded-lg bg-gray-100 p-3 text-gray-600 shadow-sm group-hover:bg-gray-200 transition-colors">
                <History className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Historial de simulaciones</h2>
                <p className="mt-2 text-gray-500">
                  Consulta tus últimas simulaciones y revisa los resultados obtenidos.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 font-medium text-gray-600 group-hover:gap-2 transition-all">
                Ver historial <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>

        </div>
      </main>
    </div>
  )
}