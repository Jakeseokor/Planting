import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 아티팩트(claude.ai) 안에서는 주소창 해시를 쓸 수 없어 메모리 라우터를 쓴다
const Router = import.meta.env.MODE === 'artifact' ? MemoryRouter : HashRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
