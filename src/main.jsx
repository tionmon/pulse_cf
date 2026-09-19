import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

try {
  const storedTheme = window.localStorage.getItem('pulse-theme')
  if (storedTheme === 'night') {
    document.documentElement.dataset.theme = 'night'
    document.documentElement.style.colorScheme = 'dark'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#191714')
  }
} catch {
  // Preference storage is optional.
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
