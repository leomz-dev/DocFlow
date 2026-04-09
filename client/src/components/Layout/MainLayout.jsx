import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, History, LogOut, Plus,
  ChevronDown, Receipt, FileSignature, ScrollText,
  Settings, Menu, X, Users, Edit3, HelpCircle,
  Bell, LayoutGrid, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup
} from '@/components/ui/dropdown-menu'

/* ─── Constants ─────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/history',   icon: History,         label: 'Historial' },
  { to: '/clients',   icon: Users,           label: 'Clientes' },
  { to: '/settings',  icon: Settings,        label: 'Configuración' },
  { to: '/help',      icon: HelpCircle,      label: 'Ayuda' },
]

const DOC_TYPES = [
  { label: 'Cuenta de Cobro', path: '/new/cuenta-cobro', icon: Receipt,       desc: 'Facturas de servicios', color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Cotización',       path: '/new/cotizacion',  icon: ScrollText,    desc: 'Propuestas comerciales', color: 'text-blue-600 bg-blue-50' },
  { label: 'Contrato',         path: '/new/contrato',    icon: FileSignature, desc: 'Contratos de servicio', color: 'text-violet-600 bg-violet-50' },
]

/* ─── Página activa label ────────────────────────── */
const PAGE_TITLES = {
  '/dashboard':        'Dashboard',
  '/history':          'Historial',
  '/new/cuenta-cobro': 'Nueva Cuenta de Cobro',
  '/new/cotizacion':   'Nueva Cotización',
  '/new/contrato':     'Nuevo Contrato',
  '/settings':         'Configuración',
  '/help':             'Documentación',
}

/* ─── Create Document Dropdown ───────────────────── */
function CreateDocButton() {
  const navigate = useNavigate()

  return (
    <div className="w-full">
      <DropdownMenu>
        <div className="flex w-full">
          <Button
            className="flex-1 py-3 h-auto bg-primary-container hover:bg-primary-container/90 text-white rounded-l-xl rounded-r-none font-semibold shadow-md flex items-center justify-center gap-2 transition-opacity px-3"
            onClick={() => navigate('/dashboard')}
          >
            <Plus size={16} />
            Crear Documento
          </Button>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className="py-3 h-auto w-10 shrink-0 rounded-l-none rounded-r-xl bg-primary-container hover:bg-primary-container/90 text-white shadow-md border-l border-white/20 transition-opacity"
            >
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent side="right" align="end" className="w-56 p-2 rounded-xl bg-surface-container-lowest border-outline-variant/15 shadow-surface-lg">
          <DropdownMenuLabel className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-2">Tipo de documento</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-outline-variant/15" />
          {DOC_TYPES.map((doc) => (
            <DropdownMenuItem
              key={doc.path}
              onClick={() => navigate(doc.path)}
              className="gap-3 cursor-pointer py-2.5 rounded-lg hover:bg-surface-container-low focus:bg-surface-container-low transition-colors"
            >
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', doc.color)}>
                <doc.icon size={16} />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-none text-on-surface">{doc.label}</span>
                <span className="text-xs text-on-surface-variant mt-1">{doc.desc}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* ─── Main Layout ────────────────────────────────── */
export function MainLayout() {
  const { user, company, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const displayName = company?.name || user?.email?.split('@')[0] || 'Usuario'
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'DocFlow'

  return (
    <div className="flex bg-surface text-on-surface overflow-hidden relative font-sans w-full min-h-screen">

      {/* ════ MOBILE OVERLAY ════ */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ════ SIDEBAR ════ */}
      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 flex flex-col w-64 shrink-0 bg-surface-container-highest md:bg-transparent border-r md:border-none border-outline-variant/20 transform transition-transform duration-300 ease-in-out p-4",
        isSidebarOpen ? "translate-x-0 bg-surface-container-highest" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile close button */}
        <button 
          className="md:hidden absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
            <Edit3 size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-surface leading-tight">DocFlow</h1>
            <p className="text-[10px] text-primary font-semibold uppercase tracking-widest leading-tight">Editorial Architect</p>
          </div>
        </div>

          {/* ── NAVIGATION ── */}
          <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all group relative",
                    isActive 
                      ? "bg-primary text-white shadow-primary-glow" 
                      : "text-on-surface-variant hover:bg-surface-container-high/50 hover:text-primary"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-primary/40 group-hover:text-primary"
                  )} />
                  <span className="font-sans tracking-tight">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </NavLink>
              )
            })}
          </div>

        {/* ── USER PROFILE ── */}
        <div className="mt-auto p-4 border-t border-outline-variant/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-surface-container-high transition-colors group">
                <Avatar className="h-10 w-10 ring-2 ring-primary/5 group-hover:ring-primary/20">
                  <AvatarFallback className="text-xs bg-primary text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 font-medium truncate uppercase tracking-wider">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-64 p-2 rounded-2xl bg-surface-container-lowest border-outline-variant/15 shadow-surface-lg">
              <DropdownMenuLabel className="font-normal px-3 py-3 border-b border-outline-variant/5 mb-1">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-on-surface">{displayName}</span>
                  <span className="text-[11px] text-on-surface-variant font-medium">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem
                  className="gap-3 cursor-pointer py-3 rounded-xl text-on-surface font-semibold hover:bg-surface-container-low transition-all"
                  onClick={() => navigate('/settings')}
                >
                  <Settings size={18} className="text-primary/70" /> Perfil y Ajustes
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-3 cursor-pointer py-3 rounded-xl text-on-surface font-semibold hover:bg-surface-container-low transition-all"
                  onClick={() => navigate('/clients')}
                >
                  <Users size={18} className="text-primary/70" /> Mis Clientes
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-outline-variant/5 mx-1" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={logout}
                  className="gap-3 cursor-pointer py-3 rounded-xl text-error font-bold hover:bg-error-container/20 hover:text-error transition-all"
                >
                  <LogOut size={18} /> Cerrar Sesión
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ════ RIGHT SIDE (Main Content Area) ════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">

        {/* ── MOBILE NAV (Bottom Bar) ── */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm h-16 bg-surface-container-high/80 backdrop-blur-xl border border-outline-variant/20 shadow-2xl rounded-3xl px-6 flex items-center justify-between">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative overflow-hidden",
                  isActive ? "text-primary scale-110" : "text-on-surface-variant/60"
                )}
              >
                <item.icon size={22} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]")} />
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </NavLink>
            )
          })}
        </nav>

        <main className="flex-1 w-full h-full overflow-y-auto pb-24 md:pb-8">
          <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {/* Page Title for Desktop */}
            <header className="mb-8 hidden md:block">
              <h2 className="text-3xl font-black text-on-surface tracking-tight font-sans">
                {pageTitle}
              </h2>
              <Separator className="mt-4 bg-outline-variant/10 w-24 h-1 rounded-full" />
            </header>

            {/* Mobile Title */}
            <header className="mb-6 md:hidden">
               <h2 className="text-2xl font-black text-on-surface tracking-tight font-sans">
                {pageTitle}
              </h2>
            </header>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}