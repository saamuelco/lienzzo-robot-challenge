'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Coordinates, Direction } from '@/types'
import { saveSimulation } from './actions'
import { 
  ArrowUp, RotateCcw, RotateCw, Play, Trash2, Undo2, Bot, 
  CheckCircle2, Eye, RefreshCw, Info, X, AlertCircle 
} from 'lucide-react'

// Utilidad de clases
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ')
}

export default function SimulatorView() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  // --- ESTADO DEL SIMULADOR ---
  const [commands, setCommands] = useState<string>('')
  const [obstacles, setObstacles] = useState<Coordinates[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  
  const [robotPos, setRobotPos] = useState<Coordinates>({ x: 0, y: 0 })
  const [robotDir, setRobotDir] = useState<Direction>('N')

  // --- ESTADO DE MODALES Y NOTIFICACIONES ---
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [createdSimId, setCreatedSimId] = useState<string | null>(null)
  
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null)

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    generateMap()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [commands])

  // --- HELPER: MOSTRAR TOAST ---
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, type })
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
    }, 3000)
  }

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

  // --- LÓGICA DE EDICIÓN DEL GRID ---
  const toggleObstacle = (targetX: number, targetY: number) => {
    if (isSimulating) return
    
    const isRestricted = (targetX === 0 && targetY === 0) || (targetX === 0 && targetY === 1) || (targetX === 1 && targetY === 0)
    if (isRestricted) {
        showToast("No puedes bloquear la salida del robot", 'error')
        return
    }

    setObstacles(prev => {
      const exists = prev.some(o => o.x === targetX && o.y === targetY)
      
      if (exists) {
        if (prev.length <= 2){
          showToast("Debe haber al menos 2 obstáculos en el mapa.")
          return prev
        } else {
          return prev.filter(o => !(o.x === targetX && o.y === targetY))
        }
      } 
      
      if (prev.length >= 5) {
        showToast("El máximo de obstáculos es 5")
        return prev
      }
      
      return [...prev, { x: targetX, y: targetY }]
    })
  }

  // --- HANDLERS COMANDOS ---
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
    
    if (obstacles.length < 2) {
      showToast("Por favor coloca al menos 2 obstáculos en el mapa.")
      return
    }

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
      showToast('Error al procesar la simulación', 'error')
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
      <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
        
        {/* PARTE SUPERIOR */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 flex-1 min-h-0">
          
          {/* SECCIÓN IZQUIERDA: CONTROLES */}
          <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Panel de comandos</h2>
              <p className="text-sm text-gray-500">Programa la secuencia de movimientos.</p>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto min-h-[100px] rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200 scroll-smooth"
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

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <button onClick={() => addCommand('I')} disabled={isSimulating}
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 p-4 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                <RotateCcw className="h-6 w-6" />
                <span className="font-bold">Izq.</span>
              </button>
              
              <button onClick={() => addCommand('A')} disabled={isSimulating}
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-indigo-50 p-4 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors">
                <ArrowUp className="h-6 w-6" />
                <span className="font-bold">Avanzar</span>
              </button>

              <button onClick={() => addCommand('D')} disabled={isSimulating}
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-50 p-4 text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors">
                <RotateCw className="h-6 w-6" />
                <span className="font-bold">Der.</span>
              </button>
            </div>

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
          </div>

          {/* SECCIÓN DERECHA: GRID INTERACTIVO */}
          <div className="relative flex flex-col rounded-2xl bg-gray-100 p-4 shadow-inner ring-1 ring-gray-200 overflow-hidden">
             
             <div className="flex justify-between items-center mb-4 px-2">
                <div>
                   <h2 className="text-xl font-bold text-gray-900">Mapa de obstáculos</h2>
                   <p className="text-sm text-gray-500">Haz clic en las celdas para añadir o eliminar obstáculos.</p>
                </div>
                <button 
                  onClick={() => setShowInfoModal(true)}
                  className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                  title="Información sobre obstáculos"
                >
                  <Info className="h-6 w-6" />
                </button>
             </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="relative h-full w-auto aspect-square max-h-[500px] grid grid-cols-5 gap-2 p-4 bg-white rounded-xl shadow-2xl">
                {Array.from({ length: 5 }).map((_, rowInverse) => {
                  const y = 4 - rowInverse
                  return Array.from({ length: 5 }).map((_, x) => {
                    const isObstacle = obstacles.some(o => o.x === x && o.y === y)
                    const isRobot = robotPos.x === x && robotPos.y === y
                    const isRestricted = (x === 0 && y === 0) || (x === 0 && y === 1) || (x === 1 && y === 0)

                    return (
                      <div 
                        key={`${x}-${y}`} 
                        onClick={() => toggleObstacle(x, y)}
                        className={classNames(
                          "relative flex items-center justify-center rounded-lg border-2 text-xs font-mono transition-all duration-200",
                          isObstacle ? "border-gray-600 bg-gray-700" : "border-gray-100 bg-gray-50",
                          !isRestricted && !isSimulating ? "cursor-pointer hover:border-indigo-300 hover:bg-gray-200" : "cursor-not-allowed",
                          isRestricted && !isRobot && "bg-gray-100 opacity-60"
                        )}
                        title={isRestricted ? "Zona restringida" : "Haz clic para poner/quitar obstáculo"}
                      >
                        <span className="absolute bottom-1 right-1 text-[10px] text-gray-300 select-none">
                          {x},{y}
                        </span>

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
            
            <div className="mt-4 flex justify-center">
              <button 
                onClick={generateMap} 
                disabled={isSimulating}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Generar obstáculos aleatoriamente
              </button>
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR: BOTÓN */}
        <div className="shrink-0 pb-4">
          <button onClick={handleExecute} disabled={!commands || isSimulating}
            className="w-full max-w-4xl mx-auto flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 p-5 text-xl font-bold text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.99]">
            {isSimulating ? (
              <>
                <RefreshCw className="h-6 w-6 animate-spin" /> Procesando simulación...
              </>
            ) : (
              <>
                <Play className="h-6 w-6 fill-current" /> Ejecutar simulación
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- TOAST NOTIFICATION MEJORADO --- */}
      {toast && (
        <div className="fixed top-8 right-8 z-[100] flex items-center gap-4 rounded-2xl bg-white p-6 shadow-2xl border-l-8 border-red-500 animate-in slide-in-from-right-10 duration-300 w-96 ring-1 ring-black/5">
           <div className="shrink-0 p-3 bg-red-50 rounded-full text-red-600">
              {/* Icono parpadeando */}
              <AlertCircle className="h-8 w-8 animate-pulse" />
           </div>
           <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg">Operación cancelada</h4>
              <p className="text-gray-600 text-sm mt-1 leading-snug">{toast.message}</p>
           </div>
           <button 
             onClick={() => setToast(null)} 
             className="shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
           >
              <X className="h-5 w-5" />
           </button>
        </div>
      )}

      {/* --- MODAL DE INFORMACIÓN --- */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95">
              <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 mb-4 text-indigo-600">
                <Info className="h-8 w-8" />
                <h3 className="text-xl font-bold text-gray-900">Editor de mapa</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Puedes personalizar el grid antes de ejecutar la simulación:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Clic en celda vacía:</strong> Añade un obstáculo.</li>
                  <li><strong>Clic en obstáculo:</strong> Lo elimina.</li>
                  <li><strong>Límites:</strong> Debes tener entre <strong>2 y 5</strong> obstáculos.</li>
                  <li><strong>Restricciones:</strong> No puedes bloquear la celda de salida del robot (0,0) ni sus adyacentes inmediatas.</li>
                </ul>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors">
                Entendido
              </button>
           </div>
        </div>
      )}

      {/* --- MODAL DE ÉXITO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-gray-200">
            <div className="bg-emerald-50 p-8 flex flex-col items-center text-center border-b border-emerald-100">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-sm ring-4 ring-white">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">¡Simulación completada!</h3>
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