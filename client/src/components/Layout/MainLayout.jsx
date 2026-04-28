import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, History, Settings, HelpCircle,
  Users, Edit3, X, Menu, LogOut,
  Receipt, ScrollText, FileSignature, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { AppTour } from './AppTour'

/* ─── config ────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/history',   icon: History,         label: 'Documentos' },
  { to: '/clients',   icon: Users,           label: 'Clientes' },
  { to: '/settings',  icon: Settings,        label: 'Ajustes' },
  { to: '/help',      icon: HelpCircle,      label: 'Ayuda' },
]

const DOC_TYPES = [
  { label: 'Cuenta de Cobro', path: '/new/cuenta-cobro', icon: Receipt,       iconColor: '#2563EB', iconBg: '#EBF1FD' },
  { label: 'Cotización',       path: '/new/cotizacion',  icon: ScrollText,    iconColor: '#D97706', iconBg: '#FFFBEB' },
  { label: 'Contrato',         path: '/new/contrato',    icon: FileSignature, iconColor: '#7C3AED', iconBg: '#F5F3FF' },
]

const PAGE_TITLES = {
  '/dashboard':        'Inicio',
  '/history':          'Mis Documentos',
  '/new/cuenta-cobro': 'Cuenta de Cobro',
  '/new/cotizacion':   'Cotización',
  '/new/contrato':     'Contrato',
  '/settings':         'Ajustes',
  '/help':             'Ayuda',
  '/clients':          'Clientes',
}

/* ─── Sidebar ────────────────────────────────────────── */
function Sidebar({ open, onClose, user, company, navigate, logout }) {
  const location = useLocation()
  const displayName = company?.name || user?.name?.split(' ')[0] || 'Usuario'
  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden='true'
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Panel */}
      <aside
        role='navigation'
        aria-label='Menú principal'
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-[264px] bg-[#0F2040]',
          'lg:relative lg:translate-x-0',
          'transform transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className='flex items-center gap-3 px-5 h-14 border-b border-white/[0.07] flex-shrink-0'>
          <div className='w-8 h-8 rounded-[8px] bg-white/[0.12] flex items-center justify-center flex-shrink-0'>
            <Edit3 size={15} className='text-white' aria-hidden='true' />
          </div>
          <span
            className='text-white font-bold text-[16px] tracking-tight flex-1'
            translate='no'
          >
            DocFlow
          </span>
          <button
            onClick={onClose}
            aria-label='Cerrar menú'
            className='lg:hidden w-8 h-8 flex items-center justify-center rounded-[8px] text-white/40 hover:text-white hover:bg-white/10 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        {/* Create new */}
        <div className='px-3 pt-4 pb-2 tour-step-create'>
          <p className='section-label text-white/30 px-2 mb-2'>Crear</p>
          {DOC_TYPES.map(doc => (
            <button
              key={doc.path}
              onClick={() => { navigate(doc.path); onClose() }}
              className='w-full flex items-center gap-2.5 px-2 py-2.5 rounded-[12px] text-left group transition-colors hover:bg-white/[0.07] mb-0.5'
            >
              <span
                className='w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0'
                style={{ background: doc.iconBg }}
                aria-hidden='true'
              >
                <doc.icon size={14} style={{ color: doc.iconColor }} />
              </span>
              <span className='text-white/70 text-[13.5px] font-semibold flex-1 group-hover:text-white/90 transition-colors'>
                {doc.label}
              </span>
              <ChevronRight
                size={13}
                className='text-white/20 group-hover:text-white/40 transition-colors'
                aria-hidden='true'
              />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className='mx-3 h-px bg-white/[0.07]' />

        {/* Nav */}
        <nav className='flex-1 px-3 py-3 space-y-0.5 overflow-y-auto tour-step-nav'>
          <p className='section-label text-white/30 px-2 mb-2'>Navegación</p>
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[14px] font-semibold transition-colors',
                  isActive
                    ? 'bg-white/[0.12] text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                )}
              >
                <item.icon
                  size={17}
                  aria-hidden='true'
                  className={isActive ? 'text-white' : 'text-white/50'}
                />
                <span className='flex-1'>{item.label}</span>
                {isActive && (
                  <span className='w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0' aria-hidden='true' />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className='px-3 pb-4 border-t border-white/[0.07] pt-3 space-y-1 tour-step-settings'>
          <button
            onClick={() => { navigate('/settings'); onClose() }}
            className='w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] hover:bg-white/[0.07] transition-colors text-left'
          >
            <div className='w-8 h-8 rounded-[8px] bg-white/[0.15] flex items-center justify-center flex-shrink-0 text-white font-bold text-[13px] overflow-hidden'>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name ?? 'Avatar'} className='w-full h-full object-cover' />
                : initials
              }
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-white/85 text-[13px] font-bold truncate'>{displayName}</p>
              <p className='text-white/35 text-[11px] truncate'>{user?.email}</p>
            </div>
          </button>
          <button
            onClick={logout}
            className='w-full flex items-center gap-2 px-3 py-2 rounded-[12px] text-white/35 hover:text-red-400 hover:bg-white/[0.06] transition-colors text-[13px] font-semibold'
          >
            <LogOut size={15} aria-hidden='true' />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

/* ─── Bottom nav (mobile) ────────────────────────────── */
function BottomNav() {
  const location = useLocation()
  const items = NAV_ITEMS.slice(0, 4)
  return (
    <nav
      aria-label='Navegación móvil'
      className='lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className='flex items-center h-14'>
        {items.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className='flex-1 flex flex-col items-center justify-center gap-1 h-full'
            >
              <div className={cn(
                'w-9 h-7 flex items-center justify-center rounded-[12px] transition-all',
                isActive ? 'bg-[#E8EEF8]' : ''
              )}>
                <item.icon
                  size={20}
                  aria-hidden='true'
                  className={cn(isActive ? 'text-[#0F2040]' : 'text-gray-400')}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span className={cn(
                'text-[10px] font-semibold',
                isActive ? 'text-[#0F2040]' : 'text-gray-400'
              )}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

/* ─── Mobile header ──────────────────────────────────── */
function MobileHeader({ onMenu, title, user }) {
  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <header
      className='lg:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 h-14 flex-shrink-0'
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <button
        onClick={onMenu}
        aria-label='Abrir menú de navegación'
        className='w-9 h-9 flex items-center justify-center rounded-[12px] text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0'
      >
        <Menu size={20} aria-hidden='true' />
      </button>
      <p className='flex-1 font-bold text-gray-900 text-[15px] truncate' aria-live='polite'>
        {title}
      </p>
      <div
        className='w-8 h-8 rounded-[8px] bg-[#0F2040] flex items-center justify-center text-white text-[12px] font-bold overflow-hidden flex-shrink-0'
        aria-hidden='true'
      >
        {user?.avatarUrl
          ? <img src={user.avatarUrl} alt='' className='w-full h-full object-cover' />
          : initials
        }
      </div>
    </header>
  )
}

/* ─── Desktop page header ────────────────────────────── */
function DesktopHeader({ title, logout }) {
  return (
    <div className='hidden lg:flex items-center justify-between px-8 h-14 border-b border-gray-200 bg-white flex-shrink-0'>
      <h1 className='text-[17px] font-bold text-gray-900 tracking-tight'>{title}</h1>
      <button
        onClick={logout}
        className='flex items-center gap-2 text-[13px] text-gray-400 hover:text-red-500 transition-colors font-semibold px-3 py-1.5 rounded-[12px] hover:bg-red-50'
      >
        <LogOut size={15} aria-hidden='true' />
        Salir
      </button>
    </div>
  )
}

/* ─── Main Layout ────────────────────────────────────── */
export function MainLayout() {
  const { user, company, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const title = PAGE_TITLES[location.pathname] ?? 'DocFlow'

  return (
    <div className='flex h-[100dvh] overflow-hidden bg-[#F4F6FA]'>
      <AppTour />
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        company={company}
        navigate={navigate}
        logout={logout}
      />

      {/* Main area */}
      <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
        <MobileHeader
          onMenu={() => setSidebarOpen(true)}
          title={title}
          user={user}
        />
        <DesktopHeader title={title} logout={logout} />

        {/* Content */}
        <main
          id='main-content'
          className='flex-1 overflow-y-auto overscroll-contain'
          tabIndex={-1}
        >
          <div className='px-4 py-6 lg:px-8 lg:py-7 max-w-4xl mx-auto pb-24 lg:pb-10 w-full'>
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </div>

    </div>
  )
}
