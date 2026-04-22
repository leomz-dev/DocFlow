import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Receipt, ScrollText, FileSignature,
  ChevronRight, Loader2, AlertTriangle,
  Settings, ArrowUpRight, FileText, History
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getHistory } from '@/api/documents.api'
import { cn } from '@/lib/utils'

/* ─── Doc type config ───────────────────────────────── */
const DOC_ACTIONS = [
  {
    title:   'Cuenta de Cobro',
    desc:    'Para cobrar un servicio prestado',
    path:    '/new/cuenta-cobro',
    icon:    Receipt,
    primary: true,
  },
  {
    title:   'Cotización',
    desc:    'Propuesta de precio',
    path:    '/new/cotizacion',
    icon:    ScrollText,
    iconColor: '#D97706',
    iconBg:    '#FFFBEB',
    primary: false,
  },
  {
    title:   'Contrato',
    desc:    'Formalizar un acuerdo',
    path:    '/new/contrato',
    icon:    FileSignature,
    iconColor: '#7C3AED',
    iconBg:    '#F5F3FF',
    primary: false,
  },
]

const TYPE_META = {
  'cuenta-cobro': { label: 'Cuenta de Cobro', color: 'text-blue-700 bg-blue-50',     icon: Receipt },
  'cotizacion':   { label: 'Cotización',       color: 'text-amber-700 bg-amber-50',   icon: ScrollText },
  'contrato':     { label: 'Contrato',         color: 'text-violet-700 bg-violet-50', icon: FileSignature },
}

/* ─── Recent doc row ─────────────────────────────────── */
function DocRow({ doc }) {
  const meta = TYPE_META[doc.type] ?? { label: 'Documento', color: 'text-gray-600 bg-gray-100', icon: FileText }
  const Icon = meta.icon
  const date = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(new Date(doc.createdAt))

  return (
    <div className='flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 hover:bg-gray-50/80 transition-colors'>
      <div
        className={cn('w-8 h-8 rounded-[12px] flex items-center justify-center flex-shrink-0', meta.color)}
        aria-hidden='true'
      >
        <Icon size={15} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[13.5px] font-bold text-gray-900 leading-tight truncate'>
          {doc.number ?? 'Sin número'}
        </p>
        <p className='text-[12px] text-gray-400 mt-0.5 truncate'>
          {doc.clientName || 'Sin cliente'}
          <span className='mx-1.5 text-gray-300' aria-hidden='true'>·</span>
          <time dateTime={doc.createdAt}>{date}</time>
        </p>
      </div>
      <span className={cn('badge text-[11px] flex-shrink-0', meta.color)}>
        {meta.label}
      </span>
    </div>
  )
}

/* ─── Onboarding banner ──────────────────────────────── */
function OnboardingBanner({ navigate }) {
  return (
    <div
      role='alert'
      className='slide-up delay-1 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[12px] px-4 py-4'
    >
      <div className='w-8 h-8 rounded-[12px] bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5' aria-hidden='true'>
        <AlertTriangle size={16} className='text-amber-600' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[14px] font-bold text-amber-900'>Falta configurar su empresa</p>
        <p className='text-[13px] text-amber-700 mt-0.5 leading-snug'>
          Agregue su nombre, NIT y dirección para que aparezcan en los PDFs.
        </p>
        <button
          onClick={() => navigate('/settings')}
          className='inline-flex items-center gap-1.5 text-amber-800 font-bold text-[13px] mt-2 underline underline-offset-2 hover:text-amber-950 transition-colors'
        >
          <Settings size={13} aria-hidden='true' />
          Configurar ahora
        </button>
      </div>
    </div>
  )
}

/* ─── Dashboard ──────────────────────────────────────── */
export default function DashboardPage() {
  const { user, company } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const firstName    = company?.legalRep?.split(' ')[0] || user?.name?.split(' ')[0] || ''
  const companyReady = !!(company?.name && company?.nit)
  const hour         = new Date().getHours()
  const greeting     = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    getHistory()
      .then(d => setDocs(d.slice(0, 5)))
      .catch(() => setError('No se pudo cargar el historial'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='fade-in space-y-6'>

      {/* ── Greeting ── */}
      <header className='slide-up'>
        <p className='text-[13px] text-gray-400 font-medium'>{greeting},</p>
        <h1
          className='text-[28px] font-bold text-gray-900 tracking-tight capitalize leading-[1.2]'
          style={{ textWrap: 'balance' }}
        >
          {firstName || 'Bienvenido'}
        </h1>
      </header>

      {/* ── Onboarding ── */}
      {!companyReady && <OnboardingBanner navigate={navigate} />}

      {/* ── Doc count chip — only if docs exist ── */}
      {docs.length > 0 && !loading && (
        <div className='slide-up delay-1 flex items-center gap-2'>
          <div className='inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm'>
            <span className='w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0' aria-hidden='true' />
            <span className='text-[13px] font-bold text-gray-700 tabular'>
              {docs.length >= 5 ? '5 o más' : docs.length} documento{docs.length !== 1 ? 's' : ''} recientes
            </span>
          </div>
        </div>
      )}

      {/* ── Create new ── */}
      <section aria-labelledby='create-heading' className='slide-up delay-1'>
        <h2 id='create-heading' className='section-label mb-3'>Crear nuevo</h2>

        {/* Primary CTA */}
        <button
          onClick={() => navigate(DOC_ACTIONS[0].path)}
          className='w-full flex items-center gap-4 p-5 rounded-[12px] bg-[#0F2040] text-white mb-3 transition-all duration-150 active:scale-[0.985] hover:bg-[#1A3460] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2040] focus-visible:ring-offset-2'
          style={{ boxShadow: '0 6px 20px -3px rgba(15,32,64,0.28)' }}
        >
          <div className='w-10 h-10 rounded-[12px] bg-white/[0.12] flex items-center justify-center flex-shrink-0' aria-hidden='true'>
            <Receipt size={21} className='text-white' />
          </div>
          <div className='flex-1 text-left min-w-0'>
            <p className='text-[16px] font-bold leading-tight'>Cuenta de Cobro</p>
            <p className='text-white/55 text-[13px] mt-0.5'>Para cobrar un servicio prestado</p>
          </div>
          <ChevronRight size={19} className='text-white/30 flex-shrink-0' aria-hidden='true' />
        </button>

        {/* Secondary 2-col */}
        <div className='grid grid-cols-2 gap-3'>
          {DOC_ACTIONS.slice(1).map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className='card-action flex flex-col items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2040] focus-visible:ring-offset-2'
            >
              <div
                className='w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0'
                style={{ background: a.iconBg }}
                aria-hidden='true'
              >
                <a.icon size={18} style={{ color: a.iconColor }} />
              </div>
              <div>
                <p className='text-[14px] font-bold text-gray-900 leading-tight'>{a.title}</p>
                <p className='text-[12px] text-gray-400 mt-0.5 leading-snug'>{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Recent docs ── */}
      <section aria-labelledby='recent-heading' className='slide-up delay-2'>
        <div className='flex items-center justify-between mb-3'>
          <h2 id='recent-heading' className='section-label'>Recientes</h2>
          <button
            onClick={() => navigate('/history')}
            className='inline-flex items-center gap-1 text-[#0F2040] font-bold text-[13px] hover:opacity-65 transition-opacity'
          >
            Ver todos <ArrowUpRight size={14} aria-hidden='true' />
          </button>
        </div>

        <div className='card overflow-hidden'>
          {loading && (
            <div className='flex flex-col items-center py-12 gap-3 text-gray-300' aria-live='polite' aria-label='Cargando documentos'>
              <Loader2 size={28} className='animate-spin' aria-hidden='true' />
              <p className='text-[13px] text-gray-400'>Cargando…</p>
            </div>
          )}

          {!loading && error && (
            <div className='p-5 text-[13px] text-red-600 font-semibold' role='alert'>{error}</div>
          )}

          {!loading && !error && docs.length === 0 && (
            <div className='flex flex-col items-center py-12 gap-3 text-center px-6'>
              <div className='w-11 h-11 bg-gray-100 rounded-[12px] flex items-center justify-center' aria-hidden='true'>
                <History size={22} className='text-gray-300' />
              </div>
              <div>
                <p className='text-[14px] font-bold text-gray-600'>Sin documentos aún</p>
                <p className='text-[13px] text-gray-400 mt-1 leading-snug'>
                  Use los botones de arriba para crear el primero.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && docs.length > 0 && (
            <>
              {docs.map(doc => <DocRow key={doc.id} doc={doc} />)}
              <div className='border-t border-gray-100'>
                <button
                  onClick={() => navigate('/history')}
                  className='w-full flex items-center justify-center gap-2 py-3 text-[13px] font-bold text-[#0F2040] hover:bg-gray-50 transition-colors'
                >
                  Ver historial completo <ArrowUpRight size={14} aria-hidden='true' />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

