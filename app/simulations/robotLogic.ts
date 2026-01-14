import { Coordinates, Direction, SimulationStep } from '@/types'

const GRID_SIZE = 5;

// Orden de direcciones en sentido horario: N -> E -> S -> W
const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];

/**
 * Verifica si una posición está dentro del tablero y libre de obstáculos
 */
function isValidPosition(x: number, y: number, obstacles: Coordinates[]): boolean {
  // 1. Verificar límites del tablero (0 a 4)
  const isInsideGrid = x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  if (!isInsideGrid) return false;

  // 2. Verificar obstáculos
  // Usamos .some() para ver si alguna coordenada de obstáculo coincide con la posición actual
  const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
  
  return !isObstacle;
}

/**
 * Calcula el siguiente paso basado en la dirección actual
 */
function getNextPosition(x: number, y: number, dir: Direction): Coordinates {
  switch (dir) {
    case 'N': return { x, y: y + 1 }; // Arriba
    case 'S': return { x, y: y - 1 }; // Abajo
    case 'E': return { x: x + 1, y }; // Derecha
    case 'W': return { x: x - 1, y }; // Izquierda
  }
}

/**
 * Función Principal: Procesa la secuencia completa
 */
export function calculatePath(
  commands: string, 
  obstacles: Coordinates[]
) {
  // Estado inicial
  let x = 0;
  let y = 0;
  let dir: Direction = 'N'; // Asumimos que siempre empieza mirando al Norte

  const log: SimulationStep[] = [];

  // Agregamos el estado inicial al log (Paso 0)
  log.push({
    stepIndex: 0,
    x,
    y,
    dir,
    action: 'START'
  });

  // Iteramos sobre cada letra del comando
  const commandList = commands.toUpperCase().split('');

  commandList.forEach((command, index) => {
    const currentStepIndex = index + 1;
    let action: SimulationStep['action'] = 'INVALID_MOVE'; // Por defecto

    if (command === 'A') {
      // Calcular intento de movimiento
      const next = getNextPosition(x, y, dir);

      if (isValidPosition(next.x, next.y, obstacles)) {
        // Movimiento exitoso: actualizamos posición
        x = next.x;
        y = next.y;
        action = 'MOVE';
      } else {
        // Colisión: NO actualizamos x/y, pero registramos el intento fallido
        // El enunciado dice: "el movimiento falla, continúa con el siguiente"
        action = 'INVALID_MOVE'; 
      }

    } else if (command === 'D' || command === 'I') {
      // Lógica de Rotación
      const currentDirIndex = DIRECTIONS.indexOf(dir);
      
      if (command === 'D') {
        // Derecha: Sumar 1 al índice (con módulo 4 para dar la vuelta)
        const newIndex = (currentDirIndex + 1) % 4;
        dir = DIRECTIONS[newIndex];
        action = 'RIGHT';
      } else {
        // Izquierda: Restar 1. Si es negativo, sumamos 4 para corregir el ciclo
        const newIndex = (currentDirIndex - 1 + 4) % 4;
        dir = DIRECTIONS[newIndex];
        action = 'LEFT';
      }
    }

    // Guardamos el estado DESPUÉS de ejecutar (o fallar) el comando
    log.push({
      stepIndex: currentStepIndex,
      x,
      y,
      dir,
      action
    });
  });

  return {
    finalX: x,
    finalY: y,
    finalDir: dir,
    log, // Esto es lo que usará el frontend para la animación
  };
}