'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Simulation } from '@/types'

export async function getRecentSimulations(limit = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('simulation')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false})
    .limit(limit)

  return (data as unknown as Simulation[]) || []
}

export async function deleteSimulation(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('simulation')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Error al borrar la simulación')
  }

  // Revalidamos para que si el usuario recarga la página, los datos estén actualizados
  revalidatePath('/history')
}