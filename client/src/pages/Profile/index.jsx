import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import * as usersApi from '@/api/users.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Building2, Upload, CheckCircle, AlertCircle,
  Phone, Mail, MapPin, FileText, Hash, Image, PenLine
} from 'lucide-react'
import { cn } from '@/lib/utils'

function Alert({ type, message }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm',
      isError
        ? 'bg-destructive/10 text-destructive border border-destructive/20'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    )}>
      {isError ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {message}
    </div>
  )
}

function UploadCard({ label, icon: Icon, hint, onUpload, preview, loading }) {
  const inputRef = useRef(null)
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
          'border-border hover:border-primary/50 hover:bg-accent/50',
          loading && 'opacity-60 pointer-events-none'
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="max-h-28 max-w-full object-contain rounded-md"
          />
        ) : (
          <>
            <Icon size={28} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center px-4">{hint}</p>
          </>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
          <Upload size={10} />
          {loading ? 'Subiendo...' : 'Cambiar'}
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

export default function ProfilePage() {
  const { user, company, updateUserInContext } = useAuth()

  /* ── Company fields ── */
  const [form, setForm] = useState({
    name:      company?.name      ?? '',
    nit:       company?.nit       ?? '',
    phone:     company?.phone     ?? '',
    email:     company?.email     ?? '',
    address:   company?.address   ?? '',
    city:      company?.city      ?? '',
    country:   company?.country   ?? '',
    website:   company?.website   ?? '',
    tagline:   company?.tagline   ?? '',
  })
  const [status, setStatus]   = useState({ type: null, message: '' })
  const [loading, setLoading] = useState(false)

  /* ── Logo / Sign upload ── */
  const [logoLoading, setLogoLoading] = useState(false)
  const [signLoading, setSignLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(
    company?.logoPath ? `http://localhost:3001/${company.logoPath}` : null
  )
  const [signPreview, setSignPreview] = useState(
    user?.signPath ? `http://localhost:3001/${user.signPath}` : null
  )

  function handleField(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  /* ── Save company data ── */
  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: null, message: '' })
    try {
      const updated = await usersApi.updateMe({ company: form })
      updateUserInContext(updated)
      setStatus({ type: 'success', message: 'Perfil de empresa actualizado.' })
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.error || 'Error al guardar.' })
    } finally {
      setLoading(false)
    }
  }

  /* ── Upload logo ── */
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

  /* ── Upload sign ── */
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Perfil de Empresa</h1>
          <p className="text-sm text-muted-foreground">Datos que aparecerán en tus documentos generados</p>
        </div>
      </div>

      <Separator />

      {/* ── Assets: Logo & Firma ── */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Image size={16} className="text-primary" />
          <h2 className="text-base font-semibold text-foreground">Logo y Firma</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UploadCard
            label="Logo de la empresa"
            icon={Image}
            hint="Sube el logo en PNG o JPG (fondo transparente recomendado)"
            onUpload={handleLogo}
            preview={logoPreview}
            loading={logoLoading}
          />
          <UploadCard
            label="Firma digital"
            icon={PenLine}
            hint="Sube tu firma en PNG con fondo transparente"
            onUpload={handleSign}
            preview={signPreview}
            loading={signLoading}
          />
        </div>
      </section>

      {/* ── Company Info Form ── */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <h2 className="text-base font-semibold text-foreground">Información de la empresa</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Row 1: Nombre + NIT */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-name">
                <Building2 size={12} className="inline mr-1 text-muted-foreground" />
                Nombre / Razón social
              </Label>
              <Input
                id="company-name"
                value={form.name}
                onChange={handleField('name')}
                placeholder="Mi Empresa S.A.S."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-nit">
                <Hash size={12} className="inline mr-1 text-muted-foreground" />
                NIT / RUT
              </Label>
              <Input
                id="company-nit"
                value={form.nit}
                onChange={handleField('nit')}
                placeholder="900.123.456-7"
              />
            </div>
          </div>

          {/* Row 2: Teléfono + Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-phone">
                <Phone size={12} className="inline mr-1 text-muted-foreground" />
                Teléfono
              </Label>
              <Input
                id="company-phone"
                value={form.phone}
                onChange={handleField('phone')}
                placeholder="+57 300 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-email">
                <Mail size={12} className="inline mr-1 text-muted-foreground" />
                Correo de contacto
              </Label>
              <Input
                id="company-email"
                type="email"
                value={form.email}
                onChange={handleField('email')}
                placeholder="contacto@empresa.com"
              />
            </div>
          </div>

          {/* Row 3: Dirección */}
          <div className="space-y-1.5">
            <Label htmlFor="company-address">
              <MapPin size={12} className="inline mr-1 text-muted-foreground" />
              Dirección
            </Label>
            <Input
              id="company-address"
              value={form.address}
              onChange={handleField('address')}
              placeholder="Calle 123 # 45-67"
            />
          </div>

          {/* Row 4: Ciudad + País */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-city">Ciudad</Label>
              <Input
                id="company-city"
                value={form.city}
                onChange={handleField('city')}
                placeholder="Bogotá"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-country">País</Label>
              <Input
                id="company-country"
                value={form.country}
                onChange={handleField('country')}
                placeholder="Colombia"
              />
            </div>
          </div>

          {/* Row 5: Website + Tagline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-website">Sitio web</Label>
              <Input
                id="company-website"
                value={form.website}
                onChange={handleField('website')}
                placeholder="www.empresa.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-tagline">Eslogan</Label>
              <Input
                id="company-tagline"
                value={form.tagline}
                onChange={handleField('tagline')}
                placeholder="Innovación que transforma"
              />
            </div>
          </div>

          <Alert type={status.type} message={status.message} />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="min-w-[160px]">
              {loading ? 'Guardando...' : 'Guardar perfil'}
            </Button>
          </div>
        </form>
      </section>

    </div>
  )
}
