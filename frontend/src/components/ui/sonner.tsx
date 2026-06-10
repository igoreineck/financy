import type { ComponentProps } from 'react'
import { Toaster as SonnerToaster } from 'sonner'

type ToasterProps = ComponentProps<typeof SonnerToaster>

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border border-gray-200 bg-white text-gray-800',
        },
      }}
      {...props}
    />
  )
}
