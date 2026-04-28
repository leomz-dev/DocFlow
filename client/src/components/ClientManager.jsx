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
      <label className="field-label px-0.5">
        {label}
      </label>
      <input
        className={cn(
          "field-input",
          error && "error"
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
        <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> Directorio de Clientes
          </h2>
          <button 
            onClick={openNewClient}
            className="btn-primary h-10 px-5 text-sm"
          >
            <Plus size={18} />
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
          
          <div className={cn("bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl overflow-y-auto max-h-[500px] border border-gray-100 dark:border-slate-800", compact && "max-h-[350px]")}>
            {loading ? (
              <div className="flex items-center justify-center p-12 text-gray-400 italic text-sm">
                Cargando directorio...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 text-gray-400">
                <Users size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-bold">No se encontraron clientes</p>
                <p className="text-xs mt-1">Intente con otro término o cree uno nuevo.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className={cn(
                      "w-full text-left px-5 py-4 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-4 group relative",
                      selectedClient?.id === client.id && "bg-white dark:bg-slate-800 shadow-md z-10 scale-[1.01]"
                    )}
                  >
                    {selectedClient?.id === client.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                    )}
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs uppercase transition-colors shadow-sm",
                      selectedClient?.id === client.id ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}>
                      {client.name.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{client.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{client.nit || 'Sin Identificación'}</p>
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 relative border border-gray-100 dark:border-slate-800 animate-fade-in h-full shadow-sm">
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => openEditClient(selectedClient)}
                  className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all shadow-sm"
                  title="Editar Información"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(selectedClient.id)}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm"
                  title="Eliminar Cliente"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className="h-20 w-20 rounded-2xl bg-[var(--navy)] text-white flex items-center justify-center font-bold text-3xl uppercase shadow-lg">
                  {selectedClient.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{selectedClient.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full uppercase tracking-widest">
                      {selectedClient.nit || 'NIT NO DISPONIBLE'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                  <p className="section-label mb-2 flex items-center gap-2">
                    <Mail size={14} className="text-blue-600" /> Correo Electrónico
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={selectedClient.email}>
                    {selectedClient.email || 'No registrado'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                  <p className="section-label mb-2 flex items-center gap-2">
                    <Phone size={14} className="text-blue-600" /> Teléfono
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={selectedClient.phone}>
                    {selectedClient.phone || 'No registrado'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                  <p className="section-label mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-600" /> Ubicación
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={selectedClient.city}>
                    {selectedClient.city || '—'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                  <p className="section-label mb-2 flex items-center gap-2">
                    <Building size={14} className="text-blue-600" /> Dirección Fiscal
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={selectedClient.address}>
                    {selectedClient.address || '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-gray-50/30">
              <Users size={48} className="opacity-10 mb-4" />
              <p className="text-base font-bold text-gray-600">Seleccione un cliente</p>
              <p className="text-sm mt-1 max-w-xs text-gray-400">Revise los detalles de su base de datos o cree un nuevo perfil comercial en el panel lateral.</p>
             </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-lg rounded-2xl">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-gray-100 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isEditing ? 'Editar Perfil' : 'Nuevo Cliente'}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1.5">
                Complete la información para la generación de documentos.
              </p>
            </DialogHeader>
          </div>

          <div className="p-8">
            <form id="client-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <EditorialInput 
                  label="Nombre o Razón Social *" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                  placeholder="Ej: Innova Tech S.A.S." 
                />
              </div>
              
              <EditorialInput 
                label="NIT / C.C." 
                value={formData.nit} 
                onChange={e => setFormData(p => ({...p, nit: e.target.value}))} 
                placeholder="900.123.456-7" 
              />
              <EditorialInput 
                label="Teléfono" 
                value={formData.phone} 
                onChange={e => setFormData(p => ({...p, phone: e.target.value}))} 
                placeholder="+57 300 000 0000" 
              />

              <div className="md:col-span-2">
                <EditorialInput 
                  label="Correo Electrónico" 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData(p => ({...p, email: e.target.value}))} 
                  placeholder="gerencia@empresa.com" 
                />
              </div>

              <EditorialInput 
                label="Ciudad" 
                value={formData.city} 
                onChange={e => setFormData(p => ({...p, city: e.target.value}))} 
                placeholder="Bogotá D.C." 
              />
              <EditorialInput 
                label="Dirección" 
                value={formData.address} 
                onChange={e => setFormData(p => ({...p, address: e.target.value}))} 
                placeholder="Calle 100 # 15-20" 
              />
            </form>

            <div className="flex justify-end items-center gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-slate-800">
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="client-form" 
                disabled={submitLoading}
                className="btn-primary min-h-[44px] px-8"
              >
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'Actualizar' : 'Crear Cliente')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

