import React from 'react'
import {
  BookOpen, Rocket, Settings, Users, FileText,
  ShieldCheck, HelpCircle, ArrowRight, CheckCircle2,
  Info, Sparkles, ChevronRight, Zap, Lightbulb
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const Section = ({ icon: Icon, title, children, colorClass = "bg-primary/10 text-primary" }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-2xl font-bold text-on-surface tracking-tight">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
)

const HelpCard = ({ title, description, items = [], badge }) => (
  <Card className="border-outline-variant/10 bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 shadow-sm hover:shadow-md group overflow-hidden relative">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Sparkles size={48} />
    </div>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{title}</CardTitle>
        {badge && <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] uppercase tracking-wider">{badge}</Badge>}
      </div>
      <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3 mt-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant/80">
            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest animate-pulse">
          <BookOpen size={14} /> Centro de Aprendizaje
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter leading-none">
          Domina <span className="text-primary italic">DocFlow</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Bienvenido a la guía oficial de DocFlow. Aquí encontrarás todo lo que necesitas para profesionalizar tus documentos y optimizar la gestión de tus clientes.
        </p>
      </section>

      <Separator className="bg-outline-variant/10" />

      {/* Getting Started */}
      <Section icon={Rocket} title="Primeros Pasos" colorClass="bg-blue-500/10 text-blue-600">
        <HelpCard 
          title="Configuración Inicial"
          description="Prepara tu entorno para generar documentos profesionales con tu identidad de marca."
          items={[
            "Sube el logo de tu empresa en Settings",
            "Configura tu firma digital para validez técnica",
            "Establece tus datos de contacto básicos",
            "Define tu moneda y formato de fecha preferido"
          ]}
          badge="Esencial"
        />
        <HelpCard 
          title="Seguridad y Perfil"
          description="Gestiona tu acceso y la información que ven tus clientes en la plataforma."
          items={[
            "Vincula tu cuenta de Google para acceso rápido",
            "Mantén tus datos fiscales actualizados",
            "Verifica tu rol y permisos en el sistema",
            "Cierra sesión de forma segura en dispositivos compartidos"
          ]}
          badge="Seguridad"
        />
      </Section>

      {/* Document Generation */}
      <Section icon={FileText} title="Generación de Documentos" colorClass="bg-emerald-500/10 text-emerald-600">
        <HelpCard 
          title="Tipos de Documentos"
          description="DocFlow soporta tres pilares fundamentales para tu gestión administrativa."
          items={[
            "Cuenta de Cobro: Facturación sencilla de servicios",
            "Cotización: Propuestas comerciales detalladas",
            "Contrato: Formalización legal de servicios",
            "Exportación inmediata a PDF optimizado"
          ]}
          badge="Core"
        />
        <HelpCard 
          title="Automatización de Cálculos"
          description="Olvídate de las calculadoras. DocFlow hace el trabajo pesado por ti."
          items={[
            "Cálculo automático de Retención en la fuente",
            "Sumatorias dinámicas de ítems y servicios",
            "Desglose claro de impuestos y netos",
            "Configuración personalizada de porcentajes"
          ]}
          badge="Smart"
        />
      </Section>

      {/* Clients & History */}
      <Section icon={Users} title="Gestión Integral" colorClass="bg-violet-500/10 text-violet-600">
        <HelpCard 
          title="Base de Datos de Clientes"
          description="Ahorra tiempo reutilizando la información de tus clientes frecuentes."
          items={[
            "Almacenamiento de NIT/Cédula y direcciones",
            "Autocompletado inteligente en nuevos documentos",
            "Búsqueda rápida por nombre o documento",
            "Gestión centralizada de contactos"
          ]}
          badge="CRM"
        />
        <HelpCard 
          title="Historial de Actividad"
          description="Mantén un control total sobre cada documento que has generado."
          items={[
            "Filtros avanzados por fecha y tipo",
            "Estado de generación y descarga",
            "Visualización previa antes de imprimir",
            "Organización cronológica inteligente"
          ]}
          badge="Admin"
        />
      </Section>

      {/* Tips Section */}
      <section className="bg-primary/5 rounded-3xl p-8 md:p-12 relative overflow-hidden ring-1 ring-primary/10">
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Lightbulb size={300} className="text-primary" />
        </div>
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-primary font-bold tracking-widest text-sm uppercase">
            <Zap size={20} /> Pro Tip
          </div>
          <h2 className="text-3xl font-black text-on-surface">Optimiza tu Flujo de Trabajo</h2>
          <p className="text-on-surface-variant leading-relaxed">
            ¿Sabías que si configuras tu <strong>Retención en la Fuente</strong> por defecto en los Ajustes, se aplicará automáticamente a cada nueva Cuenta de Cobro? Esto te ahorrará minutos valiosos en cada factura.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:shadow-primary-glow transition-all flex items-center gap-2">
              Ir a Ajustes <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Mini */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Preguntas Frecuentes</h2>
          <p className="text-on-surface-variant">Soluciones rápidas a dudas comunes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2 text-primary">
              <Info size={18} /> ¿Cómo edito un PDF?
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Los documentos generados son finales para garantizar integridad. Si necesitas cambios, genera uno nuevo desde el Historial.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2 text-primary">
              <Info size={18} /> ¿Es seguro mi logo?
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Sí, DocFlow almacena tus activos de marca de forma privada y solo los utiliza para embeberlos en tus documentos PDF.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2 text-primary">
              <Info size={18} /> ¿Donde están mis datos?
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Toda la información reside en nuestros servidores seguros de Google Cloud, protegidos por autenticación de grado industrial.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Support */}
      <footer className="text-center pt-20 border-t border-outline-variant/10">
        <HelpCircle size={40} className="mx-auto text-primary/20 mb-4" />
        <p className="text-sm text-on-surface-variant">
          ¿Necesitas más ayuda? Contacta a soporte técnico o revisa el repositorio oficial.
        </p>
      </footer>
    </div>
  )
}
