import {
  BookOpen, FileText, Users,
  HelpCircle, ArrowRight,
  Receipt, ScrollText, FileSignature, Building2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    step: 1,
    icon: Building2,
    title: 'Configure su empresa',
    desc: 'Ingrese su nombre, NIT, dirección y datos bancarios. Esto hace que sus PDFs sean personalizados y con aspecto profesional.',
    action: { label: 'Ir a Ajustes', path: '/settings' },
    iconBg: '#FEF3C7', iconColor: '#D97706',
  },
  {
    step: 2,
    icon: FileText,
    title: 'Cree su primer documento',
    desc: 'Desde el Inicio, elija el tipo de documento. El proceso está dividido en 3 pasos sencillos: datos del cliente, servicios y totales.',
    action: { label: 'Ir al Inicio', path: '/dashboard' },
    iconBg: '#EEF3FE', iconColor: '#2563EB',
  },
  {
    step: 3,
    icon: Users,
    title: 'Guarde sus clientes',
    desc: 'Registre los datos de sus clientes frecuentes una sola vez. Podrá seleccionarlos en futuros documentos sin volver a escribirlos.',
    action: { label: 'Ir a Clientes', path: '/clients' },
    iconBg: '#F5F3FF', iconColor: '#7C3AED',
  },
]

const DOC_TYPES = [
  {
    icon: Receipt,
    name: 'Cuenta de Cobro',
    desc: 'Para facturar servicios prestados. Muestra servicios, valor total y datos bancarios para el pago.',
    iconBg: '#EEF3FE', iconColor: '#2563EB',
  },
  {
    icon: ScrollText,
    name: 'Cotización',
    desc: 'Una propuesta de precios para un cliente. No es una obligación de pago, sino una oferta formal.',
    iconBg: '#FEF3C7', iconColor: '#D97706',
  },
  {
    icon: FileSignature,
    name: 'Contrato',
    desc: 'Documento legal para formalizar un acuerdo. Incluye cláusulas y espacio para firmas de ambas partes.',
    iconBg: '#F5F3FF', iconColor: '#7C3AED',
  },
]

const FAQS = [
  {
    q: '¿Puedo modificar un PDF ya generado?',
    a: 'No. Una vez generado, el PDF es definitivo para garantizar su integridad. Si necesita cambios, cree un nuevo documento desde cero.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Sus datos se guardan en servidores seguros y el acceso está protegido por Google. Nadie más puede ver sus documentos.',
  },
  {
    q: '¿Dónde están mis documentos anteriores?',
    a: 'En la sección "Mis Documentos". Desde allí puede descargarlos nuevamente en cualquier momento.',
  },
  {
    q: '¿Qué son IVA y Retención en la fuente?',
    a: 'El IVA es el impuesto al valor agregado (19%). La Retención es un porcentaje que el cliente descuenta del pago. Ambos se pueden activar en la sección de totales del documento.',
  },
]

export default function HelpPage() {
  const navigate = useNavigate()

  return (
    <div className='fade-in space-y-8 pb-24'>

      {/* ── Intro banner — navy inline (no class dependency) ── */}
      <section
        className='slide-up rounded-[12px] p-6'
        style={{ background: '#0F2040' }}
      >
        <div className='flex items-start gap-4 mb-4'>
          <div
            className='w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-[8px]'
            style={{ background: 'rgba(255,255,255,0.12)' }}
            aria-hidden='true'
          >
            <BookOpen size={20} className='text-white' />
          </div>
          <div>
            <h2 className='text-[17px] font-bold text-white leading-tight'>¿Cómo usar DocFlow?</h2>
            <p className='text-white/60 text-[13px] mt-0.5'>Guía paso a paso para comenzar</p>
          </div>
        </div>
        <p className='text-white/75 text-[14px] leading-relaxed'>
          DocFlow le permite crear documentos profesionales en PDF en pocos minutos,
          sin necesidad de conocimientos técnicos. Siga los pasos a continuación.
        </p>
      </section>

      {/* ── Steps ── */}
      <section className='slide-up delay-1' aria-labelledby='steps-heading'>
        <h2 id='steps-heading' className='text-[16px] font-bold text-gray-900 mb-4'>Primeros pasos</h2>
        <div className='space-y-3'>
          {STEPS.map(item => {
            const Icon = item.icon
            return (
              <div key={item.step} className='card p-5'>
                <div className='flex items-start gap-4'>
                  {/* Step number + icon */}
                  <div className='flex flex-col items-center gap-1.5 flex-shrink-0'>
                    <div
                      className='w-10 h-10 flex items-center justify-center rounded-[8px]'
                      style={{ background: item.iconBg }}
                      aria-hidden='true'
                    >
                      <Icon size={19} style={{ color: item.iconColor }} />
                    </div>
                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                      {item.step}
                    </span>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <h3 className='text-[15px] font-bold text-gray-900 leading-tight mb-1'>
                      {item.title}
                    </h3>
                    <p className='text-[13.5px] text-gray-500 leading-relaxed mb-3'>
                      {item.desc}
                    </p>
                    <button
                      onClick={() => navigate(item.action.path)}
                      className='inline-flex items-center gap-1.5 text-[#0F2040] font-bold text-[13px] hover:opacity-65 transition-opacity'
                    >
                      {item.action.label}
                      <ArrowRight size={14} aria-hidden='true' />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Doc types ── */}
      <section className='slide-up delay-2' aria-labelledby='doctypes-heading'>
        <h2 id='doctypes-heading' className='text-[16px] font-bold text-gray-900 mb-4'>Tipos de documento</h2>
        <div className='space-y-3'>
          {DOC_TYPES.map(item => {
            const Icon = item.icon
            return (
              <div key={item.name} className='card p-4 flex items-start gap-4'>
                <div
                  className='w-10 h-10 flex items-center justify-center rounded-[8px] flex-shrink-0'
                  style={{ background: item.iconBg }}
                  aria-hidden='true'
                >
                  <Icon size={19} style={{ color: item.iconColor }} />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-[15px] font-bold text-gray-900 leading-tight mb-1'>{item.name}</h3>
                  <p className='text-[13.5px] text-gray-500 leading-relaxed'>{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className='slide-up delay-3' aria-labelledby='faq-heading'>
        <h2 id='faq-heading' className='text-[16px] font-bold text-gray-900 mb-4'>Preguntas frecuentes</h2>
        <div className='space-y-3'>
          {FAQS.map((item, i) => (
            <div key={i} className='card p-4'>
              <div className='flex items-start gap-3'>
                <div
                  className='w-7 h-7 flex items-center justify-center rounded-[8px] flex-shrink-0 mt-0.5'
                  style={{ background: '#EEF3FE' }}
                  aria-hidden='true'
                >
                  <HelpCircle size={15} style={{ color: '#2563EB' }} />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-[14px] font-bold text-gray-900 leading-snug mb-1.5'>{item.q}</h3>
                  <p className='text-[13.5px] text-gray-500 leading-relaxed'>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <section className='text-center py-4 border-t border-gray-200' aria-hidden='true'>
        <HelpCircle size={28} className='text-gray-300 mx-auto mb-2' />
        <p className='text-[13px] text-gray-400'>¿Tiene alguna duda? Contacte a soporte técnico.</p>
      </section>
    </div>
  )
}
