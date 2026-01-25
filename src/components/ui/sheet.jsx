import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const SheetContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const Sheet = ({ children, open: controlledOpen, onOpenChange, defaultOpen = false }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (value) => {
      if (!isControlled) {
        setUncontrolledOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const useSheet = () => React.useContext(SheetContext)

const SheetTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  const { setOpen } = useSheet()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(true)
      },
    })
  }

  return (
    <button ref={ref} onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  )
})
SheetTrigger.displayName = "SheetTrigger"

const SheetClose = React.forwardRef(({ children, asChild, ...props }, ref) => {
  const { setOpen } = useSheet()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(false)
      },
    })
  }

  return (
    <button ref={ref} onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  )
})
SheetClose.displayName = "SheetClose"

const SheetPortal = ({ children }) => {
  const { open } = useSheet()
  if (!open) return null

  return typeof document !== "undefined"
    ? React.createPortal(children, document.body)
    : null
}

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { setOpen } = useSheet()

  return (
    <div
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80 animate-in fade-in-0", className)}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
})
SheetOverlay.displayName = "SheetOverlay"

const sheetVariants = {
  top: "inset-x-0 top-0 border-b slide-in-from-top",
  bottom: "inset-x-0 bottom-0 border-t slide-in-from-bottom",
  left: "inset-y-0 left-0 h-full w-3/4 border-r slide-in-from-left sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 border-l slide-in-from-right sm:max-w-sm",
}

const SheetContent = React.forwardRef(
  ({ side = "right", className, children, ...props }, ref) => {
    const { open, setOpen } = useSheet()

    React.useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === "Escape") setOpen(false)
      }
      if (open) {
        document.addEventListener("keydown", handleEscape)
        document.body.style.overflow = "hidden"
      }
      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = ""
      }
    }, [open, setOpen])

    return (
      <SheetPortal>
        <SheetOverlay />
        <div
          ref={ref}
          className={cn(
            "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out animate-in",
            sheetVariants[side],
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
