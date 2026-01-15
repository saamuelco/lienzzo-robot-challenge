'use client'

import { useState, useEffect, useCallback } from 'react'
import { Coordinates, Direction } from '@/types'
import { saveSimulation } from './actions'
import { ArrowUp, RotateCcw, RotateCw, Play, Trash2, Undo2, Rocket, Bot } from 'lucide-react'

// Utilidad para clases condicionales
const classNames = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function SimulatorView() {
  // --- ESTADO ---
  const [commands, setCommands] = useState<string>('')
  const [obstacles, setObstacles] = useState<Coordinates[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  
  // Estado visual del robot (para la futura animación)
  const [robotPos, setRobotPos] = useState<Coordinates>({ x: 0, y: 0 })
  const [robotDir, setRobotDir] = useState<Direction>('N')

  // --- INICIALIZACIÓN (Generar grid) ---
  useEffect(() => {
    // Generar entre 2 y 5 obstáculos aleatorios
    const count = Math.floor(Math.random() * 4) + 2 
    const newObstacles: Coordinates[] = []

    while (newObstacles.length < count) {
      const x = Math.floor(Math.random() * 5)
      const y = Math.floor(Math.random() * 5)
      
      // REGLA: No bloquear la salida (0,0), (0,1), (1,0)
      if ((x === 0 && y === 0) || (x === 0 && y === 1) || (x === 1 && y === 0)) continue
      
      // Evitar duplicados
      if (!newObstacles.some(o => o.x === x && o.y === y)) {
        newObstacles.push({ x, y })
      }
    }
    setObstacles(newObstacles)
  }, [])

  // --- HANDLERS ---
  const addCommand = useCallback((command: 'A' | 'I' | 'D') => {
    if (isSimulating) return
    setCommands(prev => prev + command)
  }, [isSimulating])

  // Soporte para Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSimulating) return
      const key = e.key.toUpperCase()
      if (['A', 'I', 'D'].includes(key)) addCommand(key as 'A' | 'I' | 'D')
      if (key === 'BACKSPACE') setCommands(prev => prev.slice(0, -1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addCommand, isSimulating])

  const handleExecute = async () => {
    if (!commands) return
    setIsSimulating(true)

    try {
      // 1. Llamar al Server Action
      const result = await saveSimulation(commands, obstacles)
      
      // 2. AQUÍ IRA LA ANIMACIÓN (Bonus)
      // Por ahora, saltamos al final para verificar que funciona
      console.log("Resultado del servidor:", result)
      setRobotPos({ x: result.finalX, y: result.finalY })
      setRobotDir(result.finalDir)
      
      alert('¡Simulación terminada y guardada!')
      
    } catch (error) {
      alert('Error al procesar la simulación')
    } finally {
      setIsSimulating(false)
    }
  }

  // --- RENDER ---
  return (
    <div className="grid h-[calc(100vh-100px)] gap-8 lg:grid-cols-2 lg:gap-12">
      
      {/* SECCIÓN IZQUIERDA: CONTROLES */}
      <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Panel de comandos</h2>
          <p className="text-sm text-gray-500">Usa los botones o las teclas A, I, D</p>
        </div>

{/* Visualizador de comandos */}
        <div className="flex-1 overflow-hidden rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
          <div className="flex flex-wrap gap-2">
            {commands.split('').map((char, i) => (
              <span key={i} className={classNames(
                "flex h-8 w-8 items-center justify-center rounded text-white shadow-sm transition-all animate-in zoom-in",
                char === 'A' ? "bg-indigo-500" :
                char === 'I' ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {/* Renderizado condicional del icono */}
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

        {/* Botonera de Acciones */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => addCommand('I')} disabled={isSimulating}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 p-4 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
            <RotateCcw className="h-6 w-6" />
            <span className="font-bold">Izquierda (I)</span>
          </button>
          
          <button onClick={() => addCommand('A')} disabled={isSimulating}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-indigo-50 p-4 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">
            <ArrowUp className="h-6 w-6" />
            <span className="font-bold">Avanzar (A)</span>
          </button>

          <button onClick={() => addCommand('D')} disabled={isSimulating}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-50 p-4 text-amber-700 hover:bg-amber-100 disabled:opacity-50">
            <RotateCw className="h-6 w-6" />
            <span className="font-bold">Derecha (D)</span>
          </button>
        </div>

        {/* Controles Secundarios */}
        <div className="flex gap-3">
          <button onClick={() => setCommands(c => c.slice(0, -1))} disabled={!commands || isSimulating}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <Undo2 className="h-4 w-4" /> Deshacer
          </button>
          <button onClick={() => setCommands('')} disabled={!commands || isSimulating}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:opacity-50">
            <Trash2 className="h-4 w-4" /> Limpiar
          </button>
        </div>

        {/* BOTÓN PRINCIPAL */}
        <button onClick={handleExecute} disabled={!commands || isSimulating}
          className="mt-auto flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 p-4 text-lg font-bold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-[0.98]">
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
      <div className="flex items-center justify-center rounded-2xl bg-gray-100 p-8 shadow-inner ring-1 ring-gray-200">
        
        {/* Tablero: Usamos grid CSS inverso para que (0,0) esté abajo-izquierda */}
        <div className="relative grid grid-cols-5 gap-2 p-4 bg-white rounded-xl shadow-2xl" 
             style={{ width: 'min(100%, 500px)', aspectRatio: '1/1' }}>
          
          {/* Renderizamos las 25 celdas */}
          {Array.from({ length: 5 }).map((_, rowInverse) => {
            const y = 4 - rowInverse // Invertimos Y para que 0 esté abajo
            return Array.from({ length: 5 }).map((_, x) => {
              
              // ¿Hay obstáculo aquí?
              const isObstacle = obstacles.some(o => o.x === x && o.y === y)
              // ¿Está el robot aquí?
              const isRobot = robotPos.x === x && robotPos.y === y

              return (
                <div key={`${x}-${y}`} 
                  className={classNames(
                    "relative flex items-center justify-center rounded-lg border-2 text-xs font-mono transition-all duration-300",
                    isObstacle ? "border-gray-400 bg-gray-200" : "border-gray-100 bg-gray-50"
                  )}
                >
                  {/* Coordenadas (Debug visual opcional) */}
                  <span className="absolute bottom-1 right-1 text-[10px] text-gray-300 select-none">
                    {x},{y}
                  </span>

                  {/* Icono Obstáculo */}
                  {isObstacle && <div className="h-3/4 w-3/4 bg-gray-800 rounded-md opacity-80" />}

                  {/* Icono Robot */}
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
  )
}