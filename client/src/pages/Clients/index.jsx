import { ClientManager } from '@/components/ClientManager'
import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="animate-fade-in pb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2 font-sans">Gestión de Clientes</h2>
        <p className="text-on-surface-variant font-sans">Administre su base de datos de clientes para agilizar la creación de documentos.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-surface-md p-6 md:p-8">
        <ClientManager />
      </div>
    </div>
  )
}
