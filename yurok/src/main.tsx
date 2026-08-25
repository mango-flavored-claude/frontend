import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RecoilRoot } from 'recoil'
import Root from './Root'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <Root />
    </RecoilRoot>
  </StrictMode>,
)
