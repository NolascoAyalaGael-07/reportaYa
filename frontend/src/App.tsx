import { useEffect, useState } from 'react'
import { ApiError, createReport as saveReport, currentStudent, errorMessage, listReports, login, logout, register } from './api'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { NewReportScreen } from './screens/NewReportScreen'
import { RegisterScreen } from './screens/RegisterScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import type { Report, Student } from './screens/reportTypes'

type Screen = 'login' | 'register' | 'home' | 'reports' | 'settings' | 'create-report'

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [student, setStudent] = useState<Student | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startupError, setStartupError] = useState('')

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

  async function handleSubmitReport(input: Omit<Report, 'id' | 'date'>) {
    const savedReport = await saveReport({
      category: input.category,
      location: input.location,
      description: input.description,
    })
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
        onLogout={handleLogout}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        student={student}
      />
    )
  }

  if (screen === 'create-report') {
    return (
      <NewReportScreen
        onCancel={() => setScreen('home')}
        onCreateReport={() => setScreen('create-report')}
        onOpenHome={() => setScreen('home')}
        onOpenReports={() => setScreen('reports')}
        onOpenSettings={() => setScreen('settings')}
        onSubmitReport={handleSubmitReport}
      />
    )
  }

  return (
    <HomeScreen
      onCreateReport={() => setScreen('create-report')}
      onOpenHome={() => setScreen('home')}
      onOpenReports={() => setScreen('reports')}
      onOpenSettings={() => setScreen('settings')}
      reports={reports}
      showReports={screen === 'reports'}
      student={student}
    />
  )
}

export default App
