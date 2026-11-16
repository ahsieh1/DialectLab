import { Routes, Route, Navigate } from 'react-router'
import { LoginPage } from './features/auth/pages/LoginPage'
import { SignupPage } from './features/auth/pages/SignupPage'
import { LanguageSelectPage } from './features/language-select/pages/LanguageSelectPage'
import { ChatPage } from './features/chat/pages/ChatPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/languages" element={<LanguageSelectPage />} />
      <Route path="/chat/:languageCode" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
