// dashboard-app/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'; // Importamos nuestro AuthProvider
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Envolvemos la App */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)