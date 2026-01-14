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
      // Éxito: Redirigimos al dashboard (o donde diga 'next')
      redirect(next)
    }
  }

  // ERROR: Si el token es inválido o hubo error, NO vamos a una página 404.
  // Volvemos al login explicando qué pasó.
  redirect('/login?error=El enlace de confirmación es inválido o ha caducado.')
}