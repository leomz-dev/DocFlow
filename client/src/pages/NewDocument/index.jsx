import { useState, useEffect } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Trash2, Loader2, AlertCircle,
  ChevronRight, ChevronLeft, Check,
  Receipt, ScrollText, FileSignature, FileText
} from 'lucide-react'
import { useDocument } from '@/hooks/useDocument'
import { PDFPreview } from '@/components/PDFPreview'
import { cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'

const VALID_TYPES = ['cuenta-cobro', 'cotizacion', 'contrato']

const TYPE_META = {
  'cuenta-cobro': { label: 'Cuenta de Cobro', icon: Receipt,       accent: '#2563EB', bg: '#EBF1FD' },
  'cotizacion':   { label: 'Cotización',       icon: ScrollText,    accent: '#D97706', bg: '#FFFBEB' },
  'contrato':     { label: 'Contrato',         icon: FileSignature, accent: '#7C3AED', bg: '#F5F3FF' },
}

const DEFAULT_CLAUSES = [
  { title: 'Primera — Objeto', content: 'El CONTRATISTA se obliga a prestar los servicios descritos en la tabla de ítems...' },
  { title: 'Segunda — Valor y Pago', content: 'El valor total acordado será el indicado en el resumen económico del presente documento.' },
  { title: 'Tercera — Duración', content: 'El presente contrato tendrá vigencia a partir de la fecha de su firma.' },
]

/* ─── Schemas ─────────────────────────────────────── */
const itemSchema  = z.object({
  description: z.string().min(1, 'Requerido'),
  quantity:    z.number({ coerce: true }).min(1, 'Mínimo 1'),
  unitPrice:   z.number({ coerce: true }).min(0, 'Valor inválido'),
})
const clauseSchema = z.object({
  title:   z.string().min(1, 'Título requerido'),
  content: z.string().min(1, 'Contenido requerido'),
})
const schema = z.object({
  client: z.object({
    name:    z.string().min(1, 'El nombre es obligatorio'),
    nit:     z.string().optional(),
    address: z.string().optional(),
    city:    z.string().optional(),
    phone:   z.string().optional(),
    email:   z.string().email('Email no válido').optional().or(z.literal('')),
  }),
  items:         z.array(itemSchema).min(1, 'Agrega al menos un ítem'),
  clauses:       z.array(clauseSchema).optional(),
  notes:         z.string().optional(),
  date:          z.string().optional(),
  withRetention: z.boolean().optional(),
  retentionRate: z.number({ coerce: true }).optional(),
  withIVA:       z.boolean().optional(),
})

/* ─── Shared UI ───────────────────────────────────── */
function Field({ label, required, error, children, hint }) {
  return (
    <div>
      {label && (
        <label className='field-label'>
          {label}{required && <span className='text-red-500 ml-0.5'>*</span>}
        </label>
      )}
      {hint && <p className='text-[12px] text-gray-400 mb-2 -mt-1 leading-snug'>{hint}</p>}
      {children}
      {error && (
        <div className='flex items-center gap-1.5 mt-1.5 text-red-600 text-[12px] font-semibold'>
          <AlertCircle size={12} />{error}
        </div>
      )}
    </div>
  )
}

function Input({ register, error, ...props }) {
  return (
    <input
      {...register}
      {...props}
      className={cn('field-input', error && 'error')}
    />
  )
}

function Textarea({ register, rows = 3, placeholder, error }) {
  return (
    <textarea
      {...register}
      rows={rows}
      placeholder={placeholder}
      className={cn('field-input resize-none', error && 'error')}
    />
  )
}

/* ─── Step indicator ──────────────────────────────── */
function StepBar({ step, labels }) {
  return (
    <div className='flex items-center mb-6'>
      {labels.map((label, i) => {
        const n = i + 1
        const done   = n < step
        const active = n === step
        return (
          <div key={n} className='flex items-center flex-1 last:flex-none'>
            <div className='flex flex-col items-center gap-1'>
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold border-2 transition-all',
                done   ? 'bg-[#0F2040] border-[#0F2040] text-white' : '',
                active ? 'bg-white border-[#0F2040] text-[#0F2040] shadow-[0_0_0_4px_rgba(15,32,64,0.1)]' : '',
                !done && !active ? 'bg-white border-gray-200 text-gray-300' : ''
              )}>
                {done ? <Check size={16} /> : n}
              </div>
              <span className={cn(
                'text-[11px] font-semibold whitespace-nowrap hidden sm:block',
                active ? 'text-[#0F2040]' : done ? 'text-gray-500' : 'text-gray-300'
              )}>
                {label}
              </span>
            </div>
            {n < labels.length && (
              <div className={cn(
                'flex-1 h-[2px] mx-2 mb-4 rounded-full',
                done ? 'bg-[#0F2040]' : 'bg-gray-200'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Step 1 — Client ─────────────────────────────── */
function StepClient({ register, errors, clients, setValue }) {
  const applyClient = (id) => {
    if (!id) { ['name','nit','email','address','city','phone'].forEach(f => setValue(`client.${f}`, '')); return }
    const c = clients?.find(x => x.id === id)
    if (c) {
      setValue('client.name',    c.name    || '')
      setValue('client.nit',     c.nit     || '')
      setValue('client.email',   c.email   || '')
      setValue('client.address', c.address || '')
      setValue('client.city',    c.city    || '')
      setValue('client.phone',   c.phone   || '')
    }
  }
  return (
    <div className='space-y-5'>
      <p className='text-[14px] text-gray-500 leading-relaxed'>
        ¿A quién va dirigido este documento? Ingrese los datos del cliente.
      </p>

      {clients?.length > 0 && (
        <Field label='Cliente guardado' hint='Seleccione uno para cargar sus datos automáticamente.'>
          <div className='relative'>
            <select
              onChange={e => applyClient(e.target.value)}
              className='field-input pr-10 appearance-none cursor-pointer bg-[#EBF1FD] border-[#2563EB]/30 text-[#2563EB] font-semibold'
            >
              <option value=''>— Seleccionar cliente —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronRight size={16} className='absolute right-3 top-1/2 -translate-y-1/2 text-[#2563EB] rotate-90 pointer-events-none' />
          </div>
        </Field>
      )}

      <Field label='Nombre o Razón Social' required error={errors.client?.name?.message}>
        <Input register={register('client.name')} placeholder='Juan García o Empresa ABC S.A.S.' error={errors.client?.name?.message} />
      </Field>

      <div className='grid grid-cols-2 gap-4'>
        <Field label='NIT o Cédula' error={errors.client?.nit?.message}>
          <Input register={register('client.nit')} placeholder='900.123.456-7' error={errors.client?.nit?.message} />
        </Field>
        <Field label='Teléfono'>
          <Input register={register('client.phone')} placeholder='+57 300 ...' type='tel' />
        </Field>
      </div>

      <Field label='Correo electrónico' error={errors.client?.email?.message}>
        <Input register={register('client.email')} placeholder='correo@empresa.com' type='email' error={errors.client?.email?.message} />
      </Field>

      <div className='grid grid-cols-2 gap-4'>
        <Field label='Ciudad'>
          <Input register={register('client.city')} placeholder='Bogotá' />
        </Field>
        <Field label='Fecha de emisión'>
          <Input register={register('date')} type='date' />
        </Field>
      </div>

      <Field label='Dirección'>
        <Input register={register('client.address')} placeholder='Calle 123 # 45-67' />
      </Field>
    </div>
  )
}

/* ─── Step 2 — Items ──────────────────────────────── */
function StepItems({ register, control, errors, itemsWatch }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  return (
    <div className='space-y-5'>
      <p className='text-[14px] text-gray-500 leading-relaxed'>
        Agregue los servicios o productos incluidos en este documento.
      </p>

      {errors.items?.root && (
        <div className='flex items-center gap-2 rounded-[12px] bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-[13px] font-semibold'>
          <AlertCircle size={15} />{errors.items.root.message}
        </div>
      )}

      <div className='space-y-4'>
        {fields.map((field, i) => {
          const qty   = +itemsWatch?.[i]?.quantity  || 0
          const price = +itemsWatch?.[i]?.unitPrice || 0
          const row_total = qty * price

          return (
            <div key={field.id} className='bg-gray-50 border border-gray-200 rounded-[12px] p-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>Ítem {i + 1}</span>
                {fields.length > 1 && (
                  <button
                    type='button'
                    onClick={() => remove(i)}
                    className='flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[12px] font-bold transition-colors'
                  >
                    <Trash2 size={13} />Eliminar
                  </button>
                )}
              </div>

              <Field label='Descripción' error={errors.items?.[i]?.description?.message}>
                <Input
                  register={register(`items.${i}.description`)}
                  placeholder='Ej: Diseño de logotipo, consultoría, etc.'
                  error={errors.items?.[i]?.description?.message}
                />
              </Field>

              <div className='grid grid-cols-3 gap-3'>
                <Field label='Cantidad' error={errors.items?.[i]?.quantity?.message}>
                  <Input register={register(`items.${i}.quantity`)} type='number' min='1' step='0.01' placeholder='1' error={errors.items?.[i]?.quantity?.message} />
                </Field>
                <Field label='Valor unit.' error={errors.items?.[i]?.unitPrice?.message}>
                  <Input register={register(`items.${i}.unitPrice`)} type='number' min='0' step='1000' placeholder='500000' error={errors.items?.[i]?.unitPrice?.message} />
                </Field>
                <Field label='Total'>
                  <div className='field-input bg-blue-50 border-blue-200 font-bold text-[#2563EB] text-center select-none cursor-default'>
                    ${row_total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </div>
                </Field>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type='button'
        onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
        className='w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-[12px] text-[14px] font-bold text-gray-400 hover:border-[#0F2040] hover:text-[#0F2040] hover:bg-[#F6F8FC] transition-all active:scale-[0.98]'
      >
        <Plus size={18} />Añadir otro ítem
      </button>
    </div>
  )
}

/* ─── Step 3 — Totals ─────────────────────────────── */
function StepTotals({ register, watch, control, isContract }) {
  const withRet  = watch('withRetention')
  const retRate  = watch('retentionRate') || 0
  const withIVA  = watch('withIVA')
  const items    = watch('items') || []

  const subtotal = items.reduce((a, o) => a + ((+o.quantity||0) * (+o.unitPrice||0)), 0)
  const ret      = withRet ? subtotal * ((+retRate) / 100) : 0
  const iva      = withIVA ? subtotal * 0.19 : 0
  const total    = subtotal + ret + iva

  const { fields: cFields, append: cAppend, remove: cRemove } = useFieldArray({ control, name: 'clauses' })

  return (
    <div className='space-y-6'>
      <p className='text-[14px] text-gray-500 leading-relaxed'>
        Revise los totales y agregue observaciones antes de generar el PDF.
      </p>

      {/* Summary card */}
      <div className='card p-5 space-y-4'>
        <p className='text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-4'>Resumen financiero</p>

        <div className='flex justify-between text-[15px]'>
          <span className='text-gray-500'>Subtotal</span>
          <span className='font-bold text-gray-900'>${subtotal.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>
        </div>

        {/* Retention */}
        <div className='border-t border-gray-100 pt-4 space-y-3'>
          <label className='flex items-center gap-3 cursor-pointer select-none'>
            <input
              type='checkbox'
              {...register('withRetention')}
              className='w-[18px] h-[18px] rounded-md border-gray-300 text-[#0F2040] accent-[#0F2040] cursor-pointer'
            />
            <span className='text-[14px] font-semibold text-gray-700'>Retención en la fuente</span>
          </label>
          {withRet && (
            <div className='flex items-center gap-3 pl-8'>
              <input
                type='number' step='0.1'
                {...register('retentionRate')}
                className='w-16 field-input text-center font-bold p-2 text-[14px]'
              />
              <span className='text-gray-400'>%</span>
              <span className='ml-auto font-bold text-gray-700'>+${ret.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>
            </div>
          )}
        </div>

        {/* IVA */}
        <div className='border-t border-gray-100 pt-3'>
          <label className='flex items-center justify-between cursor-pointer select-none'>
            <div className='flex items-center gap-3'>
              <input
                type='checkbox'
                {...register('withIVA')}
                className='w-[18px] h-[18px] rounded-md border-gray-300 accent-[#0F2040] cursor-pointer'
              />
              <span className='text-[14px] font-semibold text-gray-700'>IVA (19%)</span>
            </div>
            {withIVA && <span className='font-bold text-gray-700'>+${iva.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>}
          </label>
        </div>

        {/* Total */}
        <div className='border-t-2 border-[#0F2040]/15 pt-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[13px] font-bold text-gray-500 uppercase tracking-wide'>Total</span>
            <div className='text-right'>
              <p className='text-[28px] font-black text-[#0F2040] leading-none'>
                ${total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className='text-[11px] text-gray-400 font-medium mt-0.5'>COP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <Field label='Notas u observaciones' hint='Opcional — aparecerá al pie del documento.'>
        <Textarea
          register={register('notes')}
          rows={3}
          placeholder='Condiciones de pago, vigencia, aclaraciones...'
        />
      </Field>

      {/* Contract clauses */}
      {isContract && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-[14px] font-bold text-gray-700'>Cláusulas del contrato</p>
            <button
              type='button'
              onClick={() => cAppend({ title: '', content: '' })}
              className='flex items-center gap-1.5 text-[#0F2040] font-bold text-[13px] px-3 py-2 rounded-[12px] hover:bg-[#E8EEF8] transition-colors'
            >
              <Plus size={15} />Agregar
            </button>
          </div>
          {cFields.map((f, i) => (
            <div key={f.id} className='card p-4 space-y-3'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>Cláusula {i + 1}</span>
                <button type='button' onClick={() => cRemove(i)} className='text-red-400 text-[12px] font-bold flex items-center gap-1 hover:text-red-600'>
                  <Trash2 size={12} />Eliminar
                </button>
              </div>
              <Field label='Título'>
                <Input register={register(`clauses.${i}.title`)} placeholder='Primera — Objeto del Contrato' />
              </Field>
              <Field label='Contenido'>
                <Textarea register={register(`clauses.${i}.content`)} rows={3} placeholder='Redacta el contenido...' />
              </Field>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main page ───────────────────────────────────── */
export default function NewDocumentPage() {
  const { type }     = useParams()
  const navigate     = useNavigate()
  const { generate, loading, error, pdfBlobUrl, docNumber, clearPreview } = useDocument()
  const [showPreview, setShowPreview] = useState(false)
  const [step, setStep]               = useState(1)
  const STEPS = ['Cliente', 'Servicios', 'Resumen']
  const isContract = type === 'contrato'
  const meta = TYPE_META[type]
  const { clients } = useClients()

  const { register, control, handleSubmit, setValue, trigger, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      client: { name: '', nit: '', address: '', city: '', phone: '', email: '' },
      items:  [{ description: '', quantity: 1, unitPrice: 0 }],
      clauses: isContract ? DEFAULT_CLAUSES : [],
      notes: '',
      date: new Date().toISOString().split('T')[0],
      withRetention: false,
      retentionRate: 3.5,
      withIVA: false,
    }
  })

  const itemsWatch = watch('items')

  if (!VALID_TYPES.includes(type)) return <Navigate to='/dashboard' replace />

  const goNext = async () => {
    let ok = true
    if (step === 1) ok = await trigger(['client.name', 'client.email'])
    if (step === 2) ok = await trigger(['items'])
    if (ok) setStep(s => s + 1)
  }

  // Prevent "Enter" from submitting the form in steps 1 and 2
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step < 3) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        e.preventDefault()
        goNext()
      }
    }
  }

  const onSubmit = async (data) => {
    if (step < 3) return
    try {
      await generate({ type, ...data })
      setShowPreview(true)
    } catch (e) { console.error(e) }
  }

  const Icon = meta?.icon || FileText

  return (
    <div className='fade-in'>
      {/* Type badge */}
      <div
        className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold mb-5'
        style={{ background: meta?.bg, color: meta?.accent }}
      >
        <Icon size={14} />{meta?.label}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <StepBar step={step} labels={STEPS} />

        {/* Step content */}
        <div className='card p-5 md:p-6 mb-5 slide-up'>
          {step === 1 && (
            <StepClient
              register={register} errors={errors}
              clients={clients} setValue={setValue}
            />
          )}
          {step === 2 && (
            <StepItems
              register={register} control={control}
              errors={errors} itemsWatch={itemsWatch}
            />
          )}
          {step === 3 && (
            <StepTotals
              register={register} watch={watch}
              control={control} isContract={isContract}
            />
          )}
        </div>

        {/* API error */}
        {error && (
          <div className='flex items-center gap-2.5 rounded-[12px] bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-[13px] font-semibold mb-4'>
            <AlertCircle size={16} />{error}
          </div>
        )}

        {/* Navigation */}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)}
            className='flex items-center gap-2 px-5 py-3.5 rounded-[12px] text-[14px] font-bold text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0'
          >
            <ChevronLeft size={18} />
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          <div className='flex-1' />

          {step < 3 ? (
            <button
              key='btn-next'
              type='button'
              onClick={goNext}
              className='btn btn-primary gap-2'
            >
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button
              key='btn-submit'
              type='submit'
              disabled={loading}
              className='btn btn-primary gap-2'
            >
              {loading
                ? <><Loader2 size={18} className='animate-spin' />Generando...</>
                : <><FileText size={18} />Generar PDF</>
              }
            </button>
          )}
        </div>
      </form>

      <PDFPreview
        open={showPreview}
        onOpenChange={open => { setShowPreview(open); if (!open) clearPreview() }}
        blobUrl={pdfBlobUrl}
        title={docNumber ? `${watch('client.name') || 'Cliente'} - ${docNumber}` : `${meta?.label} — Vista previa`}
      />
    </div>
  )
}

