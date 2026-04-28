import { useState, useEffect } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AppTour() {
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Custom event listener for when a client is created
  useEffect(() => {
    const handleTourUpdate = () => {
      if (!user) return
      const phase = localStorage.getItem(`docflow_tour_phase_${user.id}`)
      if (phase === 'documents') {
        loadPhase('documents')
      }
    }
    window.addEventListener('docflow_tour_update', handleTourUpdate)
    return () => window.removeEventListener('docflow_tour_update', handleTourUpdate)
  }, [user])

  useEffect(() => {
    if (!user) return

    const storageKey = `docflow_tour_phase_${user.id}`
    let phase = localStorage.getItem(storageKey)
    
    // Initialize if never started
    if (!phase) {
      phase = 'settings'
      localStorage.setItem(storageKey, phase)
      if (location.pathname !== '/settings') {
        navigate('/settings')
      }
    }

    // Delay start slightly to let UI render
    const timer = setTimeout(() => {
      loadPhase(phase)
    }, 800)

    return () => clearTimeout(timer)
  }, [user, location.pathname]) // Re-check when route changes, in case they navigated to the right place

  const loadPhase = (phase) => {
    if (phase === 'settings') {
      if (location.pathname !== '/settings') {
        setRun(false)
        return
      }
      setSteps([
        {
          target: 'body',
          title: 'Paso 1: Configurar Cuenta',
          content: '¡Bienvenido a DocFlow! Para empezar, te guiaremos para configurar tu cuenta correctamente.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.tour-settings-logo',
          title: 'Logo y Firma',
          content: 'Aquí debes subir el logo de tu empresa y tu firma digital para que aparezcan en los documentos generados.',
          placement: 'bottom',
        },
        {
          target: '.tour-settings-data',
          title: 'Datos de la Empresa',
          content: 'Completa estos campos con la información básica y bancaria de tu negocio o perfil independiente.',
          placement: 'top',
        },
        {
          target: 'body',
          title: '¡Siguiente Paso!',
          content: 'Una vez hayas llenado tu información, vamos a crear tu primer cliente.',
          placement: 'center',
        }
      ])
      setRun(true)
    } 
    else if (phase === 'clients') {
      if (location.pathname !== '/clients') {
        setRun(false)
        return
      }
      setSteps([
        {
          target: 'body',
          title: 'Paso 2: Directorio de Clientes',
          content: '¡Excelente! Ahora estás en la sección de Clientes. Aquí administrarás a todas las empresas o personas a las que les cobras.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.tour-clients-new',
          title: 'Crear Cliente',
          content: 'Haz clic en "Nuevo Cliente", llena sus datos y presiona "Crear". El tour se reanudará automáticamente cuando finalices.',
          placement: 'bottom',
        }
      ])
      setRun(true)
    }
    else if (phase === 'documents') {
      if (location.pathname !== '/new/cuenta-cobro') {
        setRun(false)
        return
      }
      setSteps([
        {
          target: 'body',
          title: 'Paso 3: Tu Primer Documento',
          content: 'Has creado a tu cliente exitosamente. Ahora vamos a generar una Cuenta de Cobro real.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.tour-doc-client',
          title: 'Seleccionar Cliente',
          content: 'Haz clic aquí para seleccionar el cliente que acabas de crear. Los datos se autocompletarán.',
          placement: 'bottom',
        },
        {
          target: '.tour-doc-generate',
          title: 'Llenar y Generar',
          content: 'Llena los ítems a cobrar, verifica el resumen financiero y haz clic en "Generar PDF" en el último paso. ¡Eso es todo!',
          placement: 'top',
        }
      ])
      setRun(true)
    }
  }

  const handleJoyrideCallback = (data) => {
    const { status, action } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      const storageKey = `docflow_tour_phase_${user?.id}`
      const phase = localStorage.getItem(storageKey)

      if (phase === 'settings') {
        localStorage.setItem(storageKey, 'clients')
        navigate('/clients')
      } 
      else if (phase === 'clients') {
        // We wait for the user to actually create the client.
        // The ClientManager will set phase to 'documents' and navigate when done.
        localStorage.setItem(storageKey, 'clients_waiting')
      }
      else if (phase === 'documents') {
        // Done with everything
        localStorage.setItem(storageKey, 'done')
      }
    }
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Entendido',
        next: 'Siguiente',
        skip: 'Saltar Tour',
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#2563EB',
          textColor: '#334155',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
        },
        buttonClose: { display: 'none' },
        buttonSkip:  { color: '#64748b' },
        buttonNext:  { backgroundColor: '#2563EB', borderRadius: '8px', padding: '8px 16px' },
        buttonBack:  { marginRight: 10 },
        tooltipContainer: { textAlign: 'left' },
        tooltipTitle:     { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' },
        tooltipContent:   { fontSize: '14px', lineHeight: '1.5' }
      }}
    />
  )
}
