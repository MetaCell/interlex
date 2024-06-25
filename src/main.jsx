import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { AuthProvider } from './../mock/mutator/auth.context';
import worker from './mock'
const queryClient = new QueryClient();
import * as serviceWorker from './serviceWorker';

if (process.env.NODE_ENV === 'development') {
  worker.start()
}
 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
)

serviceWorker.unregister();

