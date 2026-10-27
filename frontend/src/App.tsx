import { useState } from 'react'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { NewReportScreen } from './screens/NewReportScreen'
import { RegisterScreen } from './screens/RegisterScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { initialReports, type Report, type Student } from './screens/reportTypes'

type Screen = 'login' | 'register' | 'home' | 'reports' | 'settings' | 'create-report'

function nameFromEmail(email: string) {
  const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  return name
    ? name.split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : 'Estudiante'
}

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [student, setStudent] = useState<Student | null>(null)
  const [reports, setReports] = useState<Report[]>(initialReports)

  function handleLogin(email: string) {
    setStudent({
      name: nameFromEmail(email.trim()),
      email: email.trim(),
      controlNumber: 'Cuenta de demostración',
    })
    setScreen('home')
  }

  function handleRegister(name: string, controlNumber: string, email: string) {
    setStudent({ name, controlNumber, email })
    setScreen('home')
  }

  function handleLogout() {
    setStudent(null)
    setReports(initialReports)
    setScreen('login')
  }

  function handleSubmitReport(report: Omit<Report, 'id' | 'date'>) {
    setReports((currentReports) => [{
      ...report,
      id: `report-${Date.now()}`,
      date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    }, ...currentReports])
    setScreen('home')
  }

  if (!student) {
    if (screen === 'register') {
      return <RegisterScreen onCreateAccount={handleRegister} onLogin={() => setScreen('login')} />
    }

    return <LoginScreen onLogin={handleLogin} onRegister={() => setScreen('register')} />
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
