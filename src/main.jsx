import './index.css'
import App from './App';
import React from 'react'
import worker from './mock'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './../mock/mutator/auth.context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
const queryClient = new QueryClient();

worker.start();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CookiesProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </CookiesProvider>
  </React.StrictMode>,
)
