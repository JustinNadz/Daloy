import * as React from "react"
import { cn } from "@/lib/utils"

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const Popover = ({ children, open: controlledOpen, onOpenChange, defaultOpen = false }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const triggerRef = React.useRef(null)

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
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  )
}

const usePopover = () => React.useContext(PopoverContext)

const PopoverTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  const { open, setOpen, triggerRef } = usePopover()

  const handleClick = (e) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref: (node) => {
        triggerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      },
      onClick: (e) => {
        children.props.onClick?.(e)
        handleClick(e)
      },
    })
  }

  return (
    <button
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { open, setOpen } = usePopover()
    const contentRef = React.useRef(null)

    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (contentRef.current && !contentRef.current.contains(e.target)) {
          setOpen(false)
        }
      }
      const handleEscape = (e) => {
        if (e.key === "Escape") setOpen(false)
      }
      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }, [open, setOpen])

    if (!open) return null

    return (
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "end" && "right-0",
          className
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

const PopoverClose = React.forwardRef(({ children, asChild, ...props }, ref) => {
  const { setOpen } = usePopover()

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
PopoverClose.displayName = "PopoverClose"

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }
