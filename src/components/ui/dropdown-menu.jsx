import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange, defaultOpen = false }) => {
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
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const useDropdownMenu = () => React.useContext(DropdownMenuContext)

const DropdownMenuTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenu()

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
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 4, align = "center", children, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenu()
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
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
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
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, children, onSelect, disabled, ...props }, ref) => {
    const { setOpen } = useDropdownMenu()

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          inset && "pl-8",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={(e) => {
          if (disabled) return
          onSelect?.(e)
          setOpen(false)
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef(
  ({ className, children, checked, onCheckedChange, ...props }, ref) => {
    const { setOpen } = useDropdownMenu()

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={() => {
          onCheckedChange?.(!checked)
          setOpen(false)
        }}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    )
  }
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef(
  ({ className, children, checked, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Circle className="h-2 w-2 fill-current" />}
      </span>
      {children}
    </div>
  )
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({ className, ...props }) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

const DropdownMenuGroup = ({ children }) => <div>{children}</div>
DropdownMenuGroup.displayName = "DropdownMenuGroup"

const DropdownMenuSub = ({ children }) => <div className="relative">{children}</div>
DropdownMenuSub.displayName = "DropdownMenuSub"

const DropdownMenuSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent hover:bg-accent",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </div>
  )
)
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
