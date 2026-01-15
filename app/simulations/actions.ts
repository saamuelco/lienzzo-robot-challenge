'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
// Asegúrate de que la ruta a tu lógica sea correcta
import { calculatePath } from '@/app/simulations/robotLogic' 
import { Coordinates } from '@/types'

export async function saveSimulation(commands: string, obstacles: Coordinates[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const result = calculatePath(commands, obstacles)

  // CAMBIO AQUÍ: Añadimos .select().single() para obtener el dato insertado
  const { data, error } = await supabase.from('simulation').insert({
    user_id: user.id,
    commands: commands,
    obstacles: obstacles,
    final_x: result.finalX,
    final_y: result.finalY,
    // is_success: result.isSuccess, // (Si lo quitaste de BD, quita esta línea)
    execution_log: result.log
  })
  .select('id') // <--- IMPORTANTE: Pedimos que nos devuelva el ID
  .single()

  if (error) {
    console.error('Error guardando simulación:', error)
    throw new Error('Error al guardar la simulación')
  }

  revalidatePath('/history')

  // Devolvemos el resultado del cálculo Y el ID de la base de datos
  return { 
    ...result, 
    dbId: data.id // Necesario para visualizar la simulación directamente
  }
}