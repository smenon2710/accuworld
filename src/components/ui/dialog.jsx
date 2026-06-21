import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const DialogContext = React.createContext({})

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children, asChild }) {
  const { onOpenChange } = React.useContext(DialogContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => onOpenChange(true) })
  }
  return <button onClick={() => onOpenChange(true)}>{children}</button>
}

function DialogPortal({ children }) {
  const { open } = React.useContext(DialogContext)
  if (!open) return null
  return <div className="fixed inset-0 z-50">{children}</div>
}

function DialogOverlay({ className, ...props }) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <div
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  )
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background shadow-lg',
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </DialogPortal>
  )
})
DialogContent.displayName = 'DialogContent'

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)} {...props} />
}

function DialogFooter({ className, ...props }) {
  return <div className={cn('flex justify-end gap-2 p-6 pt-4', className)} {...props} />
}

function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
