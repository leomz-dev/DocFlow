import { useState } from 'react'
import { Plus, Users, Search, Edit2, Trash2, Building, Mail, MapPin, Phone, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useClients } from '@/hooks/useClients'
import { cn } from '@/lib/utils'

/* ─── Editorial Components ────────────────────────── */
function EditorialInput({ label, error, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-widest font-sans px-0.5">
        {label}
      </label>
      <input
        className={cn(
          "w-full bg-surface-container-low/60 border border-outline-variant/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none text-on-surface placeholder:text-on-surface-variant/30",
          error && "ring-2 ring-error/50 bg-error-container/10"
        )}
        {...props}
      />
    </div>
  )
}

export function ClientManager({ compact = false }) {
  const { clients, loading, addClient, editClient, removeClient } = useClients()
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', nit: '', email: '', city: '', address: '', phone: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.nit && c.nit.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSelect = (client) => {
    setSelectedClient(client)
  }

  const openNewClient = () => {
    setIsEditing(false)
    setFormData({ name: '', nit: '', email: '', city: '', address: '', phone: '' })
    setIsModalOpen(true)
  }

  const openEditClient = (client) => {
    setIsEditing(true)
    setFormData({ ...client })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      if (isEditing) {
        const updated = await editClient(formData.id, formData)
        if (selectedClient?.id === updated.id) setSelectedClient(updated)
      } else {
        await addClient(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return
    await removeClient(id)
    if (selectedClient?.id === id) setSelectedClient(null)
  }

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 font-sans">
            <Users size={20} className="text-primary" /> Directorio de Clientes
          </h2>
          <button 
            onClick={openNewClient}
            className="group flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-surface-md hover:shadow-primary-glow active:scale-95 transition-all"
          >
            <Plus size={18} className="text-white/80 group-hover:text-white" />
            Nuevo Cliente
          </button>
        </div>
      )}

      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8", compact && "gap-4")}>
        {/* Selector de clientes (Lista) */}
        <div className={cn("lg:col-span-4 flex flex-col gap-4", compact && "lg:col-span-12 xl:col-span-4")}>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
              <Search size={16} />
            </span>
            <input 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low/60 border border-outline-variant/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary/10 transition-all font-sans text-on-surface placeholder:text-on-surface-variant/30 outline-none" 
            />
          </div>
          
          <div className={cn("bg-surface-container-low/30 rounded-[1.5rem] overflow-y-auto max-h-[500px] border border-outline-variant/5", compact && "max-h-[300px]")}>
            {!compact && (
               <div className="p-3 md:hidden">
                  <button 
                    onClick={openNewClient}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white text-xs font-bold rounded-xl"
                  >
                    <Plus size={14} /> Nuevo Cliente
                  </button>
               </div>
            )}            {loading ? (
              <div className="flex items-center justify-center p-12 text-on-surface-variant/60 italic text-sm font-sans">
                Cargando directorio...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 text-on-surface-variant/40">
                <Users size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-bold font-sans">No se encontraron clientes</p>
                <p className="text-xs mt-1">Intente con otro término o cree uno nuevo.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/5">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className={cn(
                      "w-full text-left px-5 py-4 hover:bg-surface-container-low transition-all flex items-center gap-4 group",
                      selectedClient?.id === client.id && "bg-white dark:bg-slate-900 shadow-sm z-10 scale-[1.02] border-x border-outline-variant/10"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs uppercase transition-colors shadow-sm",
                      selectedClient?.id === client.id ? "bg-primary text-white" : "bg-secondary-container text-on-secondary-container"
                    )}>
                      {client.name.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-on-surface font-sans">{client.name}</p>
                      <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider mt-0.5">{client.nit || 'Sin Identificación'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalles del cliente */}
        <div className="lg:col-span-8">
          {selectedClient ? (
            <div className="bg-surface-container-low/40 rounded-[2rem] p-8 relative border border-outline-variant/10 animate-fade-in h-full">
              <div className="absolute top-8 right-8 flex gap-2">
                <button 
                  onClick={() => openEditClient(selectedClient)}
                  className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
                  title="Editar Información"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(selectedClient.id)}
                  className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl transition-all shadow-sm"
                  title="Eliminar Cliente"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className="h-20 w-20 rounded-[1.5rem] bg-primary text-on-primary flex items-center justify-center font-bold text-3xl uppercase shadow-primary-md">
                  {selectedClient.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-on-surface font-sans tracking-tight">{selectedClient.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full uppercase tracking-widest">
                      {selectedClient.nit || 'NIT NO DISPONIBLE'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl shadow-surface-sm overflow-hidden">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans mb-2 flex items-center gap-2">
                    <Mail size={14} className="text-primary" /> Correo Electrónico
                  </p>
                  <p className="text-sm font-semibold text-on-surface font-sans truncate" title={selectedClient.email}>
                    {selectedClient.email || 'No registrado'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl shadow-surface-sm overflow-hidden">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans mb-2 flex items-center gap-2">
                    <Phone size={14} className="text-primary" /> Teléfono
                  </p>
                  <p className="text-sm font-semibold text-on-surface font-sans truncate" title={selectedClient.phone}>
                    {selectedClient.phone || 'No registrado'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl shadow-surface-sm overflow-hidden">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-primary" /> Ubicación
                  </p>
                  <p className="text-sm font-semibold text-on-surface font-sans truncate" title={selectedClient.city}>
                    {selectedClient.city || '—'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl shadow-surface-sm overflow-hidden">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans mb-2 flex items-center gap-2">
                    <Building size={14} className="text-primary" /> Dirección Fiscal
                  </p>
                  <p className="text-sm font-semibold text-on-surface font-sans truncate" title={selectedClient.address}>
                    {selectedClient.address || '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full border-2 border-dashed border-outline-variant/20 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center text-on-surface-variant/40 bg-surface-container-low/10">
              <Users size={48} className="opacity-10 mb-4" />
              <p className="text-base font-bold font-sans text-on-surface/60">Seleccione un cliente</p>
              <p className="text-sm mt-1 max-w-xs">Revise los detalles de su base de datos o cree un nuevo perfil comercial en el panel lateral.</p>
             </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] !rounded-[2.5rem] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-scale-in">
          <div className="bg-primary/5 p-8 border-b border-outline-variant/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black font-sans text-on-surface tracking-tight">
                {isEditing ? 'Editar Perfil Comercial' : 'Nuevo Cliente'}
              </DialogTitle>
              <p className="text-xs font-medium text-on-surface-variant opacity-70 mt-1">
                Complete la información legal y de contacto del cliente para la generación de documentos.
              </p>
            </DialogHeader>
          </div>

          <div className="p-8">
            <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
              <EditorialInput 
                label="Nombre o Razón Social *" 
                required 
                value={formData.name} 
                onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                placeholder="Ej: Innova Tech S.A.S." 
              />
              
              <div className="grid grid-cols-2 gap-6">
                <EditorialInput 
                  label="NIT / C.C." 
                  value={formData.nit} 
                  onChange={e => setFormData(p => ({...p, nit: e.target.value}))} 
                  placeholder="900.123.456-7" 
                />
                <EditorialInput 
                  label="Teléfono Móvil" 
                  value={formData.phone} 
                  onChange={e => setFormData(p => ({...p, phone: e.target.value}))} 
                  placeholder="+57 300 000 0000" 
                />
              </div>

              <EditorialInput 
                label="Correo Electrónico de Facturación" 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData(p => ({...p, email: e.target.value}))} 
                placeholder="gerencia@empresa.com" 
              />

              <div className="grid grid-cols-2 gap-6">
                <EditorialInput 
                  label="Ciudad / Municipio" 
                  value={formData.city} 
                  onChange={e => setFormData(p => ({...p, city: e.target.value}))} 
                  placeholder="Bogotá D.C." 
                />
                <EditorialInput 
                  label="Dirección de Oficina" 
                  value={formData.address} 
                  onChange={e => setFormData(p => ({...p, address: e.target.value}))} 
                  placeholder="Calle 100 # 15-20" 
                />
              </div>
            </form>

            <div className="flex justify-end items-center gap-4 mt-10 pt-6 border-t border-outline-variant/10">
              <button 
                type="button" 
                className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="client-form" 
                disabled={submitLoading}
                className="bg-primary text-white px-10 py-3 rounded-2xl text-sm font-bold shadow-primary-glow hover:shadow-primary-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (isEditing ? 'Actualizar Perfil' : 'Crear Cliente')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

