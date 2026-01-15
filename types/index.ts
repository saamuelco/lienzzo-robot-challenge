// types/index.ts

// Direcciones posibles (Norte, Sur, Este, Oeste)
export type Direction = 'N' | 'S' | 'E' | 'W';

// Coordenadas X, Y
export interface Coordinates {
  x: number;
  y: number;
}

// Estado básico del robot
export interface RobotState extends Coordinates {
  dir: Direction;
}

// Un paso individual en el log (para la animación posterior)
export interface SimulationStep extends RobotState {
  stepIndex: number;
  action: 'START' | 'MOVE' | 'LEFT' | 'RIGHT' | 'INVALID_MOVE';
}

// La estructura completa de una simulación (lo que guardamos en la BD)
export interface Simulation {
  id: string;
  created_at: string;
  commands: string;
  final_x: number;
  final_y: number;
  execution_log: SimulationStep[]; 
  obstacles: Coordinates[];
  //user??
}