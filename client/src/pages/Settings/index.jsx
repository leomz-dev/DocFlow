import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import * as usersApi from '@/api/users.api'
import {
  Settings, User, Building2, Upload,
  CheckCircle, AlertCircle, Phone, Mail,
  MapPin, Image, PenLine, FileText, ExternalLink,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Inline Alert ────────────────────────────────── */
function Alert({ type, message }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold mt-4',
      isError
        ? 'bg-error-container/20 text-error border border-error/50'
        : 'bg-tertiary-fixed/20 text-tertiary border border-tertiary/20'
    )}>
      {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      {message}
    </div>
  )
}

/* ─── Custom Inputs ───────────────────────────────── */
function SettingsInput({ label, id, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans mb-2">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none text-on-surface placeholder:text-on-surface-variant/50",
          error && "ring-2 ring-error/50 bg-error-container/10",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        {...props}
      />
    </div>
  )
}

/* ─── Upload Card ─────────────────────────────────── */
function UploadCard({ label, icon: Icon, hint, onUpload, isAttached, loading }) {
  const inputRef = useRef(null)
  
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 h-40 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden group',
          isAttached 
            ? 'border-tertiary/30 bg-tertiary/5' 
            : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low',
          loading && 'opacity-60 pointer-events-none'
        )}
      >
        {/* Background Pattern for Attached State */}
        {isAttached && (
          <div className="absolute inset-0 z-0 opacity-10">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tertiary via-transparent to-transparent" />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-3">
          {isAttached ? (
            <>
              <div className="h-16 w-16 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shadow-sm border border-tertiary/20 animate-in zoom-in-75 duration-300">
                <CheckCircle size={32} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-on-surface font-sans uppercase tracking-tight">Archivo Vinculado</p>
                <p className="text-[10px] text-tertiary/80 font-bold uppercase tracking-widest mt-0.5">Listo para usar</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon size={24} />
              </div>
              <p className="text-xs text-on-surface-variant font-medium text-center px-4 font-sans max-w-[200px]">{hint}</p>
            </>
          )}
        </div>

        {/* Floating Label */}
        <div className={cn(
          "absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm z-20",
          isAttached 
            ? "bg-tertiary-container text-on-tertiary-container group-hover:bg-tertiary group-hover:text-on-tertiary" 
            : "bg-primary-container text-on-primary-container group-hover:bg-primary group-hover:text-on-primary"
        )}>
          {loading ? (
             <span className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
               Subiendo...
             </span>
          ) : (
            <>
              <Upload size={12} />
              {isAttached ? 'Sustituir' : 'Subir Archivo'}
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}

/* ─── Section Header ──────────────────────────────── */
function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-on-surface font-sans">{title}</h2>
        {description && <p className="text-xs text-on-surface-variant font-sans font-medium">{description}</p>}
      </div>
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────── */
export default function SettingsPage() {
  const { user, company, updateUserInContext } = useAuth()
  const BASE_URL = 'http://localhost:3001'

  /* ── Account info ── */
  const [name, setName] = useState(user?.name ?? '')
  const [infoStatus, setInfoStatus] = useState({ type: null, message: '' })
  const [infoLoading, setInfoLoading] = useState(false)

  /* ── Company fields ── */
  const [companyForm, setCompanyForm] = useState({
    name:       company?.name       ?? '',
    nit:        company?.nit        ?? '',
    phone:      company?.phone      ?? '',
    email:      company?.email      ?? '',
    address:    company?.address    ?? '',
    city:       company?.city       ?? '',
    department: company?.department ?? '',
    country:    company?.country    ?? '',
    website:    company?.website    ?? '',
    tagline:    company?.tagline    ?? '',
    legalRep:   company?.legalRep   ?? '',
    legalRepId: company?.legalRepId ?? '',
  })
  const [companyStatus, setCompanyStatus] = useState({ type: null, message: '' })
  const [companyLoading, setCompanyLoading] = useState(false)

  /* ── Logo / Sign upload ── */
  const [logoLoading, setLogoLoading] = useState(false)
  const [signLoading, setSignLoading] = useState(false)

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleCompanyField(key) {
    return (e) => setCompanyForm(f => ({ ...f, [key]: e.target.value }))
  }

  /* ─── Handlers ─────────────────────────────────── */

  async function handleSaveInfo(e) {
    e.preventDefault()
    setInfoLoading(true)
    setInfoStatus({ type: null, message: '' })
    try {
      const updated = await usersApi.updateMe({ name })
      updateUserInContext(updated)
      setInfoStatus({ type: 'success', message: 'Información de cuenta actualizada.' })
    } catch (err) {
      setInfoStatus({ type: 'error', message: err?.response?.data?.error || 'Error al actualizar.' })
    } finally {
      setInfoLoading(false)
    }
  }

  async function handleSaveCompany(e) {
    e.preventDefault()
    setCompanyLoading(true)
    setCompanyStatus({ type: null, message: '' })
    try {
      const updated = await usersApi.updateMe({ company: companyForm })
      updateUserInContext(updated)
      setCompanyStatus({ type: 'success', message: 'Perfil de empresa guardado.' })
    } catch (err) {
      setCompanyStatus({ type: 'error', message: err?.response?.data?.error || 'Error al guardar.' })
    } finally {
      setCompanyLoading(false)
    }
  }

  async function handleLogo(file) {
    setLogoLoading(true)
    try {
      const updated = await usersApi.uploadLogo(file)
      updateUserInContext(updated)
    } catch (err) {
      console.error('Error al subir logo:', err)
    } finally {
      setLogoLoading(false)
    }
  }

  async function handleSign(file) {
    setSignLoading(true)
    try {
      const updated = await usersApi.uploadSign(file)
      updateUserInContext(updated)
    } catch (err) {
      console.error('Error al subir firma:', err)
    } finally {
      setSignLoading(false)
    }
  }

  /* ─── Render ────────────────────────────────────── */
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-fade-in">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight font-sans">Configuración</h1>
        <p className="text-on-surface-variant font-sans mt-1">Administra tu cuenta de Google y el perfil de empresa.</p>
      </div>

      {/* ══════════════════════════════════════════════
          SECCIÓN 1 — INFORMACIÓN DE CUENTA
      ══════════════════════════════════════════════ */}
      <div className="space-y-6">
        <SectionHeader
          icon={User}
          title="Tu Cuenta de Google"
          description="Gestión de perfil vinculada a Google OAuth."
        />

        <div className="bg-surface-container-lowest shadow-surface-sm rounded-[1.5rem] p-8 border-none grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Info Form */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-primary shadow-primary-md">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-on-primary font-bold text-xl uppercase">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface font-sans">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                  <ExternalLink size={10} /> Cuenta de Google
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
               <SettingsInput
                  id="settings-name"
                  label="Nombre de Perfil"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
                <SettingsInput
                  id="settings-email"
                  label="Correo vinculado (Google)"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed italic">
                * Tu correo electrónico no puede ser modificado ya que es el identificador principal de tu cuenta de Google.
              </p>
              <Alert type={infoStatus.type} message={infoStatus.message} />
              <button 
                type="submit" 
                disabled={infoLoading} 
                className="w-full bg-secondary-container text-on-secondary-container font-bold text-sm px-6 py-3 rounded-xl hover:bg-secondary-fixed transition-colors active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                {infoLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="space-y-6 flex flex-col justify-center items-center text-center p-6 bg-surface-container-low/40 rounded-[1.5rem] border border-outline-variant/10">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Mail size={24} />
            </div>
            <h3 className="text-sm font-bold text-on-surface font-sans">Autenticación Segura</h3>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-xs">
              Tu acceso está protegido por Google. Los cambios en tu contraseña o seguridad principal deben realizarse a través de tu cuenta de Google.
            </p>
            <a 
              href="https://myaccount.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-2"
            >
              Ir a mi cuenta de Google <ExternalLink size={12} />
            </a>
          </div>

        </div>

      </div>

      <div className="w-full h-px bg-outline-variant/20 my-8"></div>

      {/* ══════════════════════════════════════════════
          SECCIÓN 2 — PERFIL DE EMPRESA
      ══════════════════════════════════════════════ */}
      <div className="space-y-6">
        <SectionHeader
          icon={Building2}
          title="Empresa y Branding"
          description="Información pública y activos de marca para los documentos generados."
        />

        <div className="bg-surface-container-lowest shadow-surface-sm rounded-[1.5rem] p-8 border-none space-y-10">
          
          {/* Logo & Firma */}
          <div>
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-6 font-sans border-b border-outline-variant/10 pb-3">
              <Image size={18} className="text-primary" /> Activos Visuales
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <UploadCard
                label="Logo de la empresa"
                icon={Image}
                hint="PNG o JPG, fondo transparente recomendado"
                onUpload={handleLogo}
                isAttached={!!company?.logoPath}
                loading={logoLoading}
              />
              <UploadCard
                label="Firma digital responsable"
                icon={PenLine}
                hint="PNG con fondo transparente recortado a los márgenes"
                onUpload={handleSign}
                isAttached={!!company?.signPath}
                loading={signLoading}
              />
            </div>
          </div>

          {/* Company data form */}
          <div className="bg-surface-container-low/40 rounded-[2rem] p-8 border border-outline-variant/10">
            <form onSubmit={handleSaveCompany} className="space-y-10">
              
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 font-sans border-b border-outline-variant/10 pb-3">
                  <FileText size={18} className="text-primary" /> Información Comercial
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <SettingsInput
                    id="c-name"
                    label="Nombre / Razón social"
                    value={companyForm.name}
                    onChange={handleCompanyField('name')}
                    placeholder="Mi Empresa S.A.S."
                  />
                  <SettingsInput
                    id="c-nit"
                    label="NIT / RUT"
                    value={companyForm.nit}
                    onChange={handleCompanyField('nit')}
                    placeholder="900.123.456-7"
                  />
                  <SettingsInput
                    id="c-phone"
                    label="Teléfono"
                    value={companyForm.phone}
                    onChange={handleCompanyField('phone')}
                    placeholder="+57 300 000 0000"
                  />
                  <SettingsInput
                    id="c-email"
                    label="Correo de contacto"
                    type="email"
                    value={companyForm.email}
                    onChange={handleCompanyField('email')}
                    placeholder="contacto@empresa.com"
                  />
                  <div className="sm:col-span-2">
                    <SettingsInput
                      id="c-address"
                      label="Dirección"
                      value={companyForm.address}
                      onChange={handleCompanyField('address')}
                      placeholder="Calle 123 # 45-67"
                    />
                  </div>
                  <SettingsInput
                    id="c-city"
                    label="Ciudad"
                    value={companyForm.city}
                    onChange={handleCompanyField('city')}
                    placeholder="Barranquilla"
                  />
                  <SettingsInput
                    id="c-dept"
                    label="Departamento / Estado"
                    value={companyForm.department}
                    onChange={handleCompanyField('department')}
                    placeholder="Atlántico"
                  />
                  <SettingsInput
                    id="c-country"
                    label="País"
                    value={companyForm.country}
                    onChange={handleCompanyField('country')}
                    placeholder="Colombia"
                  />
                  <SettingsInput
                    id="c-website"
                    label="Sitio web"
                    value={companyForm.website}
                    onChange={handleCompanyField('website')}
                    placeholder="www.empresa.com"
                  />
                  <SettingsInput
                    id="c-tagline"
                    label="Eslogan Comercial"
                    value={companyForm.tagline}
                    onChange={handleCompanyField('tagline')}
                    placeholder="Innovación que transforma"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 font-sans border-b border-outline-variant/10 pb-3 mb-2">
                  <User size={18} className="text-primary" /> Representante Legal
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <SettingsInput
                    id="c-legalRep"
                    label="Nombre del representante"
                    value={companyForm.legalRep}
                    onChange={handleCompanyField('legalRep')}
                    placeholder="Nombre Completo"
                  />
                  <SettingsInput
                    id="c-legalRepId"
                    label="Cédula"
                    value={companyForm.legalRepId}
                    onChange={handleCompanyField('legalRepId')}
                    placeholder="1.000.000.000"
                  />
                </div>
              </div>

              <Alert type={companyStatus.type} message={companyStatus.message} />

              <div className="flex justify-end pt-8 border-t border-outline-variant/10">
                <button 
                  type="submit" 
                  disabled={companyLoading} 
                  className="bg-primary text-white font-bold text-sm px-12 py-4 rounded-2xl shadow-primary-glow hover:shadow-primary-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {companyLoading ? 'Guardando...' : 'Guardar Información de Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
