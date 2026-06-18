import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { InventoryProvider } from './contexts/InventoryContext'
import { NotificationProvider } from './contexts/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <InventoryProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </InventoryProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
