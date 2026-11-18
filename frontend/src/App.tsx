import { useEffect, useState } from 'react'
import { ApiError, createReport as saveReport, currentStudent, errorMessage, listReports, login, logout, register, updateProfile } from './api'
import { AccountSettingsScreen } from './screens/AccountSettingsScreen'
import { HelpScreen } from './screens/HelpScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { NewReportScreen, type NewReportInput } from './screens/NewReportScreen'
import { NotificationsScreen } from './screens/NotificationsScreen'
import { PreferencesScreen, type Theme } from './screens/PreferencesScreen'
import { PrivacyScreen } from './screens/PrivacyScreen'
import { RegisterScreen } from './screens/RegisterScreen'
import { ReportDetailScreen } from './screens/ReportDetailScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { UsersScreen } from './screens/UsersScreen'
import type { Report, Student } from './screens/reportTypes'

type Screen = 'login' | 'register' | 'home' | 'reports' | 'settings' | 'create-report' | 'users' | 'report-detail' | 'account' | 'privacy' | 'notifications' | 'preferences' | 'help'

function getSavedTheme(): Theme {
  try {
    return localStorage.getItem('reportaya-theme') === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [student, setStudent] = useState<Student | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startupError, setStartupError] = useState('')
  const [theme, setTheme] = useState<Theme>(getSavedTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('reportaya-theme', theme)
    } catch {
      return
    }
  }, [theme])

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        const current = await currentStudent()
        const savedReports = await listReports()
        if (active) {
          setStudent(current)
          setReports(savedReports)
          setScreen('home')
        }
      } catch (error) {
        if (active && !(error instanceof ApiError && error.status === 401)) {
          setStartupError(errorMessage(error))
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void restoreSession()
    return () => {
      active = false
    }
  }, [])

  async function handleLogin(email: string, password: string) {
    const signedInStudent = await login(email, password)
    const savedReports = await listReports()
    setStudent(signedInStudent)
    setReports(savedReports)
    setStartupError('')
    setScreen('home')
  }

  async function handleRegister(name: string, controlNumber: string, email: string, password: string) {
    const newStudent = await register(name, controlNumber, email, password)
    setStudent(newStudent)
    setReports([])
    setStartupError('')
    setScreen('home')
  }

  async function handleLogout() {
    await logout()
    setStudent(null)
    setReports([])
    setScreen('login')
  }

  async function handleProfileUpdate(input: { name: string; currentPassword?: string; newPassword?: string }) {
    const updatedStudent = await updateProfile(input)
    setStudent(updatedStudent)
  }

  async function handleSubmitReport(input: NewReportInput) {
    const savedReport = await saveReport({
      category: input.category,
      location: input.location,
      description: input.description,
    }, input.photo)
    setReports((currentReports) => [savedReport, ...currentReports])
    setScreen('home')
  }

  if (isLoading) {
    return <main className="ry-loading-screen" role="status">Conectando con ReportaYa…</main>
  }

  if (!student) {
    if (screen === 'register') {
      return <RegisterScreen onCreateAccount={handleRegister} onLogin={() => setScreen('login')} />
    }

    return <LoginScreen initialError={startupError} onLogin={handleLogin} onRegister={() => setScreen('register')} />
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        onCreateReport={() => setScreen('create-report')}
        onManageUsers={() => setScreen('users')}
        onLogout={handleLogout}
        onOpenAccount={() => setScreen('account')}
        onOpenPrivacy={() => setScreen('privacy')}
        onOpenNotifications={() => setScreen('notifications')}
        onOpenPreferences={() => setScreen('preferences')}
        onOpenHelp={() => setScreen('help')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        student={student}
      />
    )
  }

  if (screen === 'account') {
    return (
      <AccountSettingsScreen
        onBack={() => setScreen('settings')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        onSave={handleProfileUpdate}
        student={student}
      />
    )
  }

  if (screen === 'privacy') {
    return (
      <PrivacyScreen
        onBack={() => setScreen('settings')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        student={student}
      />
    )
  }

  if (screen === 'notifications') {
    return (
      <NotificationsScreen
        onBack={() => setScreen('settings')}
        onOpenHome={() => setScreen('home')}
        onOpenReport={(reportId) => {
          setSelectedReportId(reportId)
          setScreen('report-detail')
        }}
        onOpenReports={() => setScreen('reports')}
        student={student}
      />
    )
  }

  if (screen === 'preferences') {
    return (
      <PreferencesScreen
        onBack={() => setScreen('settings')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        onThemeChange={setTheme}
        student={student}
        theme={theme}
      />
    )
  }

  if (screen === 'help') {
    return (
      <HelpScreen
        onBack={() => setScreen('settings')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        student={student}
      />
    )
  }

  if (screen === 'users' && student.role === 'administrador') {
    return (
      <UsersScreen
        currentUser={student}
        onBack={() => setScreen('settings')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
      />
    )
  }

  if (screen === 'report-detail' && selectedReportId) {
    return (
      <ReportDetailScreen
        onBack={() => setScreen('reports')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        onOpenSettings={() => setScreen('settings')}
        onUpdated={(updated) => setReports((current) => current.map((report) => report.id === updated.id ? updated : report))}
        reportId={selectedReportId}
        student={student}
      />
    )
  }

  if (screen === 'create-report' && student.role === 'alumno') {
    return (
      <NewReportScreen
        onCancel={() => setScreen('home')}
        onCreateReport={() => setScreen('create-report')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        onOpenSettings={() => setScreen('settings')}
        onSubmitReport={handleSubmitReport}
        student={student}
      />
    )
  }

  return (
    <HomeScreen
      onCreateReport={() => setScreen('create-report')}
      onOpenHome={() => setScreen('home')}
      onOpenReport={(reportId) => {
        setSelectedReportId(reportId)
        setScreen('report-detail')
      }}
      onOpenReports={() => setScreen('reports')}
      onOpenSettings={() => setScreen('settings')}
      reports={reports}
      showReports={screen === 'reports'}
      student={student}
    />
  )
}

export default App
