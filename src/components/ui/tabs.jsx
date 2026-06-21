import * as React from 'react'
import { cn } from '@/lib/utils'

const TabsContext = React.createContext({})

function Tabs({ value, onValueChange, defaultValue, className, children, ...props }) {
  const [internal, setInternal] = React.useState(defaultValue)
  const active = value !== undefined ? value : internal
  const setActive = onValueChange || setInternal
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn('', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }) {
  return (
    <div
      className={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, value, ...props }) {
  const { active, setActive } = React.useContext(TabsContext)
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        active === value ? 'bg-background text-foreground shadow' : 'hover:bg-background/50',
        className
      )}
      onClick={() => setActive(value)}
      {...props}
    />
  )
}

function TabsContent({ className, value, children, ...props }) {
  const { active } = React.useContext(TabsContext)
  if (active !== value) return null
  return <div className={cn('mt-2', className)} {...props}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
