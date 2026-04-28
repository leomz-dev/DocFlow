import { useEffect, useState } from 'react'
import { FileText, Download, Trash2, Loader2, AlertCircle, Search, FileDown, Receipt, ScrollText, FileSignature } from 'lucide-react'
import { getHistory, download, remove } from '@/api/documents.api'
import { cn } from '@/lib/utils'

const TYPE_META = {
  'cuenta-cobro': { label: 'CUENTA COBRO', color: 'bg-blue-50 text-[#002f87]', icon: Receipt, iconColor: 'text-[#002f87]', iconBg: 'bg-blue-100/50' },
  'cotizacion':   { label: 'COTIZACIÓN',   color: 'bg-amber-50 text-amber-900',  icon: ScrollText, iconColor: 'text-amber-700', iconBg: 'bg-amber-100/50' },
  'contrato':     { label: 'CONTRATO',     color: 'bg-emerald-50 text-emerald-900', icon: FileSignature, iconColor: 'text-emerald-700', iconBg: 'bg-emerald-100/50' },
}

export default function HistoryPage() {
  const [docs, setDocs]            = useState([])
  const [filtered, setFiltered]    = useState([])
  const [loading, setLoading]      = useState(true)
  const [error, setError]          = useState(null)
  const [actionLoading, setAction] = useState(null)
  
  // Custom Filters
  const [search, setSearch]        = useState('')
  const [typeFilter, setType]      = useState('Todos')

  useEffect(() => { loadDocs() }, [])

  useEffect(() => {
    let result = docs
    
    if (typeFilter !== 'Todos') {
      const typeKey = typeFilter === 'Cotización' ? 'cotizacion' : typeFilter === 'Contrato' ? 'contrato' : 'cuenta-cobro'
      result = result.filter(d => d.type === typeKey)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        d.number?.toLowerCase().includes(q) ||
        d.clientName?.toLowerCase().includes(q)
      )
    }
    
    setFiltered(result)
  }, [search, typeFilter, docs])

  const loadDocs = async () => {
    try {
      const data = await getHistory()
      setDocs(data)
      setFiltered(data)
    } catch {
      setError('Error al cargar el historial.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id, number) => {
    setAction(id)
    try {
      const blob = await download(id)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${number}.pdf`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch { alert('Error descargando') }
    finally { setAction(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este documento?')) return
    setAction(id)
    try {
      await remove(id)
      const newDocs = docs.filter(d => d.id !== id)
      setDocs(newDocs)
    } catch { alert('Error al eliminar') }
    finally { setAction(null) }
  }

  const getClientInitials = (name) => {
    if (!name) return 'N/A'
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="animate-fade-in pb-16">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface mb-1 font-sans">Historial de Documentos</h2>
          <p className="text-sm font-medium text-on-surface-variant font-sans opacity-70">Gestione y supervise todos los documentos generados por su cuenta.</p>
        </div>
      </div>

      {/* Filters Bento Section */}
      <div className="grid grid-cols-12 gap-4 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <label className="section-label mb-4">Filtrar por tipo</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'Todos',           label: 'Todos',        colors: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' },
              { id: 'Cuenta de Cobro', label: 'Cuenta Cobro', colors: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
              { id: 'Cotización',      label: 'Cotización',   colors: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' },
              { id: 'Contrato',        label: 'Contrato',     colors: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200' },
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border border-transparent",
                  typeFilter === t.id 
                    ? t.colors + " shadow-sm border-blue-500/20 ring-2 ring-blue-500/10" 
                    : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <label className="section-label mb-3">Buscar por nombre o número</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>
            <input 
              className="field-input h-11 pl-10" 
              placeholder="Ej: 001, Juan Perez..." 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-surface-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 font-sans">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 font-sans">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 font-sans">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 font-sans">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 text-right font-sans">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
                    <p className="text-sm font-semibold text-on-surface-variant">Cargando documentos...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <AlertCircle className="text-error mx-auto mb-4" size={32} />
                    <p className="text-sm font-semibold text-error">{error}</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                     <div className="h-12 w-12 rounded-2xl bg-surface-container-high mx-auto flex items-center justify-center mb-4">
                        <FileText size={24} className="text-on-surface-variant" />
                      </div>
                      <p className="text-sm font-semibold text-on-surface">No se encontraron documentos</p>
                  </td>
                </tr>
              ) : (
                filtered.map(doc => {
                  const meta = TYPE_META[doc.type] ?? { label: doc.type, color: 'bg-surface-container-high text-on-surface-variant', point: 'bg-outline' }
                  const isAct = actionLoading === doc.id

                  return (
                    <tr key={doc.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                      <td className="px-6 py-5 font-mono text-xs text-primary font-bold">#{doc.number}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs shrink-0">
                            {getClientInitials(doc.clientName)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface leading-tight font-sans truncate max-w-[200px]">{doc.clientName || 'Sin Cliente'}</p>
                            {doc.clientNit && <p className="text-[11px] text-on-surface-variant font-sans">{doc.clientNit}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block", meta.color)}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface font-sans">{new Date(doc.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg transition-all disabled:opacity-50" 
                            title="Descargar PDF"
                            onClick={() => handleDownload(doc.id, doc.number)}
                            disabled={isAct}
                          >
                            {isAct ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                          </button>
                          <button 
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-all disabled:opacity-50" 
                            title="Eliminar"
                            onClick={() => handleDelete(doc.id)}
                            disabled={isAct}
                          >
                             <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant font-sans">Mostrando <span className="font-bold text-on-surface">1-{filtered.length}</span> de <span className="font-bold text-on-surface">{docs.length}</span> documentos</p>
        </div>
      </div>



    </div>
  )
}