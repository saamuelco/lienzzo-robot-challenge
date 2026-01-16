'use client'

import { useState, useEffect, useRef } from 'react'
import { Simulation } from '@/types'
import { deleteSimulation, getRecentSimulations } from './actions'
import { useRouter } from 'next/navigation'
import { 
  Bot, Calendar, Footprints, Goal,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
  ArrowUp, RotateCcw, RotateCw, AlertCircle, 
  Play, Pause, Trash2 
} from 'lucide-react'

// Utilidad de clases
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ')
}

interface HistoryViewProps {
  initialSimulations: Simulation[]
  isSingleView?: boolean
}

export default function HistoryView({ initialSimulations, isSingleView = false }: HistoryViewProps) {
  
  const router = useRouter()

  // --- ESTADO ---
  const [simulations, setSimulations] = useState<Simulation[]>(initialSimulations)
  const [selectedId, setSelectedId] = useState<string | null>(initialSimulations[0]?.id || null)
  
  // Estado de reproducción
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // --- Simulación seleccionada ---
  const selectedSim = simulations.find(s => s.id === selectedId)
  
  // Si borramos la simulación seleccionada, selectedSim será undefined, así que protegemos el render
  const currentStep = selectedSim?.execution_log[stepIndex] || { x: 0, y: 0, dir: 'N', action: 'START', stepIndex: 0 }
  const totalSteps = selectedSim ? selectedSim.execution_log.length - 1 : 0

  // Formateador de fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  }

  // --- EFECTO DE AUTO-PLAY ---
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && selectedSim) {
      interval = setInterval(() => {
        setStepIndex((prev) => {
          // Si llegamos al final, paramos
          if (prev >= totalSteps) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 800)
    }

    return () => clearInterval(interval)
  }, [isPlaying, totalSteps, selectedSim])

  // --- HANDLERS ---
  const handleSelect = (id: string) => {
    setSelectedId(id)
    setStepIndex(0)
    setIsPlaying(false) // Parar animación si cambiamos de simulación
  }

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      // Si estamos al final y damos play, rebobinamos al inicio
      if (stepIndex === totalSteps) {
        setStepIndex(0)
      }
      setIsPlaying(true)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    // Evitamos que el click seleccione la simulación al mismo tiempo
    e.stopPropagation() 

    const confirmed = window.confirm('¿Estás seguro de que quieres borrar esta simulación? Esta acción no se puede deshacer.')
    if (!confirmed) return

    try {
      // Borrar en servidor
      await deleteSimulation(id)
      
      alert('Simulación borrada correctamente.')

      if (isSingleView) { 
        router.push('/simulations')        
        return
      }

      const refreshedList = await getRecentSimulations()
      setSimulations(refreshedList)

      if (refreshedList.length > 0) {
          setSelectedId(refreshedList[0].id)
          setStepIndex(0)
          setIsPlaying(false)
      }else {
          setSelectedId(null)
      }
    } catch (error) {
      alert('Ha sucedido un errror al borrar la simulación.')  
    }
  }

  const controlButtonClass = "p-3 rounded-full bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"

  // --- RENDER ---
  return (
    <div className="flex flex-col lg:grid lg:h-[calc(100vh-140px)] h-auto gap-6 lg:grid-cols-[320px_1fr]">
      
      {/* 1. LISTA LATERAL (SIDEBAR) */}
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 shrink-0">
        <div className="bg-gray-50 p-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">Lista de simulaciones</h2>
        </div>
        
        <div className="h-64 lg:h-auto lg:flex-1 overflow-y-auto p-2 space-y-2">
          {simulations.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-500">No hay simulaciones aún.</p>
          )}

          {simulations.map((sim) => (
            <div
              key={sim.id}
              onClick={() => handleSelect(sim.id)}
              className={classNames(
                "group relative w-full text-left p-3 rounded-xl transition-all border cursor-pointer",
                selectedId === sim.id
                  ? "bg-indigo-50 border-indigo-200 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50"
              )}
            >
              {/* BOTÓN DE BORRAR (Solo visible en hover o si está seleccionado) */}
              <button
                onClick={(e) => handleDelete(e, sim.id)}
                className="absolute top-3 right-3 p-1.5 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all z-10"
                title="Borrar simulación"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between mb-1 pr-6">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Simulación del {formatDate(sim.created_at)}
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
            </div>
          ))}
        </div>
      </div>

      {/* 2. AREA DE REPLAY (DERECHA) */}
      <div className="flex flex-col gap-4 bg-gray-100 rounded-2xl overflow-hidden min-h-[450px] lg:min-h-0">
        
        {/* GRID VISUALIZER */}
        <div className="flex-1 min-h-0 flex items-center justify-center rounded-2xl bg-transparent p-4 ring-gray-200">
          {!selectedSim ? (
            <div className="text-gray-400">Selecciona una simulación</div>
          ) : (
            <div className="relative w-full h-auto lg:h-full lg:w-auto aspect-square max-h-[500px] grid grid-cols-5 gap-2 p-4 bg-white rounded-xl shadow-2xl">
              
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
                        "absolute z-10 h-4/5 w-4/5 transition-all duration-300 ease-in-out",
                        isRobot ? "opacity-100 scale-100" : "opacity-0 scale-50",
                        isRobot && currentStep.action === 'INVALID_MOVE' ? "text-red-500 animate-pulse" : "text-indigo-600",
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
              {/* Display de Comando actual */}
              <div className="flex items-center gap-3 text-base font-medium text-gray-700 min-h-[28px]">
                <span className="text-sm text-gray-400 font-normal mr-2">
                  {stepIndex}/{totalSteps}
                </span>
                
                {currentStep.action === 'START' && (
                   <span className="text-gray-400 text-sm">Inicio</span>
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

              {/* Botonera */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2">
                <button onClick={() => setStepIndex(0)} disabled={stepIndex === 0 || isPlaying} className={controlButtonClass} title="Inicio">
                  <ChevronFirst className="h-5 w-5" />
                </button>
                
                <button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0 || isPlaying} className={controlButtonClass} title="Anterior">
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* BOTÓN PLAY/PAUSE */}
                <div className="mx-2">
                  <button 
                    onClick={handleTogglePlay}
                    className="p-4 rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
                    title={isPlaying ? "Pausar" : "Reproducir simulación"}
                  >
                    {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                  </button>
                </div>

                <button onClick={() => setStepIndex(Math.min(totalSteps, stepIndex + 1))} disabled={stepIndex === totalSteps || isPlaying} className={controlButtonClass} title="Siguiente">
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <button onClick={() => setStepIndex(totalSteps)} disabled={stepIndex === totalSteps || isPlaying} className={controlButtonClass} title="Final">
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