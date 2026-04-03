import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import * as usersApi from '@/api/users.api'
import {
  Settings, User, Lock, Building2, Upload,
  CheckCircle, AlertCircle, Phone, Mail,
  MapPin, Hash, Image, PenLine, FileText
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
          error && "ring-2 ring-error/50 bg-error-container/10"
        )}
        {...props}
      />
    </div>
  )
}

/* ─── Upload Card ─────────────────────────────────── */
function UploadCard({ label, icon: Icon, hint, onUpload, preview, loading }) {
  const inputRef = useRef(null)
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-sans">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 h-40 rounded-[1rem] border-2 border-dashed transition-colors cursor-pointer',
          'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low',
          loading && 'opacity-60 pointer-events-none'
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="h-full w-full object-contain rounded-lg p-2"
          />
        ) : (
          <>
            <Icon size={32} className="text-on-surface-variant/50" />
            <p className="text-xs text-on-surface-variant font-medium text-center px-4 font-sans">{hint}</p>
          </>
        )}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-primary-container text-on-primary-container text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
          <Upload size={12} />
          {loading ? 'Subiendo...' : 'Camabiar'}
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
  const [name, setName]   = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [infoStatus, setInfoStatus] = useState({ type: null, message: '' })
  const [infoLoading, setInfoLoading] = useState(false)

  /* ── Password change ── */
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdStatus, setPwdStatus]   = useState({ type: null, message: '' })
  const [pwdLoading, setPwdLoading] = useState(false)

  /* ── Company fields ── */
  const [companyForm, setCompanyForm] = useState({
    name:       company?.name       ?? '',
    nit:        company?.nit        ?? '',
    phone:      company?.phone      ?? '',
    email:      company?.email      ?? '',
    address:    company?.address    ?? '',
    city:       company?.city       ?? '',
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
  const [logoPreview, setLogoPreview] = useState(
    company?.logoPath ? `${BASE_URL}/uploads/${company.logoPath}` : null
  )
  const [signPreview, setSignPreview] = useState(
    company?.signPath ? `${BASE_URL}/uploads/${company.signPath}` : null
  )

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
      const updated = await usersApi.updateMe({ name, email })
      updateUserInContext(updated)
      setInfoStatus({ type: 'success', message: 'Información de cuenta actualizada.' })
    } catch (err) {
      setInfoStatus({ type: 'error', message: err?.response?.data?.error || 'Error al actualizar.' })
    } finally {
      setInfoLoading(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPwd !== confirmPwd) {
      setPwdStatus({ type: 'error', message: 'Las contraseñas nuevas no coinciden.' })
      return
    }
    if (newPwd.length < 6) {
      setPwdStatus({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }
    setPwdLoading(true)
    setPwdStatus({ type: null, message: '' })
    try {
      const updated = await usersApi.updateMe({ currentPassword: currentPwd, newPassword: newPwd })
      updateUserInContext(updated)
      setPwdStatus({ type: 'success', message: 'Contraseña actualizada correctamente.' })
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch (err) {
      setPwdStatus({ type: 'error', message: err?.response?.data?.error || 'Error al cambiar la contraseña.' })
    } finally {
      setPwdLoading(false)
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
      setLogoPreview(URL.createObjectURL(file))
    } catch {
      // silent
    } finally {
      setLogoLoading(false)
    }
  }

  async function handleSign(file) {
    setSignLoading(true)
    try {
      const updated = await usersApi.uploadSign(file)
      updateUserInContext(updated)
      setSignPreview(URL.createObjectURL(file))
    } catch {
      // silent
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
        <p className="text-on-surface-variant font-sans mt-1">Administra tu cuenta y el perfil de empresa para la generación de documentos.</p>
      </div>

      {/* ══════════════════════════════════════════════
          SECCIÓN 1 — INFORMACIÓN DE CUENTA
      ══════════════════════════════════════════════ */}
      <div className="space-y-6">
        <SectionHeader
          icon={User}
          title="Tu Cuenta"
          description="Datos personales y de seguridad."
        />

        <div className="bg-surface-container-lowest shadow-surface-sm rounded-[1.5rem] p-8 border-none grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Info Form */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 shrink-0 bg-primary text-on-primary flex items-center justify-center rounded-2xl font-bold text-xl shadow-primary-md">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface font-sans">{user?.name || 'Administrador'}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">{user?.email}</p>
                <div className="mt-2 inline-flex bg-primary-container text-on-primary-container text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  {user?.role ?? 'ADMIN'}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
               <SettingsInput
                  id="settings-name"
                  label="Nombre Completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
                <SettingsInput
                  id="settings-email"
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              <Alert type={infoStatus.type} message={infoStatus.message} />
              <button 
                type="submit" 
                disabled={infoLoading} 
                className="w-full bg-secondary-container text-on-secondary-container font-bold text-sm px-6 py-3 rounded-xl hover:bg-secondary-fixed transition-colors active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                {infoLoading ? 'Guardando...' : 'Actualizar Perfil'}
              </button>
            </form>
          </div>

          {/* Password form */}
          <div className="space-y-6 pt-6 md:pt-0 md:pl-8 md:border-l border-outline-variant/20">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 font-sans">
              <Lock size={18} className="text-primary" /> Seguridad
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <SettingsInput
                id="current-pwd"
                label="Contraseña actual"
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
               <SettingsInput
                  id="new-pwd"
                  label="Nueva contraseña"
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <SettingsInput
                  id="confirm-pwd"
                  label="Confirmar contraseña"
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              <Alert type={pwdStatus.type} message={pwdStatus.message} />
              <button 
                type="submit" 
                disabled={pwdLoading || !currentPwd} 
                 className="w-full bg-surface-container-high text-on-surface font-bold text-sm px-6 py-3 rounded-xl hover:bg-surface-container-highest transition-colors active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                {pwdLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </form>
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
                preview={logoPreview}
                loading={logoLoading}
              />
              <UploadCard
                label="Firma digital responsable"
                icon={PenLine}
                hint="PNG con fondo transparente recortado a los márgenes"
                onUpload={handleSign}
                preview={signPreview}
                loading={signLoading}
              />
            </div>
          </div>

          {/* Company data form */}
          <div className="bg-surface-container-low/40 rounded-[2rem] p-8 border border-outline-variant/10">
            <form onSubmit={handleSaveCompany} className="space-y-10">
              
              {/* Información Comercial */}
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

              {/* Representante Legal */}
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
