import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.addEventListener('error', (event) => {
  document.body.innerHTML += `<div style="color:red; z-index:9999; position:absolute; top:0; background:white; padding:20px; border: 2px solid red;"><b>Error:</b> ${event.message}<br/>${event.filename}:${event.lineno}</div>`;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
