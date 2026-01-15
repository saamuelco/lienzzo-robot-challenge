'use client'

import { useState } from 'react'
import { Simulation } from '@/types'
import { 
  Bot, Calendar, Footprints, Goal,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
  ArrowUp, RotateCcw, RotateCw, AlertCircle, PlayCircle
} from 'lucide-react'

// Utilidad de clases
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ')
}

export default function HistoryView({ initialSimulations }: { initialSimulations: Simulation[] }) {
  // --- ESTADO ---
  const [selectedId, setSelectedId] = useState<string | null>(initialSimulations[0]?.id || null)
  const [stepIndex, setStepIndex] = useState(0)

  // --- DATOS COMPUTADOS ---
  const selectedSim = initialSimulations.find(s => s.id === selectedId)
  const currentStep = selectedSim?.execution_log[stepIndex] || { x: 0, y: 0, dir: 'N', action: 'START', stepIndex: 0 }
  const totalSteps = selectedSim ? selectedSim.execution_log.length - 1 : 0

  // Formateador de fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  }

  // --- HANDLERS ---
  const handleSelect = (id: string) => {
    setSelectedId(id)
    setStepIndex(0)
  }

  const controlButtonClass = "p-3 rounded-full bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"

  // --- RENDER ---
  return (
    <div className="grid h-[calc(100vh-140px)] gap-6 lg:grid-cols-[320px_1fr]">
      
      {/* 1. LISTA LATERAL (SIDEBAR) */}
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="bg-gray-50 p-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">Lista de simulaciones</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {initialSimulations.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-500">No hay simulaciones aún.</p>
          )}

          {initialSimulations.map((sim) => (
            <button
              key={sim.id}
              onClick={() => handleSelect(sim.id)}
              className={classNames(
                "w-full text-left p-3 rounded-xl transition-all border",
                selectedId === sim.id
                  ? "bg-indigo-50 border-indigo-200 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {"Simulación del " + formatDate(sim.created_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                 <div className="flex gap-0.5 opacity-70">
                    {sim.commands.slice(0, 10).split('').map((c, i) => (
                      <span key={i} className={classNames(
                        "h-1.5 w-1.5 rounded-full",
                        c === 'A' ? "bg-indigo-500" : c === 'I' ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                    ))}
                 </div>
                 {sim.commands.length > 10 && <span className="text-[10px] text-gray-400">+{sim.commands.length - 10}</span>}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Goal className="h-3 w-3" /> Pos. final: ({sim.final_x}, {sim.final_y})
                </span>
                <span className="flex items-center gap-1">
                  <Footprints className="h-3 w-3" /> {sim.commands.length} comandos
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. AREA DE REPLAY (DERECHA) */}
      <div className="flex flex-col gap-4 bg-gray-100 rounded-2xl overflow-hidden">
        
        {/* GRID VISUALIZER */}
        <div className="flex-1 min-h-0 flex items-center justify-center rounded-2xl bg-transparent p-4 ring-gray-200">
          {!selectedSim ? (
            <div className="text-gray-400">Selecciona una simulación</div>
          ) : (
            <div className="relative h-full w-auto aspect-square max-h-[500px] grid grid-cols-5 gap-2 p-4 bg-white rounded-xl shadow-2xl">
              
              {Array.from({ length: 5 }).map((_, rowInverse) => {
                const y = 4 - rowInverse
                return Array.from({ length: 5 }).map((_, x) => {
                  
                  const isObstacle = selectedSim.obstacles.some(o => o.x === x && o.y === y)
                  const isRobot = currentStep.x === x && currentStep.y === y

                  return (
                    <div key={`${x}-${y}`} 
                      className={classNames(
                        "relative flex items-center justify-center rounded-lg border-2 text-xs font-mono transition-colors duration-300",
                        isObstacle ? "border-gray-400 bg-gray-200" : "border-gray-100 bg-gray-50"
                      )}
                    >
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] text-gray-300 select-none leading-none">
                        {x},{y}
                      </span>

                      {isObstacle && <div className="h-3/4 w-3/4 bg-gray-800 rounded-md opacity-80" />}

                      <div className={classNames(
                        // 1. Quitamos 'text-indigo-600' fijo de aquí
                        "absolute z-10 h-4/5 w-4/5 transition-all duration-300 ease-in-out",
                        
                        isRobot ? "opacity-100 scale-100" : "opacity-0 scale-50",
                        
                        // 2. Lógica de COLOR y EFECTO según la acción
                        // Si hay colisión: ROJO + PARPADEO (Pulse)
                        // Si no: INDIGO normal
                        isRobot && currentStep.action === 'INVALID_MOVE' 
                          ? "text-red-500 animate-pulse" 
                          : "text-indigo-600",

                        // 3. Rotación
                        isRobot && currentStep.dir === 'N' && "rotate-0",
                        isRobot && currentStep.dir === 'E' && "rotate-90",
                        isRobot && currentStep.dir === 'S' && "rotate-180",
                        isRobot && currentStep.dir === 'W' && "-rotate-90",
                      )}>
                        <Bot className="h-full w-full" />
                      </div>
                    </div>
                  )
                })
              })}
            </div>
          )}
        </div>

        {/* 3. CONTROLES DE REPRODUCCIÓN */}

        <div className="shrink-0 flex flex-col items-center gap-3 rounded-2xl bg-transparent p-4">
          
          {selectedSim && (
            <>
              {/* Display de Comando Actual */}
              <div className="flex items-center gap-3 text-base font-medium text-gray-700 min-h-[28px]">
                <span className="text-sm text-gray-400 font-normal mr-2">
                  {stepIndex}/{totalSteps}
                </span>
                
                {currentStep.action === 'START' && (
                  <span className="flex items-center gap-1.5 text-gray-400 animate-in fade-in slide-in-from-bottom-1 text-sm">   
                    <PlayCircle className="h-4 w-4" /> Inicio
                  </span>
                )}
                
                {currentStep.action === 'MOVE' && (
                  <span className="flex items-center gap-1.5 text-indigo-600 animate-in fade-in slide-in-from-bottom-1 text-sm">
                    <ArrowUp className="h-4 w-4" /> Avanzar
                  </span>
                )}
                {currentStep.action === 'LEFT' && (
                  <span className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in slide-in-from-bottom-1 text-sm">
                    <RotateCcw className="h-4 w-4" /> Girar Izq.
                  </span>
                )}
                {currentStep.action === 'RIGHT' && (
                  <span className="flex items-center gap-1.5 text-amber-600 animate-in fade-in slide-in-from-bottom-1 text-sm">
                    <RotateCw className="h-4 w-4" /> Girar Der.
                  </span>
                )}
                {currentStep.action === 'INVALID_MOVE' && (
                  <span className="flex items-center gap-1.5 text-red-600 animate-in fade-in slide-in-from-bottom-1 text-sm">
                    <AlertCircle className="h-4 w-4" /> ¡Colisión!
                  </span>
                )}
              </div>

              {/* Botonera Unificada */}
              <div className="flex items-center gap-2">
                <button onClick={() => setStepIndex(0)} disabled={stepIndex === 0} className={controlButtonClass} title="Inicio">
                  <ChevronFirst className="h-5 w-5" />
                </button>
                
                <button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0} className={controlButtonClass} title="Anterior">
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="w-2" /> 

                <button onClick={() => setStepIndex(Math.min(totalSteps, stepIndex + 1))} disabled={stepIndex === totalSteps} className={controlButtonClass} title="Siguiente">
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <button onClick={() => setStepIndex(totalSteps)} disabled={stepIndex === totalSteps} className={controlButtonClass} title="Final">
                  <ChevronLast className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}