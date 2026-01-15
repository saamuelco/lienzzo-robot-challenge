'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Coordinates, Direction } from '@/types'
import { saveSimulation } from './actions'
import { 
  ArrowUp, RotateCcw, RotateCw, Play, Trash2, Undo2, Bot, 
  CheckCircle2, Eye, RefreshCw 
} from 'lucide-react'

// Utilidad de clases
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ')
}

export default function SimulatorView() {
  const router = useRouter()
  
  // Referencia para el auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null)

  // --- ESTADO DEL SIMULADOR ---
  const [commands, setCommands] = useState<string>('')
  const [obstacles, setObstacles] = useState<Coordinates[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  
  const [robotPos, setRobotPos] = useState<Coordinates>({ x: 0, y: 0 })
  const [robotDir, setRobotDir] = useState<Direction>('N')

  // --- ESTADO DEL MODAL ---
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdSimId, setCreatedSimId] = useState<string | null>(null)

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    generateMap()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [commands])

  const generateMap = () => {
    const count = Math.floor(Math.random() * 4) + 2 
    const newObstacles: Coordinates[] = []

    while (newObstacles.length < count) {
      const x = Math.floor(Math.random() * 5)
      const y = Math.floor(Math.random() * 5)
      if ((x === 0 && y === 0) || (x === 0 && y === 1) || (x === 1 && y === 0)) continue
      
      if (!newObstacles.some(o => o.x === x && o.y === y)) {
        newObstacles.push({ x, y })
      }
    }
    setObstacles(newObstacles)
  }

  // --- HANDLERS ---
  const addCommand = useCallback((cmd: 'A' | 'I' | 'D') => {
    if (isSimulating || showSuccessModal) return
    setCommands(prev => prev + cmd)
  }, [isSimulating, showSuccessModal])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSimulating || showSuccessModal) return
      const key = e.key.toUpperCase()
      if (['A', 'I', 'D'].includes(key)) addCommand(key as 'A' | 'I' | 'D')
      if (key === 'BACKSPACE') setCommands(prev => prev.slice(0, -1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addCommand, isSimulating, showSuccessModal])

  // --- EJECUCIÓN ---
  const handleExecute = async () => {
    if (!commands) return
    setIsSimulating(true)

    try {
      const result = await saveSimulation(commands, obstacles)
      setRobotPos({ x: result.finalX, y: result.finalY })
      setRobotDir(result.finalDir)
      
      if (result.dbId) {
        setCreatedSimId(result.dbId)
        setShowSuccessModal(true)
      }
      
    } catch (error) {
      alert('Error al procesar la simulación')
    } finally {
      setIsSimulating(false)
    }
  }

  const handleCreateNew = () => {
    setShowSuccessModal(false)
    setCommands('')
    setRobotPos({ x: 0, y: 0 })
    setRobotDir('N')
    setCreatedSimId(null)
    generateMap()
  }

  const handleViewResult = () => {
    if (createdSimId) {
      router.push(`/simulations/${createdSimId}`)
    }
  }

  // --- RENDER ---
  return (
    <>
      <div className="grid h-[calc(100vh-140px)] gap-8 lg:grid-cols-2 lg:gap-12">
        
        {/* SECCIÓN IZQUIERDA: CONTROLES */}
        <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Panel de Comandos</h2>
            <p className="text-sm text-gray-500">Usa los botones o tu teclado (A, I, D)</p>
          </div>

          {/* Visualizador de Comandos con SCROLL */}
          <div 
            ref={scrollRef} // Ref para auto-scroll
            className="flex-1 overflow-y-auto min-h-[150px] rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200 scroll-smooth"
          >
            <div className="flex flex-wrap gap-2">
              {commands.split('').map((char, i) => (
                <span key={i} className={classNames(
                  "flex h-8 w-8 items-center justify-center rounded text-white shadow-sm transition-all animate-in zoom-in",
                  char === 'A' ? "bg-indigo-500" :
                  char === 'I' ? "bg-emerald-500" : "bg-amber-500"
                )}>
                  {char === 'A' && <ArrowUp className="h-5 w-5" />}
                  {char === 'I' && <RotateCcw className="h-5 w-5" />}
                  {char === 'D' && <RotateCw className="h-5 w-5" />}
                </span>
              ))}
              {commands.length === 0 && (
                <span className="text-sm italic text-gray-400">Esperando comandos...</span>
              )}
            </div>
          </div>

          {/* Botonera */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <button onClick={() => addCommand('I')} disabled={isSimulating}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 p-4 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors">
              <RotateCcw className="h-6 w-6" />
              <span className="font-bold">Izquierda</span>
            </button>
            
            <button onClick={() => addCommand('A')} disabled={isSimulating}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-indigo-50 p-4 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors">
              <ArrowUp className="h-6 w-6" />
              <span className="font-bold">Avanzar</span>
            </button>

            <button onClick={() => addCommand('D')} disabled={isSimulating}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-50 p-4 text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors">
              <RotateCw className="h-6 w-6" />
              <span className="font-bold">Derecha</span>
            </button>
          </div>

          {/* Controles Secundarios */}
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setCommands(c => c.slice(0, -1))} disabled={!commands || isSimulating}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <Undo2 className="h-4 w-4" /> Deshacer
            </button>
            <button onClick={() => setCommands('')} disabled={!commands || isSimulating}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors">
              <Trash2 className="h-4 w-4" /> Limpiar
            </button>
          </div>

          {/* BOTÓN PRINCIPAL */}
          <button onClick={handleExecute} disabled={!commands || isSimulating}
            className="mt-auto flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 p-4 text-lg font-bold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-[0.98] shrink-0">
            {isSimulating ? (
              <>Procesando...</>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" /> Ejecutar simulación
              </>
            )}
          </button>
        </div>

        {/* SECCIÓN DERECHA: GRID 5x5 */}
        <div className="flex items-center justify-center rounded-2xl bg-gray-100 p-4 shadow-inner ring-1 ring-gray-200 overflow-hidden">
          <div className="relative h-full w-auto aspect-square max-h-[500px] grid grid-cols-5 gap-2 p-4 bg-white rounded-xl shadow-2xl">
            {Array.from({ length: 5 }).map((_, rowInverse) => {
              const y = 4 - rowInverse
              return Array.from({ length: 5 }).map((_, x) => {
                const isObstacle = obstacles.some(o => o.x === x && o.y === y)
                const isRobot = robotPos.x === x && robotPos.y === y

                return (
                  <div key={`${x}-${y}`} 
                    className={classNames(
                      "relative flex items-center justify-center rounded-lg border-2 text-xs font-mono transition-all duration-300",
                      isObstacle ? "border-gray-400 bg-gray-200" : "border-gray-100 bg-gray-50"
                    )}
                  >
                    <span className="absolute bottom-1 right-1 text-[10px] text-gray-300 select-none">
                      {x},{y}
                    </span>
                    {isObstacle && <div className="h-3/4 w-3/4 bg-gray-800 rounded-md opacity-80" />}
                    {isRobot && (
                      <div className={classNames(
                        "absolute z-10 h-4/5 w-4/5 text-indigo-600 transition-transform duration-300",
                        robotDir === 'N' && "rotate-0",
                        robotDir === 'E' && "rotate-90",
                        robotDir === 'S' && "rotate-180",
                        robotDir === 'W' && "-rotate-90",
                      )}>
                        <Bot className="h-full w-full" />
                      </div>
                    )}
                  </div>
                )
              })
            })}
          </div>
        </div>
      </div>

      {/* --- MODAL DE ÉXITO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-gray-200">
            <div className="bg-emerald-50 p-8 flex flex-col items-center text-center border-b border-emerald-100">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-sm ring-4 ring-white">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">¡Simulación Completada!</h3>
              <p className="text-gray-600 mt-2 text-sm px-6">
                El robot ha ejecutado todos los comandos y los resultados se han guardado correctamente.
              </p>
            </div>
            <div className="p-6 grid gap-3 bg-gray-50/50">
              <button onClick={handleViewResult} className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-[0.98]">
                <Eye className="h-5 w-5" /> Visualizar resultado
              </button>
              <button onClick={handleCreateNew} className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.98]">
                <RefreshCw className="h-5 w-5" /> Crear nueva simulación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}