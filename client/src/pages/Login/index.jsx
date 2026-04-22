import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Navigate, useNavigate } from 'react-router-dom'
import { FileText, Download, Shield, Clock, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const FEATURES = [
  { icon: FileText,  label: 'Cuentas de cobro, cotizaciones y contratos' },
  { icon: Download,  label: 'PDFs profesionales en segundos' },
  { icon: Clock,     label: 'Historial siempre disponible' },
  { icon: Shield,    label: 'Acceso seguro con Google' },
]

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  if (isAuthenticated) return <Navigate to='/dashboard' replace />

  const handleSuccess = async (cred) => {
    setError(''); setLoading(true)
    try {
      await loginWithGoogle(cred.credential)
      navigate('/dashboard')
    } catch (e) {
      setError(e?.response?.data?.error || 'Error al iniciar sesión. Intente de nuevo.')
    } finally { setLoading(false) }
  }

  return (
    <div className='min-h-[100dvh] flex flex-col lg:flex-row bg-[#F6F8FC]'>

      {/* ── Left panel (desktop only) ── */}
      <div className='hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-[#0F2040] px-12 py-14'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-[12px] bg-white/15 flex items-center justify-center'>
            <FileText size={20} className='text-white' />
          </div>
          <span className='text-white font-bold text-xl tracking-tight'>DocFlow</span>
        </div>

        {/* Center content */}
        <div>
          <h1 className='text-4xl font-bold text-white leading-snug mb-6 tracking-tight'>
            Documentos<br />profesionales,<br />
            <span className='text-blue-300'>sin complicaciones.</span>
          </h1>
          <p className='text-white/60 text-base leading-relaxed mb-10'>
            Genera PDFs listos para enviar en pocos clics. Sin formularios confusos, sin pasos innecesarios.
          </p>
          <ul className='space-y-4'>
            {FEATURES.map((f, i) => (
              <li key={i} className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-[8px] bg-blue-500/20 flex items-center justify-center flex-shrink-0'>
                  <f.icon size={16} className='text-blue-300' />
                </div>
                <span className='text-white/75 text-[15px]'>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className='text-white/30 text-xs'>© 2026 DocFlow · Leonardo Meza</p>
      </div>

      {/* ── Right panel / Mobile full screen ── */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-0'>

        {/* Mobile logo */}
        <div className='lg:hidden flex flex-col items-center mb-10'>
          <div className='w-16 h-16 rounded-[12px] bg-[#0F2040] flex items-center justify-center mb-4 shadow-lg'>
            <FileText size={28} className='text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>DocFlow</h1>
          <p className='text-gray-500 text-sm mt-1'>Documentos profesionales</p>
        </div>

        {/* Login card */}
        <div className='w-full max-w-sm'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>Bienvenido de nuevo</h2>
            <p className='text-gray-500 text-[15px] mt-2 leading-relaxed'>
              Ingrese con su cuenta de Google para acceder a sus documentos.
            </p>
          </div>

          {/* Features (mobile only) */}
          <div className='lg:hidden bg-[#F6F8FC] rounded-[12px] px-5 py-4 mb-6 space-y-3'>
            {FEATURES.map((f, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='w-7 h-7 rounded-[8px] bg-[#0F2040]/10 flex items-center justify-center flex-shrink-0'>
                  <f.icon size={14} className='text-[#0F2040]' />
                </div>
                <span className='text-gray-600 text-[13px] font-medium'>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Auth */}
          {loading ? (
            <div className='flex flex-col items-center py-8 gap-3'>
              <Loader2 className='w-10 h-10 animate-spin text-[#0F2040]' />
              <p className='text-gray-500 text-[15px]'>Verificando su cuenta...</p>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-4'>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Error de autenticación. Intente de nuevo.')}
                theme='outline'
                shape='rectangular'
                width={360}
                size='large'
                text='signin_with'
                locale='es'
              />
              <p className='text-gray-400 text-xs text-center leading-relaxed max-w-[280px]'>
                Su cuenta de Google se usa únicamente para identificarle de forma segura.
              </p>
            </div>
          )}

          {error && (
            <div className='mt-4 flex items-start gap-2.5 rounded-[12px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700'>
              <AlertCircle size={16} className='flex-shrink-0 mt-0.5' />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

