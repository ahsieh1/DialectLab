import { Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './features/auth/components/AuthProvider'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { LoginPage } from './features/auth/pages/LoginPage'
import { SignupPage } from './features/auth/pages/SignupPage'
import { LanguageSelectPage } from './features/language-select/pages/LanguageSelectPage'
import { ChatPage } from './features/chat/pages/ChatPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/languages"
          element={
            <ProtectedRoute>
              <LanguageSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:languageCode"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
