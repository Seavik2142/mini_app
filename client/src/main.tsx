import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import Store from './Store.tsx'
import { RouterProvider } from 'react-router-dom'
import Routes from './routes.tsx'
import { init } from '@telegram-apps/sdk'
import { Toaster } from 'sonner'

import { CartProvider } from './context/CartContext'

try {
  init();
} catch (e) {
  console.log('Telegram SDK Init note: Running in browser environment');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Provider store={Store}>
        <CartProvider>
          <Toaster position="top-center" richColors theme="dark" />
          <RouterProvider router={Routes} />
        </CartProvider>
      </Provider>
    </div>
  </React.StrictMode>,
)
