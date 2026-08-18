import type { ReactNode } from 'react'

/**
 * Centres the mobile experience and keeps it phone-shaped on desktop.
 * Gameplay never stretches to a desktop width.
 */
export const GameShell = ({ children }: { children: ReactNode }) => (
  <div className="app">
    <div className="app__backdrop" aria-hidden="true" />
    <main className="frame">{children}</main>
  </div>
)
