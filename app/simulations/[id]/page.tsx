import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryView from '@/app/history/history-view'
import { Simulation } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SingleSimulationPage({ params }: PageProps) {
  const { id } = await params
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data, error } = await supabase
    .from('simulation')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error("Error cargando simulación:", error)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Simulación no encontrada</h1>
          <p className="mt-2 text-gray-500">Es posible que no tengas permisos para ver esto.</p>
          <a href="/simulator" className="mt-4 block text-indigo-600 hover:underline">Volver al simulador</a>
        </div>
      </div>
    )
  }

  const simulation = data as unknown as Simulation

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resultado de la simulación</h1>
            <p className="mt-1 text-sm text-gray-500">Visualizando ejecución individual.</p>
          </div>
          {/* Enlace para volver a crear una nueva */}
          <a href="/simulations" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Volver al simulador
          </a>
        </div>
        
        <HistoryView initialSimulations={[simulation]} />
      </div>
    </div>
  )
}