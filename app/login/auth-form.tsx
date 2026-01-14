'use client'

import { useState, useEffect } from 'react'
import { login, signUp } from '@/app/login/actions'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'

const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo 8 caracteres', regex: /.{8,}/ },
  { id: 'upper', label: 'Una mayúscula', regex: /[A-Z]/ },
  { id: 'lower', label: 'Una minúscula', regex: /[a-z]/ },
  { id: 'number', label: 'Un número', regex: /[0-9]/ },
]

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Estados para inputs controlados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estados de validación
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState(false)

  // Efecto unificado para validar en tiempo real
  useEffect(() => {
    // 1. Validar Email (Regex simple pero efectivo para frontend)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsEmailValid(emailRegex.test(email))

    // 2. Validar Contraseña
    if (mode === 'signup') {
      const allRulesPassed = PASSWORD_RULES.every((rule) => rule.regex.test(password))
      setIsPasswordValid(allRulesPassed)
    } else {
      // En login solo nos importa que no estén vacíos
      setIsPasswordValid(password.length > 0)
    }
  }, [email, password, mode])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    const action = mode === 'login' ? login : signUp
    await action(formData)
    setIsLoading(false)
  }

  // Lógica para deshabilitar el botón
  const isSubmitDisabled = 
    isLoading || 
    (mode === 'signup' && (!isEmailValid || !isPasswordValid)) ||
    (mode === 'login' && (!email || !password)) // En login al menos que haya texto

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="bg-gray-50 p-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-200/50 p-1">
          <button
            onClick={() => setMode('login')}
            className={`rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registrarse
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'login' ? 'Accede al simulador de robots' : 'Empieza a simular en segundos'}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {/* CAMPO EMAIL */}
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
              // Vinculamos estado
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Añadimos feedback visual simple (borde rojo si escribes y es inválido)
              className={`block w-full rounded-lg border-0 bg-gray-50 px-4 py-3 text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all ${
                email && !isEmailValid && mode === 'signup' 
                  ? 'ring-red-300 focus:ring-red-500' 
                  : 'ring-gray-200 focus:ring-indigo-600'
              }`}
            />
            {/* Mensaje de error sutil para email */}
            {mode === 'signup' && email && !isEmailValid && (
              <p className="mt-1 text-xs text-red-500">Introduce un email válido</p>
            )}
          </div>
          
          {/* CAMPO PASSWORD */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border-0 bg-gray-50 px-4 py-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* CHECKLIST PASSWORD (Solo Signup) */}
          {mode === 'signup' && (
            <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-xs transition-all">
              <p className="font-medium text-gray-500 mb-2">La contraseña debe contener:</p>
              <div className="grid grid-cols-2 gap-2">
                {PASSWORD_RULES.map((rule) => {
                  const isValid = rule.regex.test(password)
                  return (
                    <div 
                      key={rule.id} 
                      className={`flex items-center gap-1.5 transition-colors duration-200 ${
                        isValid ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {isValid ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mx-1" />
                      )}
                      <span>{rule.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* BOTÓN SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : mode === 'login' ? (
              'Entrar'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button onClick={() => setMode('signup')} className="font-semibold text-indigo-600 hover:text-indigo-500">
                Regístrate gratis
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setMode('login')} className="font-semibold text-indigo-600 hover:text-indigo-500">
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}