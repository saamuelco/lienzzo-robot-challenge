'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculatePath } from './robotLogic'
import { Coordinates } from '@/types'

export async function saveSimulation(commands: string, obstacles: Coordinates[]) {
  const supabase = await createClient()

  // 1. Obtener usuario (Seguridad)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  // 2. Ejecutar lógica
  const result = calculatePath(commands, obstacles)

  // 3. Guardar en Base de Datos
  const { error } = await supabase.from('simulation').insert({
    user_id: user.id,
    commands: commands,
    obstacles: obstacles,
    final_x: result.finalX,
    final_y: result.finalY,
    execution_log: result.log // Guardamos el paso a paso
  })

  if (error) {
    console.error('Error guardando simulación:', error)
    throw new Error('Error al guardar la simulación')
  }

  // 4. Revalidar para actualizar historiales
  revalidatePath('/history')

  // 5. Devolver el resultado al frontend para la animación
  return result
}