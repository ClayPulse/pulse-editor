// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'

export function WrappedNextUIProvider({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
}