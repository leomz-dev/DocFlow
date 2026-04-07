import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Receipt, ScrollText, FileSignature,
  History, Loader2, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getHistory } from '@/api/documents.api'
import { ClientManager } from '@/components/ClientManager'
import { cn } from '@/lib/utils'

/* ── Document type metadata ─────────────────────── */
const DOC_ACTIONS = [
  {
    title: 'Nueva Cuenta de Cobro',
    path:  '/new/cuenta-cobro',
    icon:  Receipt,
    bgClass: 'bg-[#002f87] text-white hover:bg-[#00266e]',
    iconBg: 'bg-white/10',
    arrowClass: 'text-white/40'
  },
  {
    title: 'Nueva Cotización',
    path:  '/new/cotizacion',
    icon:  ScrollText,
    bgClass: 'bg-white border border-outline-variant/20 text-on-surface hover:bg-surface-container-low hover:border-primary/20',
    iconBg: 'bg-surface-container-low',
    arrowClass: 'text-outline/30'
  },
  {
    title: 'Nuevo Contrato',
    path:  '/new/contrato',
    icon:  FileSignature,
    bgClass: 'bg-white border border-outline-variant/20 text-on-surface hover:bg-surface-container-low hover:border-primary/20',
    iconBg: 'bg-surface-container-low',
    arrowClass: 'text-outline/30'
  },
]

const TYPE_META = {
  'cuenta-cobro': { label: 'CUENTA COBRO', color: 'bg-blue-50 text-[#002f87]', icon: Receipt, iconColor: 'text-[#002f87]', iconBg: 'bg-blue-100/50' },
  'cotizacion':   { label: 'COTIZACIÓN',   color: 'bg-amber-50 text-amber-900',  icon: ScrollText, iconColor: 'text-amber-700', iconBg: 'bg-amber-100/50' },
  'contrato':     { label: 'CONTRATO',     color: 'bg-emerald-50 text-emerald-900', icon: FileSignature, iconColor: 'text-emerald-700', iconBg: 'bg-emerald-100/50' },
}

/* ── Recent activity item ────────────────────────── */
function ActivityItem({ doc }) {
  const meta = TYPE_META[doc.type] ?? { label: 'DOCUMENTO', color: 'bg-surface-container-high text-on-surface-variant', icon: FileText, iconColor: 'text-outline', iconBg: 'bg-slate-50' }
  const Icon = meta.icon
  const navigate = useNavigate()

  return (
    <div 
      onClick={() => navigate('/history')}
      className="flex items-center justify-between p-3.5 border-t border-surface-container/30 transition-colors hover:bg-surface-container-low cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", meta.iconBg, meta.iconColor)}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[13px] font-bold text-on-surface leading-tight">{doc.number} - {doc.clientName || 'Sin Cliente'}</p>
          <p className="text-[10px] text-outline font-medium mt-0.5">{new Date(doc.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0", meta.color)}>
        {meta.label}
      </span>
    </div>
  )
}

/* ── Page ────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, company } = useAuth()
  const navigate = useNavigate()
  const [allDocs, setAllDocs]         = useState([])
  const [recentDocs, setRecentDocs]   = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [docsError, setDocsError]     = useState(null)

  const displayName = company?.legalRep?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'aquí'

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getHistory()
        setAllDocs(data)
        setRecentDocs(data.slice(0, 5))
      } catch {
        setDocsError('No se pudo cargar la actividad.')
      } finally {
        setLoadingDocs(false)
      }
    }
    fetchRecent()
  }, [])

  return (
    <div className="animate-fade-in w-full pb-20">
      
      {/* ── Header ── */}
      <section className="mb-10 px-1">
        <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-3 font-sans opacity-70">Resumen General</p>
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight font-sans leading-tight">
          Bienvenido, <span className="text-primary">{displayName}</span>
        </h2>
      </section>

      {/* ── KPI Grid ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-surface-lg flex flex-col justify-between border-l-4 border-primary">
          <div>
            <span className="text-[11px] font-semibold text-outline tracking-wider uppercase mb-2 block">Total Docs</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-sans">{loadingDocs ? '--' : allDocs.length}</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-surface-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-outline tracking-wider uppercase mb-2 block">Cuentas Cobro</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-sans">{loadingDocs ? '--' : allDocs.filter(d => d.type === 'cuenta-cobro').length}</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-surface-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-outline tracking-wider uppercase mb-2 block">Cotizaciones</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-sans">{loadingDocs ? '--' : allDocs.filter(d => d.type === 'cotizacion').length}</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-surface-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-outline tracking-wider uppercase mb-2 block">Contratos</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-sans">{loadingDocs ? '--' : allDocs.filter(d => d.type === 'contrato').length}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Quick Actions */}
          <section>
            <h3 className="text-sm font-bold text-on-surface-variant mb-4 flex items-center gap-2 font-sans uppercase tracking-wide">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DOC_ACTIONS.map(action => (
                <button 
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={cn("w-full flex items-center justify-between p-4 rounded-2xl transition-transform active:scale-[0.98] cursor-pointer shadow-surface-sm", action.bgClass)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.iconBg)}>
                      <action.icon size={20} />
                    </div>
                    <span className="font-semibold text-sm font-sans">{action.title}</span>
                  </div>
                  <ChevronRight size={20} className={action.arrowClass} />
                </button>
              ))}
            </div>
          </section>

          {/* Client Manager Integration */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2 font-sans uppercase tracking-widest">
                <span className="w-1.5 h-4 bg-secondary rounded-full"></span>
                Directorio de Clientes
              </h3>
              <button 
                onClick={() => navigate('/clients')}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Expandir
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-surface-md border border-outline-variant/5 overflow-hidden p-5">
              <ClientManager compact={true} />
            </div>
          </section>
        </div>

        {/* Right Column (Recent Activity) */}
        <div>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2 font-sans uppercase tracking-wide">
                <span className="w-1 h-4 bg-tertiary rounded-full"></span>
                Actividad
              </h3>
              <button 
                onClick={() => navigate('/history')}
                className="text-primary font-semibold text-sm hover:underline"
              >
                Ver todo
              </button>
            </div>
            
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-surface-lg">
              {loadingDocs ? (
                <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : docsError ? (
                <div className="p-6 text-center text-error text-sm font-medium">{docsError}</div>
              ) : recentDocs.length === 0 ? (
                <div className="p-8 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full text-outline">
                    <History size={24} />
                  </div>
                  <p className="text-sm font-semibold text-on-surface">Aún no hay documentos</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {recentDocs.map(doc => (
                    <ActivityItem key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

    </div>
  )
}
