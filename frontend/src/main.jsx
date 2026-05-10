import React from 'react'
import ReactDOM from 'react-dom/client'
<<<<<<< HEAD
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
=======
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
>>>>>>> fd93c5f9f9ccf11910c1378fbd675c1f50fa35dd
)
