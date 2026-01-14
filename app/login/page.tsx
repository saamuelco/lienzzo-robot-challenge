import AuthForm from '@/app/login/auth-form'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; message?: string }>
}) {
  // Obtenemos los parámetros de la URL (Next.js 15 requires await)
  const { success, error, message } = await searchParams

  // Unificamos 'message' (genérico) con 'success' si es necesario
  const successMessage = success || message

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      
      {/* Título / Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Lienzzo<span className="text-indigo-600">.bot</span>
        </h1>
      </div>

      {/* ALERTAS FLOTANTES (Feedback al usuario) */}
      <div className="w-full max-w-md mb-6 space-y-4">
        
        {/* Caso: ÉXITO (Registro correcto) */}
        {successMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 shadow-sm animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">¡Operación exitosa!</h3>
              <p className="text-sm text-green-700 mt-1 leading-relaxed">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Caso: ERROR (Login fallido o error servidor) */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Ha ocurrido un error</h3>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formulario de Login/Registro */}
      <AuthForm />

    </div>
  )
}