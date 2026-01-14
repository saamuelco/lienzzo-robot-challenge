'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// --- HELPER FUNCTIONS ---

function validateEmail(email: string): boolean {
  // Regex estándar para emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password: string): boolean {
  // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

// --- MAIN ACTIONS ---

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=Credenciales incorrectas o email no confirmado.')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Validar Email
  if (!validateEmail(email)) {
    return redirect(`/login?error=${encodeURIComponent('El formato del email no es válido.')}`)
  }

  // 2. Validar Contraseña
  if (!validatePassword(password)) {
    return redirect(
      `/login?error=${encodeURIComponent(
        'La contraseña es débil. Requiere 8 caracteres, mayúscula, minúscula y número.'
      )}`
    )
  }

  // 3. Proceder con el registro
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect(
    '/login?success=Registro exitoso. Por favor, confirma tu email para activar tu cuenta.'
  )
}
