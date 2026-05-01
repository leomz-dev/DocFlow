import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import * as usersApi from '@/api/users.api'
import {
  User, Building2, Image, PenLine,
  CheckCircle, AlertCircle, Check,
  CreditCard, ExternalLink, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Primitives ─────────────────────────────────── */
function Input({ id, label, hint, error, disabled, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className='field-label'>{label}</label>}
      {hint && <p className='text-[12px] text-gray-400 mb-2 -mt-1 leading-snug'>{hint}</p>}
      <input
        id={id} {...props} disabled={disabled}
        className={cn('field-input', error && 'error', disabled && 'opacity-50 cursor-not-allowed')}
      />
      {error && (
        <div className='flex items-center gap-1.5 mt-1.5 text-red-600 text-[12px] font-semibold'>
          <AlertCircle size={12} />{error}
        </div>
      )}
    </div>
  )
}

function StatusBanner({ type, message }) {
  if (!message) return null
  const ok = type === 'success'
  return (
    <div className={cn(
      'flex items-center gap-2.5 rounded-[12px] px-4 py-3.5 text-[14px] font-semibold',
      ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
    )}>
      {ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  )
}

/* ─── Upload area ────────────────────────────────── */
function UploadArea({ label, hint, onUpload, isAttached, loading }) {
  return (
    <div>
      <p className='field-label'>{label}</p>
      {hint && <p className='text-[12px] text-gray-400 mb-2 leading-snug'>{hint}</p>}
      <label
        className={cn(
          'w-full flex flex-col items-center justify-center gap-2 h-28 rounded-[12px] border-2 border-dashed transition-all cursor-pointer',
          isAttached ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-[#0F2040] hover:bg-[#F6F8FC]',
          loading && 'opacity-60 pointer-events-none'
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-[12px] flex items-center justify-center',
          isAttached ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
        )}>
          {isAttached ? <Check size={20} /> : <Image size={20} />}
        </div>
        <p className='text-[13px] font-semibold text-gray-400'>
          {loading ? 'Subiendo...' : isAttached ? '✓ Guardado — toque para cambiar' : 'Toque para subir'}
        </p>
        <input
          type='file' accept='image/*' className='sr-only'
          disabled={loading}
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }}
        />
      </label>
    </div>
  )
}

/* ─── Collapsible section ────────────────────────── */
function Section({ icon: Icon, title, description, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className='card overflow-hidden'>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/70 transition-colors'
      >
        <div className='w-9 h-9 rounded-[12px] bg-[#E8EEF8] flex items-center justify-center text-[#0F2040] flex-shrink-0'>
          <Icon size={18} />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-[15px] font-bold text-gray-900 leading-tight'>{title}</p>
          {description && <p className='text-[12px] text-gray-400 mt-0.5 leading-tight'>{description}</p>}
        </div>
        <ChevronDown
          size={18} className={cn('text-gray-300 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className='px-5 pb-5 border-t border-gray-100 pt-5'>
          {children}
        </div>
      )}
    </div>
  )
}

function Divider({ label }) {
  return (
    <div className='flex items-center gap-3 my-1'>
      <div className='flex-1 h-px bg-gray-100' />
      <span className='text-[11px] font-bold text-gray-300 uppercase tracking-widest'>{label}</span>
      <div className='flex-1 h-px bg-gray-100' />
    </div>
  )
}

/* ─── Settings page ──────────────────────────────── */
const MAX_PAYMENT_METHODS = 3
const EMPTY_PAYMENT_METHOD = { bankName: '', bankAccountType: '', bankAccountNum: '', bankHolder: '' }

function PaymentMethodCard({ index, data, onChange, onRemove, total }) {
  const f = key => e => onChange(index, { ...data, [key]: e.target.value })
  return (
    <div className='rounded-[12px] border border-gray-200 bg-[#FAFBFD] overflow-hidden transition-all'>
      <div className='flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-[8px] bg-[#E8EEF8] flex items-center justify-center text-[#0F2040] text-[12px] font-bold'>
            {index + 1}
          </div>
          <span className='text-[13px] font-bold text-gray-700'>
            {data.bankName?.trim() || `Método de pago ${index + 1}`}
          </span>
        </div>
        {total > 1 && (
          <button
            type='button'
            onClick={() => onRemove(index)}
            className='text-[12px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-[8px] transition-colors'
          >
            Eliminar
          </button>
        )}
      </div>
      <div className='p-4 space-y-3'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Input id={`pm-bank-${index}`}  label='Banco'          value={data.bankName}        onChange={f('bankName')}        placeholder='Bancolombia' />
          <Input id={`pm-type-${index}`}  label='Tipo de cuenta' value={data.bankAccountType} onChange={f('bankAccountType')} placeholder='Ahorros' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Input id={`pm-num-${index}`}   label='Número'         value={data.bankAccountNum}  onChange={f('bankAccountNum')}  placeholder='000-000000-00' />
          <Input id={`pm-hold-${index}`}  label='Titular'        value={data.bankHolder}       onChange={f('bankHolder')}       placeholder='Razón Social' />
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, company, updateUserInContext } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [infoStatus,    setInfoStatus]    = useState({ type: null, msg: '' })
  const [infoLoading,   setInfoLoading]   = useState(false)
  const [logoLoading,   setLogoLoading]   = useState(false)
  const [signLoading,   setSignLoading]   = useState(false)
  const [assetsStatus,  setAssetsStatus]  = useState({ type: null, msg: '' })
  const [compStatus,    setCompStatus]    = useState({ type: null, msg: '' })
  const [compLoading,   setCompLoading]   = useState(false)

  // ── Migrate legacy single-bank fields to paymentMethods array ──
  const buildInitialPaymentMethods = () => {
    if (Array.isArray(company?.paymentMethods) && company.paymentMethods.length > 0) {
      return company.paymentMethods
    }
    // Legacy migration: if old fields exist, create one entry
    if (company?.bankName) {
      return [{
        bankName: company.bankName || '',
        bankAccountType: company.bankAccountType || '',
        bankAccountNum: company.bankAccountNum || '',
        bankHolder: company.bankHolder || '',
      }]
    }
    return []
  }

  const [c, setC] = useState({
    name:            company?.name            ?? '',
    nit:             company?.nit             ?? '',
    phone:           company?.phone           ?? '',
    email:           company?.email           ?? '',
    address:         company?.address         ?? '',
    city:            company?.city            ?? '',
    department:      company?.department      ?? '',
    country:         company?.country         ?? 'Colombia',
    website:         company?.website         ?? '',
    legalRep:        company?.legalRep        ?? '',
    legalRepId:      company?.legalRepId      ?? '',
    paymentMethods:  buildInitialPaymentMethods(),
  })

  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const f = key => e => setC(prev => ({ ...prev, [key]: e.target.value }))
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024

  const validateImage = (file) => {
    if (!file?.type?.startsWith('image/')) return 'Solo se permiten imágenes.'
    if (file.size > MAX_IMAGE_BYTES) return 'La imagen supera 5MB.'
    return null
  }

  // ── Payment methods handlers ──
  const addPaymentMethod = () => {
    if (c.paymentMethods.length >= MAX_PAYMENT_METHODS) return
    setC(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, { ...EMPTY_PAYMENT_METHOD }] }))
  }
  const updatePaymentMethod = (idx, data) => {
    setC(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((m, i) => i === idx ? data : m)
    }))
  }
  const removePaymentMethod = (idx) => {
    setC(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, i) => i !== idx)
    }))
  }

  const uploadAsset = async (kind, file) => {
    const validationError = validateImage(file)
    if (validationError) {
      setAssetsStatus({ type: 'error', msg: validationError })
      return
    }

    setAssetsStatus({ type: null, msg: '' })
    const setLoading = kind === 'logo' ? setLogoLoading : setSignLoading

    try {
      setLoading(true)
      const updatedUser = kind === 'logo'
        ? await usersApi.uploadLogo(file)
        : await usersApi.uploadSign(file)
      updateUserInContext(updatedUser)
      setAssetsStatus({
        type: 'success',
        msg: kind === 'logo' ? 'Logo guardado correctamente.' : 'Firma guardada correctamente.'
      })
    } catch (err) {
      setAssetsStatus({
        type: 'error',
        msg: err?.response?.data?.error || 'No se pudo subir la imagen. Intente de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  const saveInfo = async (e) => {
    e.preventDefault(); setInfoLoading(true); setInfoStatus({ type: null, msg: '' })
    try {
      updateUserInContext(await usersApi.updateMe({ name }))
      setInfoStatus({ type: 'success', msg: '¡Nombre actualizado!' })
    } catch (err) {
      setInfoStatus({ type: 'error', msg: err?.response?.data?.error || 'Error al actualizar.' })
    } finally { setInfoLoading(false) }
  }

  const saveCompany = async (e) => {
    e.preventDefault(); setCompLoading(true); setCompStatus({ type: null, msg: '' })
    try {
      updateUserInContext(await usersApi.updateMe({ company: c }))
      setCompStatus({ type: 'success', msg: '¡Datos de empresa guardados!' })
    } catch (err) {
      setCompStatus({ type: 'error', msg: err?.response?.data?.error || 'Error al guardar.' })
    } finally { setCompLoading(false) }
  }

  return (
    <div className='fade-in space-y-4 pb-24'>

      {/* ── Account ── */}
      <Section icon={User} title='Mi cuenta' description='Perfil e información personal' defaultOpen>
        <form onSubmit={saveInfo} className='space-y-4'>
          {/* Avatar + name */}
          <div className='flex items-center gap-4 bg-[#F6F8FC] rounded-[12px] p-4 mb-2'>
            <div className='w-14 h-14 rounded-[12px] bg-[#0F2040] flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0'>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt='' className='w-full h-full object-cover' />
                : initials
              }
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-[15px] font-bold text-gray-900 truncate'>{user?.name || 'Usuario'}</p>
              <p className='text-[12px] text-gray-400 truncate'>{user?.email}</p>
              <a
                href='https://myaccount.google.com/' target='_blank' rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-[11px] text-[#2563EB] font-semibold mt-1 hover:underline'
              >
                Gestionar en Google <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <Input
            id='s-name'
            label='Su nombre de perfil'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Nombre completo'
          />
          <Input
            id='s-email'
            label='Correo (no editable)'
            type='email'
            value={user?.email || ''}
            disabled
          />
          <StatusBanner type={infoStatus.type} message={infoStatus.msg} />
          <button type='submit' disabled={infoLoading} className='btn btn-primary w-full'>
            {infoLoading ? 'Guardando...' : 'Guardar nombre'}
          </button>
        </form>
      </Section>

      {/* ── Logo & Sign ── */}
      <Section icon={Image} title='Logo y Firma' description='Aparecen en sus PDFs generados' defaultOpen>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 tour-settings-logo'>
          <UploadArea
            label='Logo' hint='PNG o JPG'
            onUpload={f => uploadAsset('logo', f)}
            isAttached={!!company?.logoPath} loading={logoLoading}
          />
          <UploadArea
            label='Firma' hint='PNG fondo transparente'
            onUpload={f => uploadAsset('sign', f)}
            isAttached={!!company?.signPath} loading={signLoading}
          />
        </div>
        <div className='mt-3'>
          <StatusBanner type={assetsStatus.type} message={assetsStatus.msg} />
        </div>
      </Section>

      {/* ── Company data ── */}
      <Section icon={Building2} title='Datos de empresa' description='Información que aparece en todos sus documentos' defaultOpen={!!(company?.name)}>
        <form onSubmit={saveCompany} className='space-y-4 tour-settings-data'>

          <Divider label='Empresa' />
          <Input id='c-name'    label='Nombre o Razón Social' value={c.name}    onChange={f('name')}    placeholder='Mi Empresa S.A.S.' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Input id='c-nit'   label='NIT / RUT'            value={c.nit}     onChange={f('nit')}     placeholder='900.123.456-7' />
            <Input id='c-phone' label='Teléfono'             value={c.phone}   onChange={f('phone')}   placeholder='+57 300...' type='tel' />
          </div>
          <Input id='c-email'   label='Correo de contacto'   value={c.email}   onChange={f('email')}   placeholder='contacto@empresa.com' type='email' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Input id='c-city'  label='Ciudad'               value={c.city}    onChange={f('city')}    placeholder='Bogotá' />
            <Input id='c-dept'  label='Departamento'         value={c.department} onChange={f('department')} placeholder='Cundinamarca' />
          </div>
          <Input id='c-addr'    label='Dirección'            value={c.address} onChange={f('address')} placeholder='Calle 123 # 45-67' />

          <Divider label='Representante Legal' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Input id='c-legal'   label='Nombre'   value={c.legalRep}   onChange={f('legalRep')}   placeholder='Nombre Completo' />
            <Input id='c-legid'   label='Cédula'   value={c.legalRepId} onChange={f('legalRepId')} placeholder='1.000.000.000' />
          </div>

          <Divider label='Métodos de Pago' />
          <p className='text-[12px] text-gray-400 -mt-2 leading-snug'>
            Agregue hasta {MAX_PAYMENT_METHODS} cuentas bancarias. Aparecerán en todos sus documentos.
          </p>

          <div className='space-y-3'>
            {c.paymentMethods.map((pm, i) => (
              <PaymentMethodCard
                key={i}
                index={i}
                data={pm}
                onChange={updatePaymentMethod}
                onRemove={removePaymentMethod}
                total={c.paymentMethods.length}
              />
            ))}
          </div>

          {c.paymentMethods.length < MAX_PAYMENT_METHODS && (
            <button
              type='button'
              onClick={addPaymentMethod}
              className='w-full flex items-center justify-center gap-2 py-3 rounded-[12px] border-2 border-dashed border-gray-200 text-[13px] font-semibold text-gray-400 hover:border-[#0F2040] hover:text-[#0F2040] hover:bg-[#F6F8FC] transition-all'
            >
              <CreditCard size={16} />
              Añadir método de pago ({c.paymentMethods.length}/{MAX_PAYMENT_METHODS})
            </button>
          )}

          <StatusBanner type={compStatus.type} message={compStatus.msg} />
          <button type='submit' disabled={compLoading} className='btn btn-primary w-full mt-2'>
            {compLoading ? 'Guardando...' : 'Guardar datos de empresa'}
          </button>
        </form>
      </Section>

    </div>
  )
}

