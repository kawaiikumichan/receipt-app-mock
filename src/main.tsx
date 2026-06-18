import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { InventoryProvider } from './contexts/InventoryContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ShoppingListProvider } from './contexts/ShoppingListContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <InventoryProvider>
        <ShoppingListProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ShoppingListProvider>
      </InventoryProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
