import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import LoginPage from '@/pages/Login'
import DashboardPage from '@/pages/Dashboard'
import HistoryPage from '@/pages/History'
import ClientsPage from '@/pages/Clients'
import NewDocumentPage from '@/pages/NewDocument'
import SettingsPage from '@/pages/Settings'
import { MainLayout } from '@/components/Layout/MainLayout'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'history',   element: <HistoryPage /> },
          { path: 'clients',   element: <ClientsPage /> },
          { path: 'new/:type', element: <NewDocumentPage /> },
          { path: 'settings',  element: <SettingsPage /> },
        ]
      }
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
