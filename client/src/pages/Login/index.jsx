import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

const FEATURES = [
  'Genera PDFs profesionales en segundos',
  'Historial completo de documentos',
  'Datos de empresa pre-cargados en cada PDF',
]

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.error || 'Error de conexión. Intenta de nuevo.')
    }
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

      {/* ── Right: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-primary-foreground" />
            </div>
            <span className="font-black text-base tracking-widest uppercase text-foreground">Docflow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground text-sm">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@docflow.co"
                autoComplete="email"
                className={cn("h-10", errors.email && "border-destructive focus-visible:ring-destructive")}
                {...register('email')}
              />
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn("h-10 pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle size={15} className="shrink-0" />
                {serverError}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full h-10 gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Ingresando...</>
              ) : (
                <>Acceder a mi cuenta <ArrowRight size={15} /></>
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Acceso demo:{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">admin@docflow.co</code>
              {' / '}
              <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
