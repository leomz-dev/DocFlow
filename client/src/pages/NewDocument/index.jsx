import { useState, useEffect } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FileText, Plus, Trash2, ArrowRight, Loader2, AlertCircle,
  User, List, StickyNote, ScrollText, GripVertical, ChevronRight, ArrowLeft
} from 'lucide-react'
import { useDocument } from '@/hooks/useDocument'
import { PDFPreview } from '@/components/PDFPreview'
import { cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'

const VALID_TYPES = ['cuenta-cobro', 'cotizacion', 'contrato']

const TITLES = {
  'cuenta-cobro': { label: 'Cuenta de Cobro', crumb: 'Cuentas' },
  'cotizacion': { label: 'Cotización', crumb: 'Cotizaciones' },
  'contrato': { label: 'Contrato', crumb: 'Contratos' },
}

/* ── Default clauses for contracts ─────────────────── */
const DEFAULT_CLAUSES = [
  {
    title: 'Primera — Objeto',
    content: 'El CONTRATISTA se obliga a prestar los servicios descritos en la tabla de ítems del presente contrato...',
  },
  {
    title: 'Segunda — Valor y Forma de Pago',
    content: 'El valor total acordado será el indicado en el resumen económico del presente documento.',
  },
  {
    title: 'Tercera — Duración',
    content: 'El presente contrato tendrá vigencia a partir de la fecha de su firma y hasta el cumplimiento total.',
  },
]

/* ── Schemas ────────────────────────────────────────── */
const itemSchema = z.object({
  description: z.string().min(1, 'Descripción requerida'),
  quantity: z.number({ coerce: true }).min(1, 'Min 1'),
  unitPrice: z.number({ coerce: true }).min(0, 'Valor inválido'),
})

const clauseSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  content: z.string().min(1, 'Contenido requerido'),
})

const schema = z.object({
  client: z.object({
    name: z.string().min(1, 'Nombre requerido'),
    nit: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
  }),
  items: z.array(itemSchema).min(1, 'Agrega al menos un ítem'),
  clauses: z.array(clauseSchema).optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
  withRetention: z.boolean().optional(),
  retentionRate: z.number({ coerce: true }).min(0).max(100).optional(),
  withIVA: z.boolean().optional(),
})

/* ── UI Components ───────────────────────────────────── */
function FieldInput({ register, error, type = "text", placeholder, options, className, onChange, ...props }) {
  const baseClasses = "w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none text-on-surface"
  const errorClasses = error ? "ring-2 ring-error/50 bg-error-container/10" : ""

  const handleChange = (e) => {
    if (register?.onChange) register.onChange(e)
    if (onChange) onChange(e)
  }

  if (type === 'select' && options) {
    return (
      <select
        {...register}
        {...props}
        onChange={handleChange}
        className={cn(baseClasses, "appearance-none", errorClasses, className)}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
        ))}
      </select>
    )
  }

  if (type === 'textarea') {
    return (
      <textarea
        {...register}
        {...props}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(baseClasses, "min-h-[100px] resize-y", errorClasses, className)}
      />
    )
  }

  return (
    <input
      {...register}
      {...props}
      onChange={handleChange}
      type={type}
      placeholder={placeholder}
      className={cn(baseClasses, errorClasses, className)}
    />
  )
}

function FieldLabel({ children, error }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans">{children}</label>
      {error && <span className="text-[10px] text-error font-semibold uppercase">{error}</span>}
    </div>
  )
}

/* ── Clauses Section ─────────────────────────────────── */
function ClausesSection({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'clauses' })

  return (
    <section className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-surface-sm transition-all duration-300 hover:shadow-surface-md">
      <header className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-4">
        <h2 className="text-xl font-semibold text-on-surface font-sans">Cláusulas del Contrato</h2>
        <button
          type="button"
          onClick={() => append({ title: '', content: '' })}
          className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-sm font-bold hover:bg-secondary-fixed transition-colors active:scale-95"
        >
          <Plus size={18} />
          Agregar
        </button>
      </header>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="relative bg-surface-container-low p-6 rounded-[1.5rem] space-y-4 border border-outline-variant/10">
            <button
              type="button"
              className="absolute top-6 right-6 text-on-surface-variant/40 hover:text-error transition-colors"
              onClick={() => remove(index)}
            >
              <Trash2 size={20} />
            </button>
            <div className="pr-10">
              <FieldLabel error={errors?.clauses?.[index]?.title?.message}>Cláusula {index + 1} - Titulo</FieldLabel>
              <FieldInput
                register={register(`clauses.${index}.title`)}
                placeholder="Ej: Primera — Objeto del Contrato"
                error={errors?.clauses?.[index]?.title?.message}
              />
            </div>
            <div>
              <FieldLabel error={errors?.clauses?.[index]?.content?.message}>Contenido</FieldLabel>
              <FieldInput
                type="textarea"
                register={register(`clauses.${index}.content`)}
                placeholder="Redacta el contenido de esta cláusula..."
                error={errors?.clauses?.[index]?.content?.message}
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-center py-10">
            <ScrollText size={32} className="text-outline mx-auto mb-3" />
            <p className="text-sm font-semibold text-on-surface-variant">No hay cláusulas añadidas</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Main Page ───────────────────────────────────────── */
export default function NewDocumentPage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { generate, loading, error, pdfBlobUrl, clearPreview } = useDocument()
  const [showPreview, setShowPreview] = useState(false)
  const info = TITLES[type]
  const isContract = type === 'contrato'

  const { register, control, handleSubmit, setValue: setFormValue, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      client: { name: '', nit: '', address: '', city: '', phone: '', email: '' },
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      clauses: isContract ? DEFAULT_CLAUSES : [],
      notes: '',
      date: new Date().toISOString().split('T')[0],
      withRetention: false,
      retentionRate: 3.5,
      withIVA: false,
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const itemsWatch = watch('items')
  const withRetention = watch('withRetention')
  const retentionRate = watch('retentionRate') || 0
  const withIVA = watch('withIVA')

  const subtotal = itemsWatch.reduce((acc, obj) => acc + ((+obj.quantity || 0) * (+obj.unitPrice || 0)), 0)
  const retentionAmount = withRetention ? subtotal * (retentionRate / 100) : 0
  const ivaAmount = withIVA ? subtotal * 0.19 : 0
  const totalFinal = subtotal + retentionAmount + ivaAmount

  if (!VALID_TYPES.includes(type)) return <Navigate to="/dashboard" replace />

  const { clients } = useClients()

  const handleClientSelect = (e) => {
    const clientId = e.target.value
    if (!clientId) {
      // Clear fields if no client is selected (shortcut to reset or manual entry)
      setFormValue('client.name', '')
      setFormValue('client.nit', '')
      setFormValue('client.email', '')
      setFormValue('client.address', '')
      setFormValue('client.city', '')
      setFormValue('client.phone', '')
      return
    }
    const selected = clients.find(c => c.id === clientId)
    if (selected) {
      setFormValue('client.name', selected.name || '')
      setFormValue('client.nit', selected.nit || '')
      setFormValue('client.email', selected.email || '')
      setFormValue('client.address', selected.address || '')
      setFormValue('client.city', selected.city || '')
      setFormValue('client.phone', selected.phone || '')
    }
  }



  const onSubmit = async (data) => {
    try {
      await generate({ type, ...data })
      setShowPreview(true)
    } catch (e) { console.error(e) }
  }

  const handleClosePreview = (open) => {
    setShowPreview(open)
    if (!open) clearPreview()
  }

  // Derived styling helpers
  const clientOptions = [{ value: '', label: 'Selecciona un cliente predefinido...' }, ...clients.map(c => ({ value: c.id, label: `${c.name} ${c.nit ? `- ${c.nit}` : ''}` }))]

  return (
    <div className="animate-fade-in pb-24">



      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Section 1: Basic Info */}
        <section className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-surface-sm transition-all duration-300 hover:shadow-surface-md">
          <header className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-4">
            <h2 className="text-xl font-semibold text-on-surface font-sans">Información Básica</h2>
            <span className="text-[10px] font-bold bg-primary-container text-on-primary-container px-3 py-1 rounded-full uppercase tracking-widest text-center">{info.label}</span>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="md:col-span-2">
              <FieldLabel>Cargar Cliente Guardado</FieldLabel>
              <FieldInput type="select" options={clientOptions} register={register('clientSelect')} onChange={handleClientSelect} className="bg-primary/5 border border-primary/20" />
            </div>

            <div>
              <FieldLabel error={errors.client?.name?.message}>Nombre / Razón Social *</FieldLabel>
              <FieldInput register={register('client.name')} placeholder="Empresa ABC S.A.S" error={errors.client?.name?.message} />
            </div>
            <div>
              <FieldLabel error={errors.client?.nit?.message}>NIT / C.C.</FieldLabel>
              <FieldInput register={register('client.nit')} placeholder="900.xxx.xxx-x" error={errors.client?.nit?.message} />
            </div>
            <div>
              <FieldLabel error={errors.client?.email?.message}>Email</FieldLabel>
              <FieldInput register={register('client.email')} type="email" placeholder="contacto@empresa.com" error={errors.client?.email?.message} />
            </div>
            <div>
              <FieldLabel>Dirección</FieldLabel>
              <FieldInput register={register('client.address')} placeholder="Calle, Carrera..." />
            </div>
            <div>
              <FieldLabel>Ciudad</FieldLabel>
              <FieldInput register={register('client.city')} placeholder="Bogotá" />
            </div>
            <div>
              <FieldLabel>Teléfono</FieldLabel>
              <FieldInput register={register('client.phone')} placeholder="300..." />
            </div>
            <div>
              <FieldLabel>Fecha de Emisión</FieldLabel>
              <FieldInput register={register('date')} type="date" />
            </div>
          </div>
        </section>

        {/* Section 2: Items Table */}
        <section className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-surface-sm transition-all duration-300 hover:shadow-surface-md overflow-hidden">
          <header className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-on-surface font-sans">Ítems del Documento</h2>
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
              className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-sm font-bold hover:bg-secondary-fixed transition-colors active:scale-95"
            >
              <Plus size={18} />
              Añadir línea
            </button>
          </header>

          <div className="space-y-4">
            {errors.items?.root && (
              <div className="px-5 py-3 rounded-xl bg-error-container/30 text-error text-xs mb-4 font-semibold flex items-center gap-2">
                <AlertCircle size={14} /> {errors.items.root.message}
              </div>
            )}

            {/* Desktop Header */}
            <div className="hidden md:flex items-center gap-4 px-6 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans opacity-60">
              <span className="flex-1">Descripción</span>
              <span className="w-24 text-center">Cant.</span>
              <span className="w-40 text-center">Valor Unit.</span>
              <span className="w-32 text-right">Total</span>
              <span className="w-16"></span>
            </div>

            {/* List of Items */}
            <div className="space-y-4 md:space-y-2">
              {fields.map((field, index) => {
                const qty = +itemsWatch[index]?.quantity || 0
                const price = +itemsWatch[index]?.unitPrice || 0
                const total = qty * price

                return (
                  <div key={field.id} className="group relative flex flex-col md:flex-row gap-4 md:gap-0 bg-surface-container-low/60 rounded-[1.5rem] md:rounded-[1rem] p-6 md:p-1 border border-outline-variant/10 md:border-none md:items-center hover:bg-surface-container-low transition-all">

                    {/* Description Section */}
                    <div className="flex-1">
                      <label className="md:hidden block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">Descripción del Ítem</label>
                      <input
                        {...register(`items.${index}.description`)}
                        placeholder="Escribe la descripción..."
                        className={cn(
                          "w-full bg-surface-container-lowest md:bg-transparent border-none px-4 py-3 md:py-4 rounded-xl md:rounded-none focus:ring-0 text-sm font-semibold md:font-medium outline-none text-on-surface placeholder:text-on-surface-variant/40",
                          errors.items?.[index]?.description && "text-error placeholder:text-error"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:contents gap-x-4 gap-y-6">
                      {/* Quantity Section */}
                      <div className="md:w-24">
                        <label className="md:hidden block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">Cantidad</label>
                        <input
                          {...register(`items.${index}.quantity`)}
                          type="number" min="1" step="0.01"
                          className="w-full bg-surface-container-lowest md:bg-transparent border-none px-4 py-3 md:py-4 rounded-xl md:rounded-none focus:ring-0 text-sm font-bold md:font-medium outline-none text-on-surface text-left md:text-center"
                        />
                      </div>

                      {/* Unit Price Section */}
                      <div className="md:w-40">
                        <label className="md:hidden block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">Valor Unitario</label>
                        <div className="flex items-center gap-1.5 px-4 py-3 md:py-2.5 bg-surface-container-lowest md:bg-surface-container-lowest/50 rounded-xl md:rounded-lg md:mx-2 border border-outline-variant/10 group-hover:border-primary/20 transition-colors">
                          <span className="text-[10px] text-primary/60 font-black">$</span>
                          <input
                            {...register(`items.${index}.unitPrice`)}
                            type="number" min="0" step="100"
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold md:font-medium outline-none text-on-surface"
                          />
                        </div>
                      </div>

                      {/* Total Section */}
                      <div className="flex flex-col md:items-end justify-center md:w-32">
                        <label className="md:hidden block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">Total</label>
                        <span className="text-base md:text-sm font-black text-primary md:px-4 leading-none">
                          ${total.toLocaleString('es-CO')}
                        </span>
                      </div>

                      {/* Delete Action Section */}
                      <div className="md:w-16 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="w-12 h-12 md:w-full md:h-full flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error-container/10 md:hover:bg-transparent rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Document Clauses (If Contract) */}
        {isContract && (
          <ClausesSection control={control} register={register} errors={errors} />
        )}

        {/* Section 4: Totals & Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Notes */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-surface-sm h-full">
            <header className="mb-6">
              <h2 className="text-xl font-semibold text-on-surface font-sans">Notas y Términos</h2>
              <p className="text-xs text-on-surface-variant mt-1 font-sans">Información adicional que aparecerá al pie del documento.</p>
            </header>
            <div className="space-y-6">
              <div>
                <FieldLabel>Observaciones ({isContract ? "Finales" : "Generales"})</FieldLabel>
                <FieldInput
                  type="textarea"
                  register={register('notes')}
                  placeholder={isContract ? "Condiciones adicionales, aclaraciones u observaciones finales antes de firmas..." : "Condiciones de pago, aclaraciones, vigencia..."}
                />
              </div>
            </div>
          </div>

          {/* Automatic Totals */}
          <div className="lg:col-span-5 bg-surface-container-low rounded-[1.5rem] p-8 shadow-none border border-outline-variant/10">
            <h2 className="text-xl font-semibold text-on-surface font-sans mb-8">Resumen Financiero</h2>
            <div className="space-y-4 font-sans">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-bold text-on-surface">${subtotal.toLocaleString('es-CO')}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...register('withRetention')}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Retención fuente</span>
                  </label>
                  {withRetention && (
                    <div className="flex items-center gap-1 bg-surface-container-high rounded-lg px-2 py-1 border border-outline-variant/20 animate-in fade-in slide-in-from-left-2 duration-200">
                      <input
                        type="number"
                        step="0.1"
                        {...register('retentionRate')}
                        className="w-12 bg-transparent border-none p-0 text-xs font-bold text-primary focus:ring-0 outline-none text-center"
                      />
                      <span className="text-xs font-bold text-primary/60">%</span>
                    </div>
                  )}
                </div>
                {withRetention && <span className="text-sm font-bold text-primary">+ ${retentionAmount.toLocaleString('es-CO')}</span>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('withIVA')}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">IVA (19%)</span>
                </label>
                {withIVA && <span className="text-sm font-bold text-primary">+ ${ivaAmount.toLocaleString('es-CO')}</span>}
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Final</span>
                  <span className="text-[32px] font-bold text-primary leading-tight tracking-tighter">${totalFinal.toLocaleString('es-CO')}</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg mb-2">COP</span>
              </div>
            </div>
          </div>

        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-error-container/20 border border-error/50 px-5 py-4 text-sm font-semibold text-error mb-4">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}

        {/* Footer Navigation */}
        <footer className="mt-12 flex flex-col md:flex-row items-center justify-between py-6 border-t border-outline-variant/20 gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <ArrowLeft size={18} />
            Cancelar
          </button>

          <div className="flex w-full md:w-auto gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 px-8 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl text-sm font-bold shadow-primary-md hover:shadow-primary-lg transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Generando...</>
              ) : (
                <> Generar y Previsualizar <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </footer>

      </form>

      <PDFPreview
        open={showPreview}
        onOpenChange={handleClosePreview}
        blobUrl={pdfBlobUrl}
        title={`${info.label} - Previsualización`}
      />
    </div>
  )
}
