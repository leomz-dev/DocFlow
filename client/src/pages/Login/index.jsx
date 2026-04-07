import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const FEATURES = [
  'Genera PDFs profesionales en segundos',
  'Historial completo de documentos',
  'Datos de empresa pre-cargados en cada PDF',
]

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleGoogleSuccess = async (credentialResponse) => {
    setServerError('')
    setIsProcessing(true)
    try {
      await loginWithGoogle(credentialResponse.credential)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.error || 'Error al iniciar sesión con Google.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGoogleError = () => {
    setServerError('Error en la autenticación de Google. Inténtalo de nuevo.')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-primary p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 -translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <FileText size={20} className="text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-widest uppercase">Docflow</span>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Su asistente digital<br />para documentos.
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            Acceda a su historial, facturas y contratos con la simplicidad y seguridad que usted merece.
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-white/60 shrink-0" />
                <span className="text-white/75 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2026 DocFlow | Leonardo Meza. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* ── Right: Login ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-primary-foreground" />
            </div>
            <span className="font-black text-base tracking-widest uppercase text-foreground">Docflow</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido</h2>
            <p className="text-muted-foreground text-sm">Gestiona tus documentos de forma segura con Google</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* Google Login Button Container */}
            <div className="w-full flex justify-center py-4">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm">Verificando cuenta...</p>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                  width="100%"
                  size="large"
                  text="signin_with"
                />
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="w-full flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive mt-2">
                <AlertCircle size={15} className="shrink-0" />
                {serverError}
              </div>
            )}
          </div>

          {/* Login Note */}
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Al iniciar sesión, aceptas nuestra política de privacidad y el uso de tu cuenta de Google solo para fines de autenticación en la plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
