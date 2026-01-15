import SimulatorView from './simulator-view'

export default function SimulationPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Nueva simulación</h1>
          <a href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Volver a la página principal
          </a>
        </div>
        
        <SimulatorView/>
      </div>
    </div>
  )
}