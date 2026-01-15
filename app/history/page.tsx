import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryView from './history-view'
import { Simulation } from '@/types'

export default async function HistoryPage() {
  const supabase = await createClient()
  const numSimulations = 10;

  // 1. Protección de ruta
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Obtener las últimas 10 simulaciones
  // Supabase devuelve tipos genéricos, así que forzamos el tipado a nuestra interfaz 'Simulation'
  const { data, error } = await supabase
    .from('simulation')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(numSimulations)

  if (error) {
    console.error("Error fetching history:", error)
    return <div>Error cargando el historial. Inténtalo más tarde.</div>
  }

  // Casting necesario porque Supabase devuelve JSONB como 'any' o 'unknown'
  const simulations = data as unknown as Simulation[]

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de simulaciones</h1>
            <p className="mt-1 text-sm text-gray-500">Revisa tus últimas {numSimulations} simulaciones paso a paso.</p>
          </div>
          <a href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Volver a la página principal
          </a>
        </div>
        
        {/* Pasamos los datos al componente cliente */}
        <HistoryView initialSimulations={simulations} />
      </div>
    </div>
  )
}