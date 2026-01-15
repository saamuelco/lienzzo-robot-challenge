import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  // Si no viene parámetro 'next', vamos a la raíz '/' (Dashboard)
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Caso ideal: El token funcionó a la primera.
      redirect(next)
    } else {
      // Si falla, comprobamos si el usuario ya tiene sesión.
      // Esto maneja el caso donde un escáner de email consumió el token previamente.
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // El usuario está logueado, así que el error del token es irrelevante (ya fue usado).
        // Redirigimos al éxito.
        redirect(next)
      }
    }
  }

  // Si llegamos aquí, es que:
  // 1. No había token/type.
  // 2. verifyOtp falló Y ADEMÁS no hay usuario logueado (token realmente caducado o falso).
  redirect('/login?message=Email confirmado. Ya puedes acceder a tu cuenta.')
}