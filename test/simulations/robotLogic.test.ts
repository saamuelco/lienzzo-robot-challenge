import { describe, it, expect } from 'vitest'
import { calculatePath } from '@/app/simulations/robotLogic' // Ajusta la ruta si es necesario
import { Coordinates } from '@/types'

describe('Robot Logic - calculatePath', () => {

  // --- ESTADO INICIAL Y MOVIMIENTO BÁSICO ---
  describe('Basic Movement', () => {
    it('should start at (0,0) facing North', () => {
      const result = calculatePath('', [])
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(0)
      expect(result.finalDir).toBe('N')
      expect(result.log).toHaveLength(1) // Solo el estado inicial 'START'
    })

    it('should move North correctly', () => {
      // Comando: Avanzar (A)
      const result = calculatePath('A', [])
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(1)
      expect(result.finalDir).toBe('N')
      expect(result.log[1].action).toBe('MOVE')
    })

    it('should handle multiple forward moves', () => {
      // Avanzar 3 veces
      const result = calculatePath('AAA', [])
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(3)
    })
  })

  // --- ROTACIONES (DERECHA E IZQUIERDA) ---
  describe('Rotations', () => {
    it('should rotate Right (Clockwise) correctly', () => {
      // N -> E -> S -> W -> N
      let result = calculatePath('D', [])
      expect(result.finalDir).toBe('E')

      result = calculatePath('DD', [])
      expect(result.finalDir).toBe('S')

      result = calculatePath('DDD', [])
      expect(result.finalDir).toBe('W')

      result = calculatePath('DDDD', [])
      expect(result.finalDir).toBe('N')
    })

    it('should rotate Left (Counter-Clockwise) correctly', () => {
      // N -> W -> S -> E -> N
      let result = calculatePath('I', [])
      expect(result.finalDir).toBe('W')

      result = calculatePath('II', [])
      expect(result.finalDir).toBe('S')

      result = calculatePath('III', [])
      expect(result.finalDir).toBe('E')

      result = calculatePath('IIII', [])
      expect(result.finalDir).toBe('N')
    })
  })

  // --- MOVIMIENTO TRAS GIROS ---
  describe('Movement after Rotation (All Directions)', () => {
      
    // NORTE -> ESTE (Original)
    it('should rotate Right (East) and move', () => {
      // Inicio (0,0) N -> Girar D (Este) -> Avanzar
      const result = calculatePath('DA', [])
        
      expect(result.finalX).toBe(1)
      expect(result.finalY).toBe(0)
      expect(result.finalDir).toBe('E')
    })

    // NORTE -> SUR
    it('should rotate to South and move (requires moving North first)', () => {
      // Estrategia: 
      // 1. 'A': Subir a (0,1)
      // 2. 'DD': Girar 180º (Sur)
      // 3. 'A': Bajar a (0,0)
      const result = calculatePath('ADDA', [])
    
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(0) // Ha vuelto al origen
      expect(result.finalDir).toBe('S')
    })

    // ESTE -> OESTE
    it('should rotate to West and move (requires moving East first)', () => {
      // Estrategia:
      // 1. 'DA': Mirar Este y avanzar a (1,0)
      // 2. 'II': Girar 180º (Oeste)
      // 3. 'A': Volver a (0,0)
      const result = calculatePath('DAIIA', [])
    
      expect(result.finalX).toBe(0) // Ha vuelto al origen
      expect(result.finalY).toBe(0)
      expect(result.finalDir).toBe('W')
    })

    // EL CUADRADO COMPLETO (Prueba de integración de movimiento)
    it('should complete a full square path (N -> E -> S -> W)', () => {
      // Ruta: (0,0) -> (0,1) -> (1,1) -> (1,0) -> (0,0)
      // A (Norte), D (Este), A (Avanza), D (Sur), A (Baja), D (Oeste), A (Vuelve)
      const result = calculatePath('ADADADA', [])
    
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(0)
      expect(result.finalDir).toBe('W') // Termina mirando al Oeste tras el último giro
    })
    })

  // --- LÍMITES DEL TABLERO (5x5) ---
  describe('Grid Boundaries (Walls)', () => {
    it('should not go further North than y=4', () => {
      // Intentar avanzar 6 veces
      const result = calculatePath('AAAAA', [])
      
      expect(result.finalY).toBe(4) // Se queda en el límite
      expect(result.log[result.log.length - 1].action).toBe('INVALID_MOVE') // El último intento falla
    })

    it('should not go South from (0,0)', () => {
      // Girar 180 (DD) y Avanzar (A)
      const result = calculatePath('DDA', [])
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(0) // No se mueve
      expect(result.log[result.log.length - 1].action).toBe('INVALID_MOVE')
    })

    it('should not go West from (0,0)', () => {
      // Girar Izq (I) y Avanzar (A)
      const result = calculatePath('IA', [])
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(0)
      expect(result.log[result.log.length - 1].action).toBe('INVALID_MOVE')
    })

    it('should not go East from x=4', () => {
      // Girar Der (D) y avanzar 5 veces
      const result = calculatePath('DAAAAA', [])
      
      expect(result.finalX).toBe(4)
      expect(result.finalY).toBe(0)
      expect(result.log[result.log.length - 1].action).toBe('INVALID_MOVE')
    })

    it('should not go North from y=4', () => {
      // Avanzar 6 veces
      const result = calculatePath('AAAAA', [])
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(4)
      expect(result.log[result.log.length - 1].action).toBe('INVALID_MOVE')
    })
  })

  // --- OBSTÁCULOS ---
  describe('Obstacles Interaction', () => {
    it('should detect an obstacle and not move', () => {
      const obstacles: Coordinates[] = [{ x: 0, y: 1 }]
      
      // Intentar avanzar hacia el obstáculo
      const result = calculatePath('A', obstacles)
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(0) // Se queda en el sitio
      expect(result.log[result.log.length - 1].action).toBe('INVALID_MOVE')
    })

    it('should allow movement around obstacles', () => {
      // Obstáculo en (0,1).
      // Ruta: Girar Der (D), Avanzar (A) -> (1,0), Girar Izq (I), Avanzar (A) -> (1,1)
      // Esquivando el obstáculo
      const obstacles: Coordinates[] = [{ x: 0, y: 1 }]
      const result = calculatePath('DAIA', obstacles)
      
      expect(result.finalX).toBe(1)
      expect(result.finalY).toBe(1)
      expect(result.finalDir).toBe('N')
    })

    it('should handle multiple obstacles', () => {
      // Encerrado por obstáculos en (0,1) y (1,0)
      const obstacles: Coordinates[] = [{ x: 0, y: 1 }, { x: 1, y: 0 }]
      
      // Intentar ir al Norte (Choque) y luego al Este (Choque)
      const result = calculatePath('ADA', obstacles)
      
      expect(result.finalX).toBe(0)
      expect(result.finalY).toBe(0)
      expect(result.log[1].action).toBe('INVALID_MOVE')
      expect(result.log[result.log.length - 1].action).toBe('INVALID_MOVE')
    })
  })

  // --- ROBUSTEZ Y CASOS DE BORDE ---
  describe('Robustness & Edge Cases', () => {
    it('should handle lowercase commands', () => {
      // 'a' debería funcionar igual que 'A'
      const result = calculatePath('aai', [])
      
      expect(result.finalY).toBe(2)
      expect(result.finalDir).toBe('W')
    })

    it('should handle mixed complex sequence', () => {
      // Una ruta tipo "escalera"
      // A (0,1) -> D -> A (1,1) -> I -> A (1,2)
      const result = calculatePath('ADAIA', [])
      
      expect(result.finalX).toBe(1)
      expect(result.finalY).toBe(2)
    })

    it('should ignore or handle invalid characters gracefully', () => {
      // Si metemos caracteres raros, no debería explotar.
      // Según tu código actual, si no es A, D o I, cae en el else,
      // no actualiza posición pero loguea 'INVALID_MOVE' (o similar según implementación).
      // Probamos que el estado se mantenga.
      const result = calculatePath('AXA', []) // X es inválido
      
      expect(result.finalY).toBe(2) // Las dos A funcionan
      // La X intermedia no debe mover al robot
    })
  })

// --- 6. VALIDACIÓN DEL LOG (Importante para el Replay) ---
  describe('Execution Log', () => {
    it('should log left turns, wall collisions, and obstacle collisions correctly', () => {
      // Configuración del escenario:
      // Obstáculo en (0, 2).
      // Comandos: 
      // 1. 'I' -> Gira Oeste
      // 2. 'A' -> Choca pared Oeste
      // 3. 'D' -> Gira Norte
      // 4. 'A' -> Avanza a (0,1)
      // 5. 'A' -> Choca obstáculo en (0,2)
      const obstacles = [{ x: 0, y: 2 }]
      const result = calculatePath('IADAA', obstacles)
      
      // El log debe tener 1 (Start) + 5 pasos = 6 entradas
      expect(result.log).toHaveLength(6)

      // Paso 0: Inicio
      expect(result.log[0]).toEqual({
        stepIndex: 0, x: 0, y: 0, dir: 'N', action: 'START'
      })

      // Paso 1: Giro a la IZQUIERDA ('I')
      // Debe cambiar dirección a 'W' y registrar acción 'LEFT'
      expect(result.log[1]).toEqual({
        stepIndex: 1, x: 0, y: 0, dir: 'W', action: 'LEFT'
      })

      // Paso 2: Choque con BORDE ('A' hacia el Oeste desde x=0)
      // Posición no cambia, dirección se mantiene, acción es 'INVALID_MOVE'
      expect(result.log[2]).toEqual({
        stepIndex: 2, x: 0, y: 0, dir: 'W', action: 'INVALID_MOVE'
      })

      // Paso 3: Giro a la Derecha ('D') - Recuperación
      expect(result.log[3]).toEqual({
        stepIndex: 3, x: 0, y: 0, dir: 'N', action: 'RIGHT'
      })

      // Paso 4: Movimiento Válido ('A')
      expect(result.log[4]).toEqual({
        stepIndex: 4, x: 0, y: 1, dir: 'N', action: 'MOVE'
      })

      // Paso 5: Choque con OBSTÁCULO ('A' hacia (0,2))
      // Posición se queda en (0,1), acción es 'INVALID_MOVE'
      expect(result.log[5]).toEqual({
        stepIndex: 5, x: 0, y: 1, dir: 'N', action: 'INVALID_MOVE'
      })
    })
  })

})